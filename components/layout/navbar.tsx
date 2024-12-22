'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, member } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "로그아웃 성공",
        description: "안녕히 가세요!",
      });
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "로그아웃 실패",
        description: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">Bandicute</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 검색 기능이 필요하다면 여기에 추가 */}
          </div>
          <nav className="flex items-center space-x-4">
            {member ? (
              <>
                <Link
                  href="/studies"
                  className="text-sm font-medium hover:text-primary"
                >
                  스터디
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium hover:text-primary"
                >
                  프로필
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-destructive hover:text-destructive/80"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium hover:text-primary"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}
