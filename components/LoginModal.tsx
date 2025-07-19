
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

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login implementation
    console.log(`Login with ${provider}`)
    // You can integrate with OAuth providers here
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Muvex!</h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* Sign In Button */}
          <button
            onClick={() => {
              // Toggle to show login form
              document.getElementById('login-form')?.classList.toggle('hidden')
            }}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 font-medium mb-6"
          >
            Sign in
          </button>

          {/* Login Form (Initially Hidden) */}
          <form id="login-form" onSubmit={handleSubmit} className="hidden space-y-4 mb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Email Address"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Social Login */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Or, continue with:</p>
            
            <div className="flex justify-center space-x-4 mb-6">
              {/* Facebook */}
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* Google */}
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleSocialLogin('linkedin')}
                className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 mb-6">
              By signing in via social media, I agree to the{' '}
              <a href="/terms" className="text-orange-500 hover:underline">
                Muvex.com Free Membership Agreement
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>
              , and to receive emails about the platform's products and services.
            </p>

            {/* Account Features */}
            <div className="text-left space-y-2 border-t pt-4">
              <div className="font-medium text-gray-800 mb-3">My Muvex</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Orders</div>
                <div>Messages</div>
                <div>RFQs</div>
                <div>Favorites</div>
                <div>Account</div>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="text-sm text-gray-600">Membership program</div>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push('/register')
                }}
                className="text-orange-500 hover:underline font-medium"
              >
                Don't have an account? Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
