'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import LoginModal from './LoginModal'
import { User } from '@/lib/db'

interface NavbarProps {
  user?: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Top Header Bar */}
      <div className="bg-gray-800 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            {/* Left side - Deliver to */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Deliver to:</span>
              <div className="flex items-center space-x-1">
                <span className="text-xs">🇲🇾</span>
                <span className="font-medium">MY</span>
              </div>
            </div>

            {/* Right side - Language, Cart, Sign in, Create account */}
            <div className="flex items-center space-x-6">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>English-MYR</span>
              </div>

              {/* Cart */}
              <Link href="/cart" className="hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                </svg>
              </Link>

              {/* User Section */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="text-orange-400 hover:text-orange-300 disabled:opacity-50"
                  >
                    {loading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center space-x-2 hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Sign in</span>
                  </button>
                  <Link 
                    href="/register"
                    className="bg-orange-500 text-white px-4 py-1.5 rounded-full hover:bg-orange-600 font-medium transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-12">
            <Link href="/ai-sourcing" className="hover:text-orange-400 transition-colors">
              AI sourcing agent
            </Link>
            <Link href="/buyer-central" className="hover:text-orange-400 transition-colors">
              Buyer Central
            </Link>
            <Link href="/help" className="hover:text-orange-400 transition-colors">
              Help Center
            </Link>
            <Link href="/app" className="hover:text-orange-400 transition-colors">
              App & extension
            </Link>
            <Link href="/become-supplier" className="hover:text-orange-400 transition-colors">
              Become a supplier
            </Link>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  )
}