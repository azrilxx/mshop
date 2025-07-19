
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TagInput from '@/components/TagInput'

const SERVICE_TYPES = [
  'Drilling Services',
  'Well Completion',
  'Production Optimization',
  'Pipeline Maintenance',
  'Environmental Consulting',
  'Safety Training',
  'Equipment Rental',
  'Inspection Services',
  'Engineering Design',
  'Project Management'
]

export default function CreateServiceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    serviceType: '',
    description: '',
    region: '',
    contact: '',
    contactEmail: '',
    tags: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/services')
      } else {
        alert('Failed to create service listing')
      }
    } catch (error) {
      console.error('Error creating service:', error)
      alert('Failed to create service listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Service Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <select
          id="serviceType"
          value={formData.serviceType}
          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a service type</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
          Service Region
        </label>
        <input
          type="text"
          id="region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          placeholder="e.g., North Sea, Gulf of Mexico, Texas"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person
          </label>
          <input
            type="text"
            id="contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Tags
        </label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="Add tags to help clients find your service..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Service Listing'}
      </button>
    </form>
  )
