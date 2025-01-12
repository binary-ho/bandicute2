'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen, Github } from 'lucide-react';
import React from 'react';
import { features } from '@/config/features';

export function Navbar() {
  const { member, fetchUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const reset = useAuth(state => state.reset);

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
      <div className="max-w-[1440px] mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0">
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
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
              {/* Github 버튼 */}
              {features.showGithubButton && (
                <div className="ml-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full border-gray-300 hover:border-gray-400 hover:bg-gray-100/50 w-8 h-8 p-0" 
                    asChild
                  >
                    <Link 
                      href={features.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <Github className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
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
