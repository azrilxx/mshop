'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireClientRole } from '@/lib/auth-client'

interface Metrics {
  totalBuyers: number
  totalSellers: number
  totalProducts: number
  totalRFQs: number
  verifiedSellers: number
  unverifiedSellers: number
  pendingReports: number
  suspendedUsers: number
}

export default function MetricsPage() {
  const [session, setSession] = useState<any>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userSession = await requireClientRole(['admin'])
      setSession(userSession)
      await loadMetrics()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load metrics</div>
      </div>
    )
  }

  const cards = [
    { title: 'Total Buyers', value: metrics.totalBuyers, color: 'bg-blue-500' },
    { title: 'Total Sellers', value: metrics.totalSellers, color: 'bg-green-500' },
    { title: 'Total Products', value: metrics.totalProducts, color: 'bg-purple-500' },
    { title: 'Total RFQs', value: metrics.totalRFQs, color: 'bg-orange-500' },
    { title: 'Verified Sellers', value: metrics.verifiedSellers, color: 'bg-emerald-500' },
    { title: 'Unverified Sellers', value: metrics.unverifiedSellers, color: 'bg-yellow-500' },
    { title: 'Pending Reports', value: metrics.pendingReports, color: 'bg-red-500' },
    { title: 'Suspended Users', value: metrics.suspendedUsers, color: 'bg-gray-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Metrics</h1>
          <p className="text-gray-600 mt-2">Overview of platform activity and governance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <div className="text-2xl font-bold">{card.value}</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Verification Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified Sellers</span>
                <span className="font-semibold text-green-600">{metrics.verifiedSellers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Verification</span>
                <span className="font-semibold text-yellow-600">{metrics.unverifiedSellers}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Verification Rate</span>
                  <span className="font-semibold">
                    {metrics.totalSellers > 0 
                      ? Math.round((metrics.verifiedSellers / metrics.totalSellers) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Products</span>
                <span className="font-semibold text-green-600">{metrics.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Reports</span>
                <span className="font-semibold text-red-600">{metrics.pendingReports}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Suspended Users</span>
                <span className="font-semibold text-gray-600">{metrics.suspendedUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}