'use client'

import { useState, useEffect } from 'react'
import { ProductRating, User } from '@/lib/db'

interface ProductRatingsProps {
  productId: string
  ratings: ProductRating[]
  averageRating: { average: number, count: number }
  currentUser: User | null
}

interface Order {
  id: string
  productIds: string[]
  status: string
}

export default function ProductRatings({ 
  productId, 
  ratings: initialRatings, 
  averageRating: initialAverage,
  currentUser 
}: ProductRatingsProps) {
  const [ratings, setRatings] = useState(initialRatings)
  const [averageRating, setAverageRating] = useState(initialAverage)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [ratingForm, setRatingForm] = useState({
    orderId: '',
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const orders = await response.json()
          const relevantOrders = orders.filter((order: Order) => 
            order.productIds.includes(productId) && order.status === 'delivered'
          )
          setUserOrders(relevantOrders)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }

    if (currentUser?.role === 'buyer') {
      fetchUserOrders()
    }
  }, [currentUser, productId])

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          ...ratingForm
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating')
      }

      // Refresh ratings
      const ratingsResponse = await fetch(`/api/ratings?productId=${productId}`)
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json()
        setRatings(ratingsData.ratings)
        setAverageRating(ratingsData.averageRating)
      }

      setShowRatingForm(false)
      setRatingForm({ orderId: '', rating: 5, comment: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const canRate = currentUser?.role === 'buyer' && 
    userOrders.length > 0 && 
    !ratings.some(r => r.userId === currentUser.id)

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {canRate && (
            <button
              onClick={() => setShowRatingForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Write a Review
            </button>
          )}
        </div>

        {averageRating.count > 0 && (
          <div className="mt-4 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating.average)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-lg font-medium text-gray-900">
              {averageRating.average} out of 5
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({averageRating.count} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Rating Form */}
      {showRatingForm && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
          
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Order
              </label>
              <select
                value={ratingForm.orderId}
                onChange={(e) => setRatingForm(prev => ({ ...prev, orderId: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose an order</option>
                {userOrders.map(order => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id.slice(-8)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${
                      star <= ratingForm.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingForm.comment}
                onChange={(e) => setRatingForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your experience with this product..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRatingForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="mt-6 space-y-6">
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          ratings.map((rating) => (
            <div key={`${rating.productId}-${rating.userId}`} className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {rating.rating} out of 5
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </span>
              </div>
              {rating.comment && (
                <p className="text-gray-700">{rating.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}