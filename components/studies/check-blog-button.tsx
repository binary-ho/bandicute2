'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Member } from '@/types';

interface CheckBlogButtonProps {
  studyId?: string;
  memberId?: string;
  member?: Member;
  variant?: 'outline' | 'secondary';
}

export function CheckBlogButton({
  studyId,
  memberId,
  member,
  variant,
}: CheckBlogButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      setLoading(true);

      // 요청 데이터 준비
      const requestData = {
        studyId,
        memberId: memberId || member?.id,
      };

      const response = await fetch('/api/cron/check-blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '블로그 체크 중 오류가 발생했습니다.');
      }

      const { results } = data;
      
      // 결과 메시지 생성
      let message = '';
      if (!results || results.length === 0) {
        message = '처리할 블로그 포스트가 없습니다.';
      } else {
        const successCount = results.filter(
          (r: any) => r.success
        ).length;
        const failCount = results.length - successCount;

        message = member 
          ? `${member.name}님의 블로그 포스트 ${results.length}개 중 ${successCount}개를 처리했습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`
          : `${results.length}개의 블로그 포스트 중 ${successCount}개를 처리했습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`;
      }

      toast({
        title: "블로그 체크 완료",
        description: message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'min-w-[120px] inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variant === 'outline'
          ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          : variant === 'secondary'
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      {loading ? '처리 중...' : member ? `${member.name}의 블로그 체크` : '전체 블로그 체크'}
    </button>
  );
}
