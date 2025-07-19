import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { getSession } from '@/lib/auth'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'OGX - B2B Marketplace',
  description: 'Modular B2B marketplace platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header user={null} />
        {children}
      </body>
    </html>
  )
}