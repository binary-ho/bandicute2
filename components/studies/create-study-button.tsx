'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export function CreateStudyButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [directory, setDirectory] = useState('blog-posts');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 현재 인증된 사용자 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 2. auth_accounts를 통해 member_id 가져오기
      const { data: authAccount, error: authError } = await supabase
        .from('auth_accounts')
        .select('member_id')
        .eq('provider_id', user.id)
        .single();

      if (authError) throw authError;
      if (!authAccount) throw new Error('Member not found');

      // 3. 스터디 생성
      const { data: study, error: studyError } = await supabase
        .from('studies')
        .insert({
          title,
          description,
          github_repo: githubRepo,
          branch,
          directory,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (studyError) throw studyError;
      if (!study) throw new Error('Study not created');

      // 4. 스터디 멤버로 생성자 추가 (리더로)
      const { error: studyMemberError } = await supabase
        .from('study_members')
        .insert({
          study_id: study.id,
          member_id: authAccount.member_id,
          is_leader: true,
          folder_path: '/',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (studyMemberError) throw studyMemberError;

      toast({
        title: "스터디 생성 완료",
        description: "스터디가 성공적으로 생성되었습니다.",
      });

      setShowModal(false);
      router.refresh();
      router.push(`/studies/${study.id}`);
    } catch (error) {
      console.error('Error creating study:', error);
      toast({
        variant: "destructive",
        title: "스터디 생성 실패",
        description: error instanceof Error ? error.message : "스터디 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        스터디 생성
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    새 스터디 생성
                  </h3>
                  <div className="mt-2">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          스터디명
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          설명
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="githubRepo"
                          className="block text-sm font-medium text-gray-700"
                        >
                          GitHub 저장소
                        </label>
                        <input
                          type="text"
                          name="githubRepo"
                          id="githubRepo"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="owner/repository"
                          value={githubRepo}
                          onChange={(e) => setGithubRepo(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="branch"
                          className="block text-sm font-medium text-gray-700"
                        >
                          브랜치
                        </label>
                        <input
                          type="text"
                          name="branch"
                          id="branch"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="directory" className="block text-sm font-medium text-gray-700">
                          저장 디렉토리
                        </label>
                        <input
                          type="text"
                          id="directory"
                          value={directory}
                          onChange={(e) => setDirectory(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="blog-posts"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  >
                    {loading ? '생성 중...' : '생성'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
