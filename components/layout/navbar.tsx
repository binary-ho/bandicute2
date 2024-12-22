'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen } from 'lucide-react';
import React from 'react';

export function Navbar() {
  const { member, fetchUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const reset = useAuth(state => state.reset);

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      reset();

      toast({
        title: "로그아웃 성공",
        description: "안녕히 가세요!",
      });
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Bandicute</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {member ? (
            <>
              {/* 스터디 버튼 */}
              <Button variant="ghost" asChild>
                <Link href="/studies">
                  <BookOpen className="mr-2 h-4 w-4" />
                  스터디
                </Link>
              </Button>
              {/* 프로필 버튼 */}
              <Button variant="ghost" asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </Link>
              </Button>
              {/* 로그아웃 버튼 */}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
