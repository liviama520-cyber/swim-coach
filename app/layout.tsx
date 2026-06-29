import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '韩艺游泳教练',
  description: 'Cyber Swim Coach for Han Yi',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        <Nav />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
