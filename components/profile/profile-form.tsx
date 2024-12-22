'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Member } from '@/types';
import { useToast } from "@/hooks/use-toast";

export function ProfileForm() {
  const [member, setMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [tistoryBlog, setTistoryBlog] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      try {
        // 1. 현재 인증된 사용자 가져오기
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. auth_accounts를 통해 member_id 가져오기
        const { data: authAccount, error: authError } = await supabase
          .from('auth_accounts')
          .select('member_id')
          .eq('provider_id', user.id)
          .single();

        if (authError) throw authError;
        if (!authAccount) throw new Error('Member not found');

        // 3. members 테이블에서 사용자 정보 가져오기
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', authAccount.member_id)
          .single();

        if (error) throw error;

        if (data) {
          setMember(data);
          setName(data.name || '');
          setTistoryBlog(data.tistory_blog || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "프로필 로딩 실패",
          description: error instanceof Error ? error.message : "프로필을 불러오는 중 오류가 발생했습니다.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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

      const updates = {
        name,
        tistory_blog: tistoryBlog,
        updated_at: new Date().toISOString(),
      };

      // 3. members 테이블 업데이트
      const { error: updateError } = await supabase
        .from('members')
        .update(updates)
        .eq('id', authAccount.member_id);

      if (updateError) throw updateError;

      toast({
        title: "프로필 저장 완료",
        description: "프로필이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "프로필 저장 실패",
        description: error instanceof Error ? error.message : "프로필 저장 중 오류가 발생했습니다.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          이름
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://your-blog.tistory.com"
          value={tistoryBlog}
          onChange={(e) => setTistoryBlog(e.target.value)}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
