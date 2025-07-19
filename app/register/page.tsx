
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    fullName: '',
    phone: '',
    country: 'Malaysia',
    role: 'buyer' as 'buyer' | 'seller' | 'both',
    agreeTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const countries = [
    'Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Philippines',
    'Vietnam', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait',
    'USA', 'UK', 'Germany', 'France', 'Netherlands',
    'Norway', 'Australia', 'Canada', 'Japan', 'South Korea'
  ]

  const phoneCodes = {
    'Malaysia': '+60',
    'Singapore': '+65',
    'Indonesia': '+62',
    'Thailand': '+66',
    'Philippines': '+63',
    'Vietnam': '+84',
    'UAE': '+971',
    'Saudi Arabia': '+966',
    'Qatar': '+974',
    'Kuwait': '+965',
    'USA': '+1',
    'UK': '+44',
    'Germany': '+49',
    'France': '+33',
    'Netherlands': '+31',
    'Norway': '+47',
    'Australia': '+61',
    'Canada': '+1',
    'Japan': '+81',
    'South Korea': '+82'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.companyName,
          fullName: formData.fullName,
          phone: `${phoneCodes[formData.country as keyof typeof phoneCodes]}${formData.phone}`,
          country: formData.country
        })
      })

      if (response.ok) {
        router.push('/login?message=Registration successful')
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Header */}
      <div className="max-w-md mx-auto mb-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-orange-500">
            Muvex
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Join Muvex</h1>
          <p className="mt-2 text-gray-600">Connect with suppliers worldwide</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country/Region *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Trade Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={formData.role === 'buyer'}
                  onChange={handleInputChange}
                  className="mr-3 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Buy products and services</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === 'seller'}
                  onChange={handleInputChange}
                  className="mr-3 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Sell products and services</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="both"
                  checked={formData.role === 'both'}
                  onChange={handleInputChange}
                  className="mr-3 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Both buy and sell</span>
              </label>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your work email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Create a password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your company name"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {phoneCodes[formData.country as keyof typeof phoneCodes]}
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="mt-1 mr-3 text-orange-500 focus:ring-orange-500"
              required
            />
            <label className="text-sm text-gray-600">
              I agree to Muvex's{' '}
              <Link href="/terms" className="text-orange-500 hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-orange-500 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? 'Creating Account...' : 'Join Muvex'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
