
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Globe, ShoppingCart, User, MapPin, Search, Menu } from 'lucide-react'

export default function Header() {
  const [showSignInDropdown, setShowSignInDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Gray like Alibaba */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs">
            {/* Left Section - Delivery and Language */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer">
                <MapPin className="w-3 h-3" />
                <span>Deliver to:</span>
                <span className="font-medium">🇲🇾 MY</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer">
                <Globe className="w-3 h-3" />
                <span>English-MYR</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Right Section - Cart and Account */}
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <ShoppingCart className="w-3 h-3" />
                <span>Cart</span>
              </Link>

              {/* Sign In with Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowSignInDropdown(true)}
                onMouseLeave={() => setShowSignInDropdown(false)}
              >
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                  <User className="w-3 h-3" />
                  <span>Sign In</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu */}
                {showSignInDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded shadow-lg border z-50">
                    <div className="p-3">
                      <Link 
                        href="/login"
                        className="block w-full bg-orange-500 text-white py-2 px-3 rounded text-center hover:bg-orange-600 mb-2 text-xs"
                      >
                        Sign In
                      </Link>
                      <div className="text-xs text-gray-600 space-y-1">
                        <Link href="/dashboard" className="block hover:text-orange-500">My Account</Link>
                        <Link href="/orders" className="block hover:text-orange-500">Orders</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/register"
                className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-600"
              >
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Black Header - Alibaba Style */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white mr-8">
              Muvex
            </Link>

            {/* Navigation Links - Alibaba Style */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1">
              <div className="flex items-center space-x-1 text-white hover:text-orange-400 cursor-pointer">
                <div className="w-4 h-4 bg-white bg-opacity-20 rounded flex items-center justify-center mr-1">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                <span className="text-sm">All categories</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <Link href="/dashboard" className="text-sm text-white hover:text-orange-400">
                AI sourcing agent
              </Link>
              <Link href="/dashboard/buyer" className="text-sm text-white hover:text-orange-400">
                Buyer Central
              </Link>
              <Link href="/dashboard" className="text-sm text-white hover:text-orange-400">
                Help Center
              </Link>
              <Link href="/dashboard" className="text-sm text-white hover:text-orange-400">
                App & extension
              </Link>
              <Link href="/register?type=supplier" className="text-sm text-white hover:text-orange-400">
                Become a supplier
              </Link>
            </nav>

            {/* Right Section - Alibaba Style */}
            <div className="hidden lg:flex items-center space-x-6 ml-8">
              <div className="flex items-center space-x-1 text-white hover:text-orange-400 cursor-pointer">
                <Globe className="w-4 h-4" />
                <span className="text-sm">English-MYR</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1 text-white hover:text-orange-400 cursor-pointer">
                <User className="w-4 h-4" />
                <span className="text-sm">Sign in</span>
              </div>
              <Link 
                href="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600"
              >
                Create account
              </Link>
              <div className="flex items-center space-x-1 text-white hover:text-orange-400 cursor-pointer">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>

            {/* Mobile Menu */}
            <button className="lg:hidden p-2 ml-4 text-white">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* White Navigation Bar - Alibaba Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Search Bar - Centered like Alibaba */}
            <div className="flex-1 max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What are you looking for..."
                  className="w-full pl-4 pr-12 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Navigation */}
            <div className="hidden lg:flex items-center space-x-8 ml-8">
              <Link href="/products" className="text-sm text-gray-700 hover:text-orange-500">Products</Link>
              <Link href="/services" className="text-sm text-gray-700 hover:text-orange-500">Services</Link>
              <Link href="/insights" className="text-sm text-gray-700 hover:text-orange-500">Insights</Link>
              <Link href="/login" className="text-sm text-gray-700 hover:text-orange-500">Sign In</Link>
              <Link href="/register" className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600">Join Free</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden px-4 py-3 bg-white border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="What are you looking for..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}
