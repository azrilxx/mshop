
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        onClose()
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Facebook
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                LinkedIn
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-orange-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>
          </p>

          {/* Account Features */}
          <div className="mt-6 border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Your account includes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>• My Muvex</div>
              <div>• Orders</div>
              <div>• Messages</div>
              <div>• RFQs</div>
              <div>• Favorites</div>
              <div>• Account Settings</div>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                onClose()
                router.push('/register')
              }}
              className="text-orange-500 hover:underline font-medium"
            >
              Join Free
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
