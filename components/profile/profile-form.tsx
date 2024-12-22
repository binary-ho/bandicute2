'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
// import type { Member } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() {
  // const [member, setMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [tistoryBlog, setTistoryBlog] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: authAccount, error: authError } = await supabase
          .from('auth_accounts')
          .select('member_id')
          .eq('provider_id', user.id)
          .single();

        if (authError) throw authError;
        if (!authAccount) throw new Error('Member not found');

        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', authAccount.member_id)
          .single();

        if (error) throw error;

        if (data) {
          // setMember(data);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

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
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tistoryBlog">Tistory 블로그 URL</Label>
        <Input
          type="url"
          id="tistoryBlog"
          placeholder="https://your-blog.tistory.com"
          value={tistoryBlog}
          onChange={(e) => setTistoryBlog(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
}
