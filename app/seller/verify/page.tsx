'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Verification {
  userId: string
  registrationNumber: string
  companyName: string
  logoUrl?: string
  licenseUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  adminNotes?: string
}

export default function SellerVerifyPage() {
  const [verification, setVerification] = useState<Verification | null>(null)
  const [formData, setFormData] = useState({
    registrationNumber: '',
    companyName: '',
    logoUrl: '',
    licenseUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchVerification()
  }, [])

  const fetchVerification = async () => {
    try {
      const response = await fetch('/api/verify')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setVerification(data)
        }
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
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification')
      }

      setVerification(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading verification status...</div>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Verification</h1>

          {verification ? (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Verification Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.status)}`}>
                    {verification.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{verification.companyName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="mt-1 text-sm text-gray-900">{verification.registrationNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted On</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(verification.submittedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {verification.reviewedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewed On</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(verification.reviewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {verification.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{verification.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Submit Business Verification</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please provide your business details to get verified as a seller.
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                      Business Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                      Company Logo URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="logoUrl"
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseUrl" className="block text-sm font-medium text-gray-700">
                      Business License PDF URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="licenseUrl"
                      id="licenseUrl"
                      value={formData.licenseUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/license.pdf"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
                      disabled={submitting}
                      className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Verification'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}