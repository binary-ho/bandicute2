'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Study } from '@/types';

interface StudyDetailsProps {
  studyId: string;
}

export function StudyDetails({ studyId }: StudyDetailsProps) {
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudy() {
      try {
        const { data, error } = await supabase
          .from('studies')
          .select('*')
          .eq('id', studyId)
          .single();

        if (error) throw error;
        setStudy(data);
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
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {study.title}
      </h1>
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
