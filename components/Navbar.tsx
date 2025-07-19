'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/db'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Muvex</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/shop" className="nav-link">
              Marketplace
            </Link>
            <Link href="/products" className="nav-link">
              Products
            </Link>
            {user && (
              <Link href="/orders" className="nav-link">
                Orders
              </Link>
            )}

            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="nav-link flex items-center">
                Categories
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                <div className="py-2">
                  <Link href="/shop?category=Flanges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Flanges</Link>
                  <Link href="/shop?category=Rope Access Equipment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Rope Access Equipment</Link>
                  <Link href="/shop?category=Subsea Connectors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Subsea Connectors</Link>
                  <Link href="/shop?category=Pipe Cleaning Tools" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pipe Cleaning Tools</Link>
                  <Link href="/shop?category=Pressure Testing Units" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pressure Testing Units</Link>
                  <Link href="/shop?category=Rental Tanks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Rental Tanks</Link>
                  <Link href="/shop?category=Measurement & Instrumentation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Measurement & Instrumentation</Link>
                  <Link href="/shop?category=home" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Home & Garden</Link>
                  <Link href="/shop?category=sports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sports</Link>
                </div>
              </div>
            </div>
            <Link href="/services" className="nav-link">
              Services
            </Link>
            <Link href="/insights" className="nav-link">
              Insights
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, categories, or brands..."
                className="search-input"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="search-dropdown">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Popular Searches</div>
                    <Link href="/shop?q=electronics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Electronics</Link>
                    <Link href="/shop?q=laptops" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Laptops</Link>
                    <Link href="/shop?q=smartphones" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Smartphones</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <button className="btn-ghost relative">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a6 6 0 100-8.485M9 12l2 2 4-4m2-8a6 6 0 11-8.485 8.485" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 group">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-500">Signed in as</div>
                      <div className="px-4 py-1 text-sm font-medium text-gray-900 border-b border-gray-100">{user.email}</div>

                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>

                      {user.role === 'seller' && (
                        <Link href="/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Seller Center
                          </span>
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Admin Panel
                          </span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {loading ? 'Signing out...' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden btn-ghost"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              <Link href="/shop" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Marketplace</Link>
              <Link href="/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Products</Link>
              {user && (
                <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Orders</Link>
              )}
              <Link href="/services" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Services</Link>
              <Link href="/insights" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Insights</Link>
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-4">
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}