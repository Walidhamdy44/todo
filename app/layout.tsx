import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppLayout } from '@/components/layout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ProductiveAI - Personal Productivity Hub',
  description: 'A beautiful personal productivity todo website with tasks, courses, reading list, and goals tracking.',
  keywords: ['productivity', 'todo', 'tasks', 'courses', 'reading', 'goals'],
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  )
}