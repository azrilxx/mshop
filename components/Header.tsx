'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [showSignInDropdown, setShowSignInDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Gray like Alibaba */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-gray-600">Deliver to Global</span>
              <span className="text-gray-600">Language: English - USD</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/help" className="text-gray-600 hover:text-orange-500">
                Help Center
              </Link>
              <Link href="/download" className="text-gray-600 hover:text-orange-500">
                Get the app
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setShowSignInDropdown(!showSignInDropdown)}
                  className="text-gray-600 hover:text-orange-500 flex items-center"
                >
                  Sign In
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {showSignInDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign In
                    </Link>
                    <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Join Free
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/cart" className="text-gray-600 hover:text-orange-500">
                Cart (0)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - White like Alibaba */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-500">Muvex</span>
            </Link>

            {/* Secondary Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/sourcing" className="text-gray-700 hover:text-orange-500 font-medium">
                AI Sourcing Agent
              </Link>
              <Link href="/buyer-central" className="text-gray-700 hover:text-orange-500 font-medium">
                Buyer Central
              </Link>
              <Link href="/seller" className="text-gray-700 hover:text-orange-500 font-medium">
                Become a Supplier
              </Link>
              <Link href="/insights" className="text-gray-700 hover:text-orange-500 font-medium">
                Industry Insights
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}