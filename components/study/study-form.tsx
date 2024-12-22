'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudyFormData {
  title: string;
  description: string;
  githubRepo: string;
  branch: string;
}

export function StudyForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    githubRepo: '',
    branch: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '스터디 생성에 실패했습니다.');
      }

      const study = await response.json();
      router.push(`/studies/${study.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">스터디 이름</Label>
        <Input
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="예: 알고리즘 스터디"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="스터디에 대한 설명을 입력해주세요."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="githubRepo">GitHub 저장소 URL</Label>
        <Input
          id="githubRepo"
          name="githubRepo"
          type="url"
          required
          value={formData.githubRepo}
          onChange={handleChange}
          placeholder="https://github.com/username/repository"
        />
        <p className="text-sm text-gray-500">
          블로그 요약이 저장될 GitHub 저장소 URL을 입력해주세요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">브랜치 이름</Label>
        <Input
          id="branch"
          name="branch"
          required
          value={formData.branch}
          onChange={handleChange}
          placeholder="예: main"
        />
        <p className="text-sm text-gray-500">
          요약이 저장될 브랜치 이름을 입력해주세요. 없는 경우 자동으로 생성됩니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? '생성 중...' : '스터디 생성'}
        </Button>
      </div>
    </form>
  );
}
