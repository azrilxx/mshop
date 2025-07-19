'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Merchant {
  id: string
  email: string
  is_verified: boolean
  createdAt: string
  productCount?: number
  recentActivity?: string
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const response = await fetch('/api/admin/merchants')
      if (!response.ok) {
        throw new Error('Failed to fetch merchants')
      }
      const data = await response.json()
      setMerchants(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerification = async (email: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          is_verified: !currentStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update merchant verification')
      }

      // Update local state
      setMerchants(merchants.map(merchant => 
        merchant.email === email 
          ? { ...merchant, is_verified: !currentStatus }
          : merchant
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredMerchants = merchants.filter(merchant => {
    if (filter === 'pending') return !merchant.is_verified
    if (filter === 'verified') return merchant.is_verified
    return true
  })

  const pendingCount = merchants.filter(m => !m.is_verified).length
  const verifiedCount = merchants.filter(m => m.is_verified).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading merchants...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Back to Admin Panel
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Merchant Verification</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Merchants
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {merchants.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Verification
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pendingCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Verified Merchants
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {verifiedCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Merchants ({merchants.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'verified'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Verified ({verifiedCount})
              </button>
            </nav>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Merchants Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMerchants.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <p className="text-gray-500">
                    {filter === 'pending' && 'No pending merchants'}
                    {filter === 'verified' && 'No verified merchants'}
                    {filter === 'all' && 'No merchants found'}
                  </p>
                </li>
              ) : (
                filteredMerchants.map((merchant) => (
                  <li key={merchant.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {merchant.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {merchant.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(merchant.createdAt).toLocaleDateString()}
                            {merchant.productCount !== undefined && (
                              <span className="ml-2">• {merchant.productCount} products</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          merchant.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {merchant.is_verified ? 'Verified' : 'Pending'}
                        </span>
                        
                        <button
                          onClick={() => toggleVerification(merchant.email, merchant.is_verified)}
                          className={`px-3 py-1 text-sm rounded-md font-medium ${
                            merchant.is_verified
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {merchant.is_verified ? 'Revoke' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Bulk Actions */}
          {pendingCount > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {pendingCount} merchant{pendingCount !== 1 ? 's' : ''} pending verification
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Review and verify merchants to allow them to sell on the platform.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}