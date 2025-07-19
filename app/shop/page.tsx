'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import ProductFilterForm, { ProductFilters } from '@/components/ProductFilterForm'
import AdBanner from '@/components/AdBanner'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    city: '',
    country: '',
    listingType: '',
    search: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    if (filters.listingType) {
      filtered = filtered.filter(product => product.listingType === filters.listingType)
    }

    if (filters.city) {
      filtered = filtered.filter(product =>
        product.location?.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    if (filters.country) {
      filtered = filtered.filter(product =>
        product.location?.country.toLowerCase().includes(filters.country.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Oil & Gas Equipment Marketplace</h1>

      <AdBanner />

      <ProductFilterForm onFilterChange={handleFilterChange} />

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}