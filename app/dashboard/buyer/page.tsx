
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { requireClientRole } from '@/lib/auth-client'

interface RFQ {
  id: string
  productId: string
  name: string
  email: string
  quantity: number
  region: string
  message: string
  submittedAt: string
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  merchantId: string
  stock: number | null
}

export default function BuyerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [rfqs, setRFQs] = useState<RFQ[]>([])
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'rfqs' | 'bookmarks'>('rfqs')
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await requireClientRole(['buyer'])
        setUser(session.user)

        // Fetch RFQs
        const rfqResponse = await fetch(`/api/rfq?buyerId=${session.user.id}`)
        if (rfqResponse.ok) {
          const rfqData = await rfqResponse.json()
          setRFQs(rfqData)
        }

        // Fetch bookmarked products
        if (session.user.bookmarks && session.user.bookmarks.length > 0) {
          const productPromises = session.user.bookmarks.map(async (productId: string) => {
            const response = await fetch(`/api/products?id=${productId}`)
            if (response.ok) {
              const products = await response.json()
              return products.find((p: Product) => p.id === productId)
            }
            return null
          })
          
          const products = await Promise.all(productPromises)
          setBookmarkedProducts(products.filter(Boolean))
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleRemoveBookmark = async (productId: string) => {
    try {
      const response = await fetch('/api/user/bookmarks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId })
      })

      if (response.ok) {
        setBookmarkedProducts(prev => prev.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.email}. Track your quote requests and saved products.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rfqs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quote Requests ({rfqs.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookmarks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Products ({bookmarkedProducts.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'rfqs' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Quote Requests</h2>
            
            {rfqs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quote requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by browsing products and requesting quotes.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/products')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Products
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {rfqs.map((rfq) => (
                    <li key={rfq.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Product ID: {rfq.productId}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Pending
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Quantity:</span> {rfq.quantity}
                              </div>
                              <div>
                                <span className="font-medium">Region:</span> {rfq.region}
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span> {new Date(rfq.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-sm text-gray-600">Message:</span>
                              <p className="text-sm text-gray-900 mt-1">{rfq.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Products</h2>
            
            {bookmarkedProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No saved products</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save products for later by clicking the bookmark icon on product cards.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/products')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Products
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <button
                      onClick={() => handleRemoveBookmark(product.id)}
                      className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      title="Remove bookmark"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
