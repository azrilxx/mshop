
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserPlan } from '@/lib/hooks'

export default function AdsPage() {
  const { plan, usage, featureAccess, loading: planLoading } = useUserPlan()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads')
      if (response.ok) {
        const data = await response.json()
        setAds(data)
      } else {
        throw new Error('Failed to fetch ads')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/ads?id=${adId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAds(ads.map(ad => 
          ad.id === adId ? { ...ad, status: 'inactive' } : ad
        ))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to deactivate ad')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (planLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Check if user can access ads
  if (!featureAccess.canCreateAds && !ads.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800">Advertisements Not Available</h3>
          </div>
          <div className="mt-2">
            <p className="text-yellow-700">
              Your {plan?.tier || 'Free'} plan doesn't include advertisement features. 
              Upgrade to Standard or Premium to create and manage ads.
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
          <p className="text-gray-600 mt-2">Manage your product advertisements</p>
        </div>
        {featureAccess.canCreateAds && featureAccess.hasAdSlotsAvailable && (
          <Link
            href="/seller/ads/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Ad
          </Link>
        )}
      </div>

      {/* Plan Usage Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advertisement Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {usage?.adsCreated || 0}
            </div>
            <div className="text-sm text-gray-600">Ads Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {ads.filter(ad => ad.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Ads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {featureAccess.remainingAdSlots === 999 ? '∞' : featureAccess.remainingAdSlots}
            </div>
            <div className="text-sm text-gray-600">Slots Available</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Ads List */}
      {ads.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No advertisements</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first ad.</p>
          {featureAccess.canCreateAds && (
            <div className="mt-6">
              <Link
                href="/seller/ads/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Advertisement
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={ad.image_url || '/placeholder-ad.jpg'}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {ad.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ad.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ad.description}
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  <div>Active: {new Date(ad.active_from).toLocaleDateString()}</div>
                  <div>Until: {new Date(ad.active_until).toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-2">
                  {ad.status === 'active' && (
                    <button
                      onClick={() => handleDeactivateAd(ad.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  )}
                  <Link
                    href={`/product/${ad.product_id}`}
                    className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 text-center"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
