
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserPlan } from '@/lib/hooks'
import Link from 'next/link'

export default function CreateAdPage() {
  const router = useRouter()
  const { plan, usage, featureAccess, loading: planLoading } = useUserPlan()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    description: '',
    duration_days: 7
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?userProducts=true')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ad')
      }

      router.push('/seller/ads')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (planLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Check if user can create ads
  if (!featureAccess.canCreateAds) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800">Ad Creation Not Available</h3>
          </div>
          <div className="mt-2">
            <p className="text-yellow-700">
              Your {plan?.tier || 'Free'} plan doesn't include ad creation. 
              {featureAccess.upgradeMessage}
            </p>
            <div className="mt-4">
              <Link
                href="/seller/plan"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has reached ad limit
  if (!featureAccess.hasAdSlotsAvailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-orange-800">Ad Limit Reached</h3>
          <p className="text-orange-700 mt-2">
            You've reached the maximum number of active ads for your {plan?.tier} plan.
            You have {featureAccess.remainingAdSlots} ad slots remaining.
          </p>
          <div className="mt-4 space-x-3">
            <Link
              href="/seller/ads"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Manage Existing Ads
            </Link>
            <Link
              href="/seller/plan"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Advertisement</h1>
          <p className="text-gray-600 mt-2">
            Promote your products to increase visibility and sales
          </p>
        </div>

        {/* Plan Usage Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Ad Usage</h3>
              <p className="text-blue-700 text-sm">
                {usage?.adsCreated || 0} of {plan?.maxAds === -1 ? '∞' : plan?.maxAds} ads used
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-blue-600">
                {featureAccess.remainingAdSlots === 999 ? 'Unlimited' : `${featureAccess.remainingAdSlots} remaining`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product to Advertise
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Ad Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                maxLength={100}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Eye-catching title for your ad"
              />
            </div>

            {/* Ad Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                maxLength={500}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what makes this product special..."
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Duration
              </label>
              <select
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/seller/ads"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Advertisement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
