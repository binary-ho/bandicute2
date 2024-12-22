import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GitPullRequest, Users } from 'lucide-react';
import { HeroButton } from '@/components/home/hero-button';

const features = [
  { title: "친구들과 스터디!", icon: Users, description: "친구들을 스터디에 추가하세요." },
  { title: "열심히 작성한 최신 아티클 파싱", icon: BookOpen, description: "스터디원의 Tistory 블로그 최신 아티클을 자동으로 수집합니다." },
  { title: "귀여운 반디가 소개글을 써줄게요", icon: BookOpen, description: "(GPT의 힘을 조금 빌려..)" },
  { title: "GitHub PR 자동 생성", icon: GitPullRequest, description: "스터디의 Repository에 요약본을 Push하는 PR을 자동으로 생성합니다." },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
          Bandicute 
        </h1>
        <p className="text-sm text-gray-500">
          (반디 기웃 기웃 ㅋ)
        </p>
        <p className="text-xl text-gray-600 mt-6 leading-relaxed">
          친구들의 티스토리 블로그 최신 아티클을 요약하고, <br className="my-2" /> 
          GitHub Repository에 자동으로 공유하세요!
        </p>
        <HeroButton />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Card key={index} className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/50 backdrop-blur-sm border-slate-100">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 p-2 group-hover:from-slate-100 group-hover:to-blue-100 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-base text-gray-600">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
