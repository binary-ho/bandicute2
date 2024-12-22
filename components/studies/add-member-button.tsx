'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

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
      <Button
        variant="secondary"
        onClick={() => setShowModal(true)}
        className="w-full"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        멤버 추가
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">새로운 멤버 추가</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  티스토리 블로그 URL
                </label>
                <input
                  type="url"
                  value={tistoryBlog}
                  onChange={(e) => setTistoryBlog(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  폴더 경로
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '추가 중...' : '추가하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
