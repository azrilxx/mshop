'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserPlan } from '@/lib/hooks'

export default function SellerDashboard() {
  const { plan, usage, featureAccess, loading: planLoading } = useUserPlan()
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products?userProducts=true'),
        fetch('/api/orders')
      ])

      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [productsData, ordersData] = await Promise.all([
        productsRes.json(),
        ordersRes.json()
      ])

      setProducts(productsData)
      setOrders(ordersData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || planLoading || !plan || !usage) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

      {/* Plan Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Plan Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-lg font-semibold">{plan.tier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Products Used</p>
            <p className="text-lg font-semibold">
              {usage.productsCreated} / {plan.maxProducts === -1 ? '∞' : plan.maxProducts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ad Slots Used</p>
            <p className="text-lg font-semibold">
              {usage.adsCreated} / {plan.maxAdSlots === -1 ? '∞' : plan.maxAdSlots}
            </p>
          </div>
        </div>
        <Link 
          href="/seller/plan" 
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Manage Plan
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Quote Requests</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          href="/seller/products/create" 
          className={`bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 ${!featureAccess?.canCreateProducts ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Add New Product
        </Link>
        <Link 
          href="/seller/ads/create" 
          className={`bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 ${!featureAccess?.canCreateAds ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Create Advertisement
        </Link>
        <Link 
          href="/seller/verify" 
          className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700"
        >
          Get Verified
        </Link>
        <Link 
          href="/seller/reports" 
          className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700"
        >
          View Reports
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8 px-6">
            <button className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
              Products
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
              Quotes (0)
            </button>
          </nav>
        </div>

        {/* Products Tab */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Products</h2>
            <Link 
              href="/seller/products/create" 
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${!featureAccess?.canCreateProducts ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products yet. Create your first product to get started!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Location</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{product.category}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.listingType === 'rfq' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {product.listingType === 'rfq' ? 'RFQ' : 'Fixed'}
                        </span>
                      </td>
                      <td className="py-2">
                        {product.listingType === 'rfq' ? 'Quote' : `$${product.price.toFixed(2)}`}
                      </td>
                      <td className="py-2">
                        {product.location ? `${product.location.city}, ${product.location.country}` : '-'}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="border-t p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Quote Requests</h3>
          <div className="space-y-4">
            <p>No quotes</p>
          </div>
        </div>
      </div>
    </div>
  )
}