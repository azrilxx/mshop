import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
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
      <body className={Inter.className}>
        <Header />
        {children}
      </body>
    </html>
  )
}