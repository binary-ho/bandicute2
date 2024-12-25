'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Study, StudyMember } from '@/types';
import { EditStudyButton } from './edit-study-button';

interface StudyWithMembers extends Study {
  study_members: (StudyMember & {
    members: {
      id: string;
      name: string;
      email: string;
    };
  })[];
}

interface StudyDetailsProps {
  studyId: string;
}

export function StudyDetails({ studyId }: StudyDetailsProps) {
  const [study, setStudy] = useState<StudyWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    async function fetchStudy() {
      try {
        const { data: study, error: studyError } = await supabase
          .from('studies')
          .select(`
            *, study_members!inner (
                member_id,
                is_leader,
                members (
                  id,
                  name,
                  email
                )
              )
          `)
          .eq('id', studyId)
          .single();

        if (studyError) throw studyError;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: authAccount } = await supabase
          .from('auth_accounts')
          .select('member_id')
          .eq('provider_id', user.id)
          .single();

        if (!authAccount) throw new Error('No member found');

        const isLeader = study.study_members.some(
          (member: StudyMember & { members: { id: string; name: string; email: string } }) => 
            member.member_id === authAccount.member_id && member.is_leader
        );

        setStudy(study);
        setIsLeader(isLeader);
      } catch (error) {
        console.error('Error fetching study:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudy();
  }, [studyId]);

  if (loading) return <div>로딩 중...</div>;
  if (!study) return <div>스터디를 찾을 수 없습니다.</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {study.title}
        </h1>
        <EditStudyButton study={study} isLeader={isLeader} />
      </div>
      <p className="mt-2 text-sm text-gray-500">{study.description}</p>
      <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">GitHub 저장소</dt>
          <dd className="mt-1 text-sm text-gray-900">{study.github_repo}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">브랜치</dt>
          <dd className="mt-1 text-sm text-gray-900">{study.branch}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">저장 디렉토리</dt>
          <dd className="mt-1 text-sm text-gray-900">{study.directory}</dd>
        </div>
      </dl>
    </div>
  );
}
