
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?query=${encodeURIComponent(query.trim())}`)
    }
  }

  const popularSearches = [
    'Pipe Fittings', 'Valves', 'Heat Exchangers', 'Pressure Vessels',
    'Drilling Equipment', 'Safety Equipment', 'Pumps', 'Flanges'
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex rounded-lg shadow-lg overflow-hidden bg-white">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for oil & gas equipment, services, suppliers..."
            className="flex-1 px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-medium text-lg transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-4 border-l border-gray-200 transition-colors"
            disabled
          >
            📷
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600 mr-3">Popular searches:</span>
        <div className="inline-flex flex-wrap gap-2">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(search)
                router.push(`/shop?query=${encodeURIComponent(search)}`)
              }}
              className="text-sm text-orange-500 hover:text-orange-700 hover:underline"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
