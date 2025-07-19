
'use client'

import { useState } from 'react'
import { OIL_GAS_CATEGORIES } from '@/lib/constants/categories'

interface ProductFilterFormProps {
  onFilterChange: (filters: ProductFilters) => void
}

export interface ProductFilters {
  category: string
  city: string
  country: string
  listingType: string
  search: string
}

export default function ProductFilterForm({ onFilterChange }: ProductFilterFormProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    city: '',
    country: '',
    listingType: '',
    search: ''
  })

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: ProductFilters = {
      category: '',
      city: '',
      country: '',
      listingType: '',
      search: ''
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {OIL_GAS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type
          </label>
          <select
            id="listingType"
            value={filters.listingType}
            onChange={(e) => handleFilterChange('listingType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="fixed">Fixed Price</option>
            <option value="rfq">Request for Quote</option>
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Any city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            placeholder="Any country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}
