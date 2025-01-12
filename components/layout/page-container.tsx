'use client'

import { BackButton } from '@/components/ui/back-button'
import { usePathname } from 'next/navigation'

interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  const pathname = usePathname()
  const isNotMainPage = pathname !== '/'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {isNotMainPage && <BackButton />}
      {children}
    </div>
  )
}
