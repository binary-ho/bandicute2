import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Bandicute | 반디큐트",
  description: "반디큐트에서 함께 성장하는 스터디 경험을 만나보세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans antialiased">
        <div className="relative flex min-h-screen flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar />
          <main className="flex-1 pt-20">
            {children}
          </main>
        </div>
        <Toaster className="z-50" />
      </body>
    </html>
  )
}
