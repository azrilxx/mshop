
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Globe, ShoppingCart, User, MapPin, Search, Menu } from 'lucide-react'

export default function Header() {
  const [showSignInDropdown, setShowSignInDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Top Navigation Bar - Alibaba Style */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between h-9 text-xs">
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

        {/* Secondary Navigation */}
        <div className="bg-white">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-orange-500 mr-8">
              Muvex
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1">
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-orange-500">
                AI Sourcing
              </Link>
              <Link href="/dashboard/buyer" className="text-sm text-gray-700 hover:text-orange-500">
                Buyer Central
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-orange-500">
                Help Center
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-orange-500">
                App & Extension
              </Link>
              <Link href="/register?type=supplier" className="text-sm text-gray-700 hover:text-orange-500">
                Become a Supplier
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg ml-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What are you looking for..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center space-x-6 ml-8">
              <Link href="/products" className="text-sm text-gray-700 hover:text-orange-500">Products</Link>
              <Link href="/services" className="text-sm text-gray-700 hover:text-orange-500">Services</Link>
              <Link href="/insights" className="text-sm text-gray-700 hover:text-orange-500">Insights</Link>
              <Link href="/login" className="text-sm text-gray-700 hover:text-orange-500">Sign In</Link>
              <Link href="/register" className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600">Join Free</Link>
            </div>

            {/* Mobile Menu */}
            <button className="lg:hidden p-2 ml-4">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
