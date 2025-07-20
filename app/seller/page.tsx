'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserPlan } from '@/lib/hooks'

export default function SellerDashboard() {
  const { plan, usage, featureAccess, loading: planLoading } = useUserPlan()
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, adsRes] = await Promise.all([
        fetch('/api/products?userProducts=true'),
        fetch('/api/orders'),
        fetch('/api/ads')
      ])

      if (!productsRes.ok || !ordersRes.ok || !adsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [productsData, ordersData, adsData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        adsRes.json()
      ])

      setProducts(productsData)
      setOrders(ordersData)
      setAds(adsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || planLoading || !plan || !usage || !featureAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(order => order.status === 'unpaid' || order.status === 'to_ship')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} Plan
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Plan Usage Banner */}
      {(!featureAccess.hasProductSlotsAvailable || !featureAccess.hasAdSlotsAvailable) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Plan Limit Warning</h3>
          <p className="text-yellow-700 text-sm mb-3">
            {!featureAccess.hasProductSlotsAvailable && `You've reached your product limit (${products.length}/${plan.maxProducts}). `}
            {!featureAccess.hasAdSlotsAvailable && `You've reached your ad limit (${ads.length}/${plan.maxAds}). `}
          </p>
          <p className="text-yellow-700 text-sm">{featureAccess.upgradeMessage}</p>
          <Link
            href="/seller/plan"
            className="inline-block mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.length}
                {plan.maxProducts !== -1 && (
                  <span className="text-sm text-gray-500">/{plan.maxProducts}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Ads</p>
              <p className="text-2xl font-semibold text-gray-900">
                {ads.filter(ad => ad.status === 'active').length}
                {plan.maxAds !== -1 && (
                  <span className="text-sm text-gray-500">/{plan.maxAds}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${orders.filter(o => o.status === 'complete').reduce((sum, o) => sum + o.total_price, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/seller/products/create"
          className={`block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
            !featureAccess.canCreateProducts ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => {
            if (!featureAccess.canCreateProducts) {
              e.preventDefault()
              alert('You have reached your product limit. Please upgrade your plan.')
            }
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Add Product</h3>
              <p className="text-gray-600 text-sm">
                {featureAccess.canCreateProducts 
                  ? `${featureAccess.remainingProducts} slots remaining`
                  : 'Limit reached - upgrade needed'
                }
              </p>
            </div>
          </div>
        </Link>

        {/* Ads Management - Plan-based Access */}
        <div className={`block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
          !featureAccess.canCreateAds ? 'opacity-60' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${featureAccess.canCreateAds ? 'bg-red-100' : 'bg-gray-100'}`}>
                <svg className={`w-6 h-6 ${featureAccess.canCreateAds ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Manage Ads</h3>
                <p className="text-gray-600 text-sm">
                  {featureAccess.canCreateAds 
                    ? `${ads.length} active ads` 
                    : 'Upgrade plan to create ads'
                  }
                </p>
              </div>
            </div>
            <div>
              {featureAccess.canCreateAds ? (
                <Link
                  href="/seller/ads"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Manage Ads
                </Link>
              ) : (
                <Link
                  href="/seller/plan"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/seller/reports"
          className={`block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
            !featureAccess.canAccessReports ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => {
            if (!featureAccess.canAccessReports) {
              e.preventDefault()
              alert('Reports are only available on Standard and Premium plans.')
            }
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">View Reports</h3>
              <p className="text-gray-600 text-sm">
                {featureAccess.canAccessReports 
                  ? 'Analytics & insights'
                  : 'Upgrade to access'
                }
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Pending Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {products.find(p => p.id === order.product_id)?.name || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'unpaid' ? 'bg-red-100 text-red-800' :
                        order.status === 'to_ship' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}