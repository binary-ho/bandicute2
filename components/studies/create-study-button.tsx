'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: authAccount, error: authError } = await supabase
        .from('auth_accounts')
        .select('member_id')
        .eq('provider_id', user.id)
        .single();

      if (authError) throw authError;
      if (!authAccount) throw new Error('Member not found');

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
      <Button onClick={() => setShowModal(true)}>
        <Plus className="mr-2 h-4 w-4" />
        스터디 생성
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    새 스터디 생성
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">스터디명</Label>
                      <Input
                        type="text"
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <Textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubRepo">GitHub 저장소</Label>
                      <Input
                        type="text"
                        id="githubRepo"
                        required
                        placeholder="owner/repository"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">브랜치</Label>
                      <Input
                        type="text"
                        id="branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="directory">저장 디렉토리</Label>
                      <Input
                        type="text"
                        id="directory"
                        value={directory}
                        onChange={(e) => setDirectory(e.target.value)}
                        placeholder="blog-posts"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                  <Button type="submit" disabled={loading} className="sm:ml-2">
                    {loading ? '생성 중...' : '생성'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
