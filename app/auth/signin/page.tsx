import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          반디기웃에 오신 것을 환영합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm type="signin" />
      </CardContent>
    </Card>
  );
}

