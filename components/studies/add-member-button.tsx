'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AddMemberButtonProps {
  studyId: string;
}

export function AddMemberButton({ studyId }: AddMemberButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [tistoryBlog, setTistoryBlog] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 멤버 찾기
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('email', email)
        .single();

      if (memberError) {
        alert('해당 이메일을 가진 사용자를 찾을 수 없습니다.');
        return;
      }

      // 2. 이미 스터디 멤버인지 확인
      const { data: existingMember, error: existingError } = await supabase
        .from('study_members')
        .select('id')
        .eq('study_id', studyId)
        .eq('member_id', members.id)
        .single();

      if (existingMember) {
        alert('이미 스터디 멤버입니다.');
        return;
      }

      // 3. 스터디 멤버로 추가
      const { error: insertError } = await supabase
        .from('study_members')
        .insert({
          study_id: studyId,
          member_id: members.id,
          tistory_blog: tistoryBlog,
          folder_path: folderPath,
          is_leader: false,
        });

      if (insertError) throw insertError;

      setShowModal(false);
      // TODO: Refresh member list
    } catch (error) {
      console.error('Error adding member:', error);
      alert('멤버 추가 중 오류가 발생했습니다.');
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
        멤버 추가
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
                    새 멤버 추가
                  </h3>
                  <div className="mt-2">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          이메일
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="tistoryBlog"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Tistory 블로그 URL
                        </label>
                        <input
                          type="url"
                          name="tistoryBlog"
                          id="tistoryBlog"
                          required
                          placeholder="https://your-blog.tistory.com"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={tistoryBlog}
                          onChange={(e) => setTistoryBlog(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="folderPath"
                          className="block text-sm font-medium text-gray-700"
                        >
                          저장 폴더 경로
                        </label>
                        <input
                          type="text"
                          name="folderPath"
                          id="folderPath"
                          required
                          placeholder="docs/summaries/member-name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={folderPath}
                          onChange={(e) => setFolderPath(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  >
                    {loading ? '추가 중...' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
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
