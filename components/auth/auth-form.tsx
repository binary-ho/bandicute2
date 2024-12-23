'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/store/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fetchUser = useAuth(state => state.fetchUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (type === 'signin') {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          toast({ title: "이미 로그인되어 있습니다", description: "메인 페이지로 이동합니다." });
          router.replace('/');
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;

        await fetchUser();
        toast({ title: "로그인 성공", description: "환영합니다!" });
        router.replace('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/signin` },
        });

        if (error) throw error;

        toast({
          title: "회원가입 완료",
          description: "이메일을 확인하여 계정을 인증해주세요. 인증 후 로그인이 가능합니다.",
        });

        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Error:', error);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{type === 'signin' ? '로그인' : '회원가입'}</CardTitle>
        <CardDescription>
          {type === 'signin' 
            ? '반디기웃에 오신 것을 환영합니다.' 
            : '새로운 계정을 만들어 반디기웃를 시작하세요.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : type === 'signin' ? '로그인' : '회원가입'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === 'signin' ? (
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              회원가입
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              로그인
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

