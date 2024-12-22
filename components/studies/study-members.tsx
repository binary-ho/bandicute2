'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckBlogButton } from './check-blog-button';
import { CheckMemberBlogButton } from './check-member-blog-button';
import { useToast } from '@/hooks/use-toast';
import type { Member } from '@/types';

interface StudyMembersProps {
  studyId: string;
}

export function StudyMembers({ studyId }: StudyMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMembers() {
      try {
        // 스터디 멤버 조회
        const { data: studyMembers, error: studyMemberError } = await supabase
          .from('study_members')
          .select('member_id')
          .eq('study_id', studyId);

        if (studyMemberError) throw studyMemberError;

        if (!studyMembers?.length) {
          setMembers([]);
          return;
        }

        // 멤버 정보 조회
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .in('id', studyMembers.map(sm => sm.member_id));

        if (memberError) throw memberError;
        setMembers(memberData || []);
      } catch (error) {
        console.error('Error fetching study members:', error);
        toast({
          variant: "destructive",
          title: "멤버 조회 실패",
          description: "스터디 멤버 정보를 불러오는데 실패했습니다.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [studyId, toast]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            멤버별 블로그 체크
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            각 멤버의 블로그를 개별적으로 체크하거나, 전체 멤버의 블로그를 한 번에 체크할 수 있습니다.
          </p>
        </div>
        <CheckBlogButton studyId={studyId} />
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      이름
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      이메일
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      블로그 URL
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.tistory_blog ? (
                          <a
                            href={member.tistory_blog}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {member.tistory_blog}
                          </a>
                        ) : (
                          '등록된 블로그가 없습니다'
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <CheckMemberBlogButton
                          studyId={studyId}
                          memberId={member.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
