'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Plan {
  userId: string
  tier: 'Free' | 'Standard' | 'Premium'
  maxProducts: number
  maxAdSlots: number
  customerSupport: boolean
  quotaUsed: number
  adSlotsUsed: number
  createdAt: string
  updatedAt: string
}

export default function PlanSelectionPage() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const planDetails = {
    Free: {
      name: 'Free',
      price: '$0',
      maxProducts: 20,
      maxAdSlots: 0,
      maxReports: 0,
      customerSupport: false,
      features: ['Up to 20 products', 'Basic dashboard', 'Email support', 'No ads', 'No reports']
    },
    Standard: {
      name: 'Standard',
      price: '$29',
      maxProducts: 60,
      maxAdSlots: 12,
      maxReports: 30,
      customerSupport: true,
      features: ['Up to 60 products', '12 ad slots', 'Up to 30 reports', 'Mass shipments', 'Analytics', 'Priority support']
    },
    Premium: {
      name: 'Premium',
      price: '$99',
      maxProducts: -1,
      maxAdSlots: -1,
      maxReports: -1,
      customerSupport: true,
      features: ['Unlimited products', 'Unlimited ads', 'Unlimited reports', 'Mass shipments', 'Advanced analytics', 'Premium support', 'Priority listing']
    }
  }

  useEffect(() => {
    fetchCurrentPlan()
  }, [])

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/plan')
      if (!response.ok) {
        throw new Error('Failed to fetch plan')
      }
      const data = await response.json()
      setCurrentPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePlan = async (tier: 'Free' | 'Standard' | 'Premium') => {
    setUpdating(true)
    setError('')

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        throw new Error('Failed to update plan')
      }

      const data = await response.json()
      setCurrentPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading plan details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/seller" className="text-blue-600 hover:text-blue-800">
              ← Back to Seller Center
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="mt-2 text-gray-600">Select the plan that best fits your business needs</p>
          </div>

          {currentPlan && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Current Plan: {currentPlan.tier}</h3>
              <p className="text-blue-700">
                Products: {currentPlan.quotaUsed}/{currentPlan.maxProducts === -1 ? '∞' : currentPlan.maxProducts} | 
                Ad Slots: {currentPlan.adSlotsUsed}/{currentPlan.maxAdSlots === -1 ? '∞' : currentPlan.maxAdSlots}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(planDetails).map(([tier, details]) => (
              <div
                key={tier}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  currentPlan?.tier === tier ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{details.name}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {details.price}
                    {tier !== 'Free' && <span className="text-sm font-normal text-gray-500">/month</span>}
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => updatePlan(tier as 'Free' | 'Standard' | 'Premium')}
                  disabled={updating || currentPlan?.tier === tier}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    currentPlan?.tier === tier
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  {updating ? 'Updating...' : 
                   currentPlan?.tier === tier ? 'Current Plan' : 
                   tier === 'Free' ? 'Downgrade to Free' : 'Upgrade to ' + tier}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}