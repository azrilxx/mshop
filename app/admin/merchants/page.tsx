'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireClientRole } from '@/lib/auth-client'
import { userDb, type User } from '@/lib/db'

export default function MerchantsPage() {
  const [session, setSession] = useState<any>(null)
  const [unverifiedSellers, setUnverifiedSellers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userSession = await requireClientRole(['admin'])
      setSession(userSession)
      await loadUnverifiedSellers()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const loadUnverifiedSellers = async () => {
    try {
      const sellers = await userDb.getUnverifiedSellers()
      setUnverifiedSellers(sellers)
    } catch (error) {
      console.error('Failed to load unverified sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (sellerId: string) => {
    try {
      await fetch('/api/admin/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, action: 'verify' })
      })
      await loadUnverifiedSellers()
    } catch (error) {
      console.error('Failed to verify seller:', error)
    }
  }

  const handleReject = async (sellerId: string, reason?: string) => {
    if (!confirm('Are you sure you want to reject this seller?')) return

    try {
      await fetch('/api/admin/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, action: 'reject', reason })
      })
      await loadUnverifiedSellers()
    } catch (error) {
      console.error('Failed to reject seller:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Verification</h1>
          <p className="text-gray-600 mt-2">Review and verify new seller applications</p>
        </div>

        {unverifiedSellers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Verifications</h3>
            <p className="text-gray-500">All sellers have been verified.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {unverifiedSellers.map((seller) => (
              <div key={seller.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{seller.fullName || seller.email}</h3>
                    <p className="text-gray-600">{seller.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied: {new Date(seller.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: Pending Verification
                    </p>
                  </div>

                  <div className="flex space-x-3 ml-6">
                    <button
                      onClick={() => handleVerify(seller.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleReject(seller.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}