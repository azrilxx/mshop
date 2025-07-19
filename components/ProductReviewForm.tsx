'use client'

import { useState } from 'react'
import { ProductRating, User } from '@/lib/db'

interface ProductReviewFormProps {
  productId: string
  currentUser: User | null
  onReviewSubmitted: (review: ProductRating) => void
  onCancel: () => void
}

export default function ProductReviewForm({ 
  productId, 
  currentUser, 
  onReviewSubmitted, 
  onCancel 
}: ProductReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    orderId: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userOrders, setUserOrders] = useState<any[]>([])

  // Fetch user orders that include this product
  useState(() => {
    const fetchOrders = async () => {
      if (!currentUser) return
      
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const orders = await response.json()
          const relevantOrders = orders.filter((order: any) => 
            order.productIds.includes(productId) && order.status === 'delivered'
          )
          setUserOrders(relevantOrders)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }
    
    fetchOrders()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: currentUser.id,
          orderId: formData.orderId,
          rating: formData.rating,
          comment: formData.comment
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      onReviewSubmitted(data)
      setFormData({ rating: 5, comment: '', orderId: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentUser || currentUser.role !== 'buyer') {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please log in as a buyer to write a review.</p>
      </div>
    )
  }

  if (userOrders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">You need to purchase this product before writing a review.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Purchase Order
          </label>
          <select
            value={formData.orderId}
            onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose an order</option>
            {userOrders.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id.slice(-8)} - {new Date(order.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-2xl transition-colors ${
                  star <= formData.rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {formData.rating} star{formData.rating !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this product..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.orderId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}