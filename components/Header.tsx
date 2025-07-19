
'use client'

import Link from 'next/link'
import { useState } from 'react'

interface User {
  id: string
  email: string
  role: string
}

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="bg-gray-900 text-white">
      {/* Top Header Bar */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
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
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Sign in with Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <button className="flex items-center space-x-2 hover:text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Sign in</span>
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute top-full right-0 z-50 mt-2 w-72 bg-white rounded-lg shadow-lg text-gray-900 border">
                        <div className="p-4">
                          {/* Sign In CTA */}
                          <Link 
                            href="/login"
                            className="block w-full bg-orange-500 text-white text-center py-2 px-4 rounded-md font-medium hover:bg-orange-600 mb-4"
                          >
                            🔒 Sign In
                          </Link>

                          {/* Social Login Buttons */}
                          <div className="space-y-2 mb-4">
                            <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                              <span>f</span>
                              <span>Continue with Facebook</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                              <span>G</span>
                              <span>Continue with Google</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800">
                              <span>in</span>
                              <span>Continue with LinkedIn</span>
                            </button>
                          </div>

                          {/* Navigation Links */}
                          <div className="border-t pt-4 space-y-2 text-sm">
                            <Link href="/account" className="block hover:text-orange-500">My Account</Link>
                            <Link href="/orders" className="block hover:text-orange-500">Orders</Link>
                            <Link href="/messages" className="block hover:text-orange-500">Messages</Link>
                            <Link href="/rfqs" className="block hover:text-orange-500">RFQs</Link>
                            <Link href="/favorites" className="block hover:text-orange-500">Favorites</Link>
                            <Link href="/membership" className="block hover:text-orange-500">Membership Program</Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create account button */}
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
      <div className="bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-12 text-sm">
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
    </div>
  )
}
