'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Globe, ShoppingCart, User, MapPin, Search, Menu } from 'lucide-react'

export default function Header() {
  const [showSignInDropdown, setShowSignInDropdown] = useState(false)

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Navigation Bar - Alibaba Style */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            {/* Left Section - Delivery and Language */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Deliver to:</span>
                <span className="font-medium">🇲🇾 MY</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
                <Globe className="w-4 h-4" />
                <span>English-MYR</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Right Section - Account and Cart */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <Link href="/orders" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* Sign In with Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowSignInDropdown(true)}
                onMouseLeave={() => setShowSignInDropdown(false)}
              >
                <button 
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                  aria-haspopup="true"
                  aria-expanded={showSignInDropdown}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu */}
                {showSignInDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="p-6">
                      {/* Sign In CTA */}
                      <div className="mb-4">
                        <Link 
                          href="/login"
                          className="flex items-center justify-center w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors font-medium shadow-sm"
                        >
                          🔒 Sign In
                        </Link>
                      </div>

                      {/* Social Login */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm mb-3">Or sign in with:</p>
                        <div className="flex space-x-2">
                          <button className="flex-1 flex items-center justify-center py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <span className="text-blue-600 font-semibold text-sm">Facebook</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <span className="text-red-500 font-semibold text-sm">Google</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <span className="text-blue-700 font-semibold text-sm">LinkedIn</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">My Account</Link>
                          <Link href="/orders" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">Orders</Link>
                          <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">Messages</Link>
                          <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">RFQs</Link>
                          <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">Favorites</Link>
                          <Link href="/seller/plan" className="text-gray-600 hover:text-orange-500 py-1 transition-colors">Membership</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/register"
                className="bg-orange-500 text-white px-4 py-1.5 rounded hover:bg-orange-600 transition-colors font-medium shadow-sm text-sm"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Alibaba Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Muvex
              </Link>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                AI Sourcing
              </Link>
              <Link href="/dashboard/buyer" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Buyer Central
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Help Center
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                App & Extension
              </Link>
              <Link href="/register?type=supplier" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Become a Supplier
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md ml-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What are you looking for..."
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="What are you looking for..."
              className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}