'use client'

import { useRouter } from 'next/navigation'
import { Button } from './button'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  onClick?: () => void
}

export function BackButton({
  className,
  variant = 'ghost',
  size = 'default',
  onClick,
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    router.back()
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'flex items-center gap-1 hover:bg-gray-100/80',
        className
      )}
      onClick={handleClick}
      aria-label="뒤로 가기"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">뒤로 가기</span>
    </Button>
  )
}
