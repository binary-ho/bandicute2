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
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/50">
      <div className="max-w-[1440px] mx-auto flex h-16 items-center px-4">
        <div className="flex-shrink-0 -ml-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-gray-900">Bandicute</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end">
          {member ? (
            <>
              {/* 스터디 버튼 */}
              <Button variant="ghost" asChild>
                <Link href="/studies">
                  <BookOpen className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">스터디</span>
                </Link>
              </Button>
              {/* 프로필 버튼 */}
              <Button variant="ghost" asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">프로필</span>
                </Link>
              </Button>
              {/* 로그아웃 버튼 */}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-gray-600">로그아웃</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">
                <span className="text-gray-600">로그인</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
