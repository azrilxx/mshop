'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  merchantId: string
  tags?: string[]
  sellerName?: string
  sellerVerified?: boolean
  stock?: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [user, setUser] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession()
      setUser(session?.user || null)

      if (session?.user?.bookmarks) {
        setIsBookmarked(session.user.bookmarks.includes(product.id))
      }
    }
    checkAuth()
  }, [product.id])

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || user.role !== 'buyer') return

    setBookmarkLoading(true)

    try {
      const method = isBookmarked ? 'DELETE' : 'POST'
      const response = await fetch('/api/user/bookmarks', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id })
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
      }
    } catch (error) {
      console.error('Bookmark error:', error)
    } finally {
      setBookmarkLoading(false)
    }
  }

return (
    <div className="relative">
      <Link href={`/product/${product.id}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {product.images && product.images.length > 0 && (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-blue-600">
                  ${product.price.toLocaleString()}
                </span>
                {product.stock !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                View Details
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark button - only for buyers */}
      {user?.role === 'buyer' && (
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isBookmarked 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-400 hover:text-gray-600'
          } shadow-md hover:shadow-lg disabled:opacity-50`}
          title={isBookmarked ? 'Remove from saved' : 'Save for later'}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}