'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OIL_GAS_CATEGORIES } from '@/lib/constants/categories'
import TagInput from '@/components/TagInput'

export default function CreateProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    listingType: 'fixed' as 'fixed' | 'rfq',
    location: {
      city: '',
      country: ''
    },
    images: [] as string[],
    certifications: [] as string[],
    tags: [] as string[],
    stock: ''
  })

  const handleCertificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'certification')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const { url } = await response.json()
          return url
        }
        return null
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter(url => url !== null)

      setFormData({
        ...formData,
        certifications: [...formData.certifications, ...validUrls]
      })
    }
  }

  const removeCertification = (index: number) => {
    const newCertifications = formData.certifications.filter((_, i) => i !== index)
    setFormData({ ...formData, certifications: newCertifications })
  }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: formData.listingType === 'fixed' ? parseFloat(formData.price) : 0,
          stock: formData.stock ? parseInt(formData.stock) : null
        })
      })

      if (response.ok) {
        router.push('/seller')
      } else {
        alert('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange(e)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange(e)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange(e)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {OIL_GAS_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Listing Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="listingType"
              value="fixed"
              checked={formData.listingType === 'fixed'}
              onChange={(e) => handleInputChange(e)}
              className="mr-2"
            />
            Fixed Price
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="listingType"
              value="rfq"
              checked={formData.listingType === 'rfq'}
              onChange={(e) => handleInputChange(e)}
              className="mr-2"
            />
            Request for Quotation
          </label>
        </div>
      </div>

      {formData.listingType === 'fixed' && (
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange(e)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

            {formData.listingType === 'fixed' && (
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity (leave blank for unlimited)
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={(e) => handleInputChange(e)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank for unlimited stock"
              />
            </div>
          )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.location.city}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, city: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            id="country"
            value={formData.location.country}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, country: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
          Certifications (Optional)
        </label>
        <input
          type="file"
          id="certifications"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleCertificationUpload}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Upload certification documents (PDF, JPG, PNG)</p>

        {formData.certifications.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Certifications:</p>
            <div className="space-y-2">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">{cert.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="Add tags to help buyers find your product..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}