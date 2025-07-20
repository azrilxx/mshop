
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface StorefrontData {
  id?: string
  store_name: string
  bio: string
  logo_url?: string
  banner_url?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  custom_domain?: string
  slug?: string
}

export default function StorefrontManagementPage() {
  const [storefront, setStorefront] = useState<StorefrontData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<StorefrontData>({
    store_name: '',
    bio: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    custom_domain: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()

  useEffect(() => {
    loadStorefront()
  }, [])

  const loadStorefront = async () => {
    try {
      // Get current user's storefront
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      if (!sessionData.user) {
        router.push('/login')
        return
      }

      const storefrontResponse = await fetch(`/api/storefront?merchantId=${sessionData.user.id}`)
      const data = await storefrontResponse.json()

      if (data.storefront) {
        setStorefront(data.storefront)
        setFormData(data.storefront)
      } else {
        // No storefront exists, enable editing mode
        setIsEditing(true)
      }
    } catch (err: any) {
      setError('Failed to load storefront data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const method = storefront ? 'PUT' : 'POST'
      const body = storefront ? { ...formData, id: storefront.id } : formData

      const response = await fetch('/api/storefront', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save storefront')
      }

      setStorefront(data.storefront)
      setFormData(data.storefront)
      setIsEditing(false)
      setSuccess(storefront ? 'Storefront updated successfully!' : 'Storefront created successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_url']: data.url
      }))

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Storefront Management</h1>
          
          {storefront && !isEditing && (
            <div className="flex gap-3">
              <Link
                href={`/store/${storefront.slug}`}
                target="_blank"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                View Storefront
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Edit Storefront
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {!storefront && !isEditing ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Create Your Storefront
            </h2>
            <p className="text-gray-600 mb-6">
              Set up your public storefront to showcase your products and business information.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Create Storefront
            </button>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Store Name"
                />
                {formData.store_name && (
                  <p className="text-sm text-gray-500 mt-1">
                    Storefront URL: /store/{formData.store_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your business, products, and what makes you unique..."
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@yourstore.com"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Business St, City, State 12345"
                />
              </div>

              {/* Custom Domain */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                  <span className="text-xs text-blue-600 ml-2">🚀 Coming Soon</span>
                </label>
                <input
                  type="text"
                  value={formData.custom_domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="www.yourstore.com"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom domains will be available in a future update. Your store will be accessible at /store/your-store-name
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Logo
                </label>
                {formData.logo_url && (
                  <div className="mb-3">
                    <Image
                      src={formData.logo_url}
                      alt="Store logo"
                      width={80}
                      height={80}
                      className="rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'logo')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Banner
                </label>
                {formData.banner_url && (
                  <div className="mb-3">
                    <Image
                      src={formData.banner_url}
                      alt="Store banner"
                      width={200}
                      height={100}
                      className="rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'banner')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (storefront ? 'Update Storefront' : 'Create Storefront')}
              </button>
              
              {storefront && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(storefront)
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : storefront && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Storefront Preview</h2>
            </div>

            {/* Store Preview */}
            <div className="p-6">
              {/* Banner */}
              {storefront.banner_url && (
                <div className="relative h-32 mb-6 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={storefront.banner_url}
                    alt="Store banner"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Store Info */}
              <div className="flex items-start gap-4 mb-6">
                {storefront.logo_url && (
                  <Image
                    src={storefront.logo_url}
                    alt="Store logo"
                    width={60}
                    height={60}
                    className="rounded-lg border border-gray-200"
                  />
                )}
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {storefront.store_name}
                  </h3>
                  {storefront.bio && (
                    <p className="text-gray-600 mb-2">{storefront.bio}</p>
                  )}
                  <p className="text-sm text-blue-600">
                    /store/{storefront.slug}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              {(storefront.contact_email || storefront.contact_phone || storefront.address) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {storefront.contact_email && (
                      <p>Email: {storefront.contact_email}</p>
                    )}
                    {storefront.contact_phone && (
                      <p>Phone: {storefront.contact_phone}</p>
                    )}
                    {storefront.address && (
                      <p>Address: {storefront.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
