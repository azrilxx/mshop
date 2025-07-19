'use client'

import { useState } from 'react'

interface AddToCartButtonProps {
  productId: string
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
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
          productId,
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
    <div>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Adding to Cart...' : 'Add to Cart'}
      </button>
      
      {message && (
        <div className={`mt-2 text-sm ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </div>
  )
}