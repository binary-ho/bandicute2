import { StudyList } from '@/components/studies/study-list';
import { CreateStudyButton } from '@/components/studies/create-study-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StudiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">스터디</CardTitle>
            <CardDescription>
              블로그 요약을 공유할 스터디 목록입니다.
            </CardDescription>
          </div>
          <CreateStudyButton />
        </CardHeader>
        <CardContent>
          <StudyList />
        </CardContent>
      </Card>
    </div>
  );
}

