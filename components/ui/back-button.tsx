'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from './button'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  onClick?: () => void
  fallbackPath?: string
}

export function BackButton({
  variant = 'ghost',
  size = 'lg',
  onClick,
}: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    const parentPath = getParentPath(pathname)
    router.push(parentPath)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'flex items-center gap-1 hover:bg-gray-100/80',
        "ml-[-2.5rem] mt-3"
      )}
      onClick={handleClick}
      aria-label="뒤로 가기"
    >
      <ChevronLeft className="h-7 w-7" />
      <span className="sr-only">뒤로 가기</span>
    </Button>
  )
}

function getParentPath(pathname: string): string {
  const basePath = '/'
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length <= 1) {
    return basePath
  }
  return basePath + pathSegments.slice(0, -1).join('/')
}