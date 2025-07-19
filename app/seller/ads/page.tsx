'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFeatureAccess } from '@/lib/hooks'

interface Advertisement {
  id: string
  productId: string
  imageUrl: string
  title: string
  description: string
  activeFrom: string
  activeUntil: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
}

export default function SellerAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { featureAccess, plan, loading: planLoading } = useFeatureAccess()

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads?sellerId=current')
      if (!response.ok) {
        throw new Error('Failed to fetch ads')
      }
      const data = await response.json()
      setAds(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateAdStatus = async (adId: string, status: 'active' | 'inactive') => {
    try {
      const response = await fetch('/api/ads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adId, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update ad status')
      }

      // Update local state
      setAds(ads.map(ad => 
        ad.id === adId ? { ...ad, status } : ad
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading ads...</div>
      </div>
    )
  }

  if (!featureAccess?.canCreateAds) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <Link href="/seller" className="text-blue-600 hover:text-blue-800">
                ← Back to Seller Center
              </Link>
            </div>
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Advertisements Not Available</h2>
              <p className="text-gray-600 mb-4">
                Upgrade to Standard or Premium plan to access advertisement features.
              </p>
              <Link
                href="/seller/plan"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/seller" className="text-blue-600 hover:text-blue-800">
              ← Back to Seller Center
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
              <p className="text-sm text-gray-600">
                Ad Slots: {plan?.adSlotsUsed || 0}/{plan?.maxAdSlots || 0} used
              </p>
            </div>
            {featureAccess?.hasAdSlotsAvailable ? (
              <Link
                href="/seller/ads/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create New Ad
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
              >
                No Ad Slots Available
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {ads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No advertisements yet. Create your first ad!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <div key={ad.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{ad.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Active: {new Date(ad.activeFrom).toLocaleDateString()} - {new Date(ad.activeUntil).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {ad.status === 'active' && (
                        <button
                          onClick={() => updateAdStatus(ad.id, 'inactive')}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Deactivate
                        </button>
                      )}
                      
                      {ad.status === 'inactive' && new Date(ad.activeUntil) > new Date() && (
                        <button
                          onClick={() => updateAdStatus(ad.id, 'active')}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}