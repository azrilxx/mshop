'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
}

interface Plan {
  tier: string
  maxAdSlots: number
  adSlotsUsed: number
}

export default function CreateAdPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [plan, setPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    productId: '',
    imageUrl: '',
    title: '',
    description: '',
    durationDays: 7
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsResponse, planResponse] = await Promise.all([
        fetch('/api/products?merchantId=current'),
        fetch('/api/plan')
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }

      if (planResponse.ok) {
        const planData = await planResponse.json()
        setPlan(planData)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ad')
      }

      router.push('/seller/ads')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationDays' ? parseInt(value) : value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/seller" className="text-blue-600 hover:text-blue-800">
              ← Back to Seller Center
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Advertisement</h1>

          {plan && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Ad Slot Usage</h3>
              <p className="text-blue-700">
                {plan.adSlotsUsed}/{plan.maxAdSlots} slots used on {plan.tier} plan
              </p>
              {plan.maxAdSlots === 0 && (
                <p className="text-red-600 mt-2">
                  Your plan doesn't include ad slots. <Link href="/seller/plan" className="underline">Upgrade now</Link>
                </p>
              )}
            </div>
          )}

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                    Select Product
                  </label>
                  <select
                    name="productId"
                    id="productId"
                    required
                    value={formData.productId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Ad Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Ad Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    required
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/banner.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                    Duration (Days)
                  </label>
                  <select
                    name="durationDays"
                    id="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/seller"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || (plan ? plan.adSlotsUsed >= plan.maxAdSlots : false)}
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Ad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}