import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          새로운 계정을 만들어 반디기웃를 시작하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm type="signup" />
      </CardContent>
    </Card>
  );
}

