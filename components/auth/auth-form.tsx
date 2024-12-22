'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/store/auth';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const fetchUser = useAuth(state => state.fetchUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      if (type === 'signin') {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          toast({
            title: "이미 로그인되어 있습니다",
            description: "메인 페이지로 이동합니다.",
          });
          router.replace('/');
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('rate limit')) {
            throw new Error('잠시 후 다시 시도해주세요');
          }
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
          }
          throw error;
        }

        // 로그인 성공 시 사용자 정보 새로고침
        await fetchUser();

        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        
        router.replace('/');
        return;  
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/signin`,
          },
        });

        if (authError) {
          if (authError.message.includes('rate limit')) {
            throw new Error('잠시 후 다시 시도해주세요');
          }
          throw authError;
        }
        
        if (!data.user) throw new Error('User not created');

        toast({
          title: "회원가입 완료",
          description: "이메일을 확인하여 계정을 인증해주세요. 인증 후 로그인이 가능합니다.",
        });

        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error instanceof Error 
          ? error.message
          : '알 수 없는 오류가 발생했습니다'
      );
      
      toast({
        variant: "destructive",
        title: type === 'signin' ? "로그인 실패" : "회원가입 실패",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? (
          <span>처리 중...</span>
        ) : type === 'signin' ? (
          <span>로그인</span>
        ) : (
          <span>회원가입</span>
        )}
      </button>
      <div className="text-center text-sm">
        {type === 'signin' ? (
          <>
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              로그인
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
