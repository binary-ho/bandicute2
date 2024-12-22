import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, GitPullRequest, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          블로그 요약 협업 도구
        </h1>
        <p className="text-xl text-muted-foreground">
          팀원들의 블로그 포스팅을 자동으로 요약하고 GitHub를 통해 공유하세요.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/signup">
            시작하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Tistory RSS 파싱", icon: BookOpen, description: "블로그 포스트를 자동으로 수집합니다." },
          { title: "GPT 요약", icon: BookOpen, description: "AI를 활용해 포스트를 간결하게 요약합니다." },
          { title: "GitHub PR 생성", icon: GitPullRequest, description: "요약된 내용을 자동으로 PR로 생성합니다." },
          { title: "스터디 그룹 관리", icon: Users, description: "팀원들과 함께 학습 진도를 관리합니다." },
        ].map((feature, index) => (
          <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
