'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미 처리 중이면 중복 요청 방지
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      if (type === 'signin') {
        // 현재 세션 확인
        const { data: { session } } = await supabase.auth.getSession();
        
        // 세션이 있으면 바로 리다이렉트
        if (session) {
          toast({
            title: "이미 로그인되어 있습니다",
            description: "메인 페이지로 이동합니다.",
          });
          router.replace('/');
          return;
        }

        // 로그인 시도
        const { data, error } = await supabase.auth.signInWithPassword({
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

        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        
        router.replace('/');
        return;  
      } else {
        // 회원가입 처리
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
        title: "오류 발생",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '처리 중...' : type === 'signin' ? '로그인' : '회원가입'}
        </button>

        <div className="text-sm text-center">
          {type === 'signin' ? (
            <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">
              계정이 없으신가요? 회원가입
            </Link>
          ) : (
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
              이미 계정이 있으신가요? 로그인
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
