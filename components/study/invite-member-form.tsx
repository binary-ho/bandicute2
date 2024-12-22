'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InviteMemberFormProps {
  studyId: string;
  onInviteSuccess?: () => void;
}

export function InviteMemberForm({ studyId, onInviteSuccess }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/studies/${studyId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          folderPath,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '멤버 초대에 실패했습니다.');
      }

      setEmail('');
      setFolderPath('');
      onInviteSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="초대할 멤버의 이메일을 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="folderPath">폴더 경로</Label>
        <Input
          id="folderPath"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="예: members/username"
        />
        <p className="text-sm text-gray-500">
          멤버의 블로그 요약이 저장될 폴더 경로입니다. 비워두면 기본 경로가 사용됩니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? '초대 중...' : '멤버 초대'}
        </Button>
      </div>
    </form>
  );
}
