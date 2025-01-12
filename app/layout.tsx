import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from '@/components/layout/navbar'
import { PageContainer } from '@/components/layout/page-container'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Bandicute | 반디기웃",
  description: "반디기웃에서 함께 성장하는 스터디 경험을 만나보세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50/80 via-white to-blue-50/80">
        <div className="relative flex min-h-screen flex-col backdrop-blur-3xl bg-white/30">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <Navbar />
          <main className="flex-1">
            <PageContainer>
              {children}
            </PageContainer>
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
