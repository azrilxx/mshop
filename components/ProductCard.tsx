'use client'

import { Product } from '@/lib/db'
import { useState } from 'react'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddToCart = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart')
      }

      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-modern card-hover-lift group">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-center h-64 group-hover:scale-105 transition-transform duration-300">
              <svg className="h-20 w-20 text-gray-300 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </Link>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="category-pill-inactive text-xs px-2 py-1">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer group-hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </div>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
        
        {message && (
          <div className={`mt-3 text-sm font-medium ${
            message.includes('Added') 
              ? 'text-green-600 bg-green-50 border border-green-200' 
              : 'text-red-600 bg-red-50 border border-red-200'
          } px-3 py-2 rounded-lg`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}