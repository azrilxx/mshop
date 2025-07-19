import { getSession } from '@/lib/auth'
import { productDb, adDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import AdBanner from '@/components/AdBanner'
import Link from 'next/link'

export default async function ShopPage() {
  const session = await getSession()
  // Use getAllForPublic to ensure only verified merchants' products are shown
  const products = await productDb.getAllForPublic()
  const activeAds = await adDb.getActiveAds()

  // Filter ads to only show those from verified merchants
  const verifiedAds = []
  for (const ad of activeAds) {
    const product = await productDb.findById(ad.productId)
    if (product) {
      const merchant = await productDb.getMerchantById(product.merchantId)
      if (merchant && merchant.is_verified) {
        verifiedAds.push(ad)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={session?.user || null} />
      
      {/* Shop Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary mb-4">
              Global B2B 
              <span className="text-accent"> Marketplace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with verified suppliers worldwide. Discover premium products from trusted business partners.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands, or categories..."
                  className="search-input text-lg py-4 pl-6 pr-14"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Search Suggestions */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Popular:</span>
                <button className="text-sm text-blue-600 hover:text-blue-700 underline">Electronics</button>
                <button className="text-sm text-blue-600 hover:text-blue-700 underline">Industrial Equipment</button>
                <button className="text-sm text-blue-600 hover:text-blue-700 underline">Office Supplies</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Featured Advertisements */}
        {verifiedAds.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="heading-secondary mb-2">Featured Products</h2>
                <p className="text-gray-600">Premium offerings from our verified partners</p>
              </div>
              <span className="badge-premium text-sm">Sponsored</span>
            </div>
            <div className="grid-products">
              {verifiedAds.slice(0, 6).map((ad) => (
                <AdBanner key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <button className="category-pill-active whitespace-nowrap">
              All Categories
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Flanges
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Rope Access Equipment
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Subsea Connectors
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Pipe Cleaning Tools
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Pressure Testing Units
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Rental Tanks
            </button>
            <button className="category-pill-inactive whitespace-nowrap">
              Measurement & Instrumentation
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <div>
              <h2 className="heading-secondary mb-2">
                All Products ({products.length})
              </h2>
              <p className="text-gray-600">Discover products from verified suppliers worldwide</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select className="search-input text-sm py-2 px-3 min-w-[180px]">
                <option>Sort by: Newest</option>
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
                <option>Sort by: Rating</option>
                <option>Sort by: Popularity</option>
              </select>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Check back soon for new products from our verified suppliers, or be the first to start selling!
              </p>
              {!session && (
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Become a Verified Seller
                </Link>
              )}
            </div>
          ) : (
            <div className="grid-products">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="card-modern p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Why Choose Muvex Marketplace?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the difference with our comprehensive B2B platform designed for modern commerce
            </p>
          </div>
          <div className="grid-features">
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Verified Merchants</h4>
              <p className="text-gray-600">Every seller undergoes rigorous verification to ensure quality, reliability, and business authenticity</p>
            </div>
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Lightning Performance</h4>
              <p className="text-gray-600">Advanced technology delivering exceptional speed, reliability, and seamless user experience</p>
            </div>
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Security</h4>
              <p className="text-gray-600">Bank-grade security protocols protecting your transactions, data, and business information</p>
            </div>
          </div>
        </div>

        {/* Call to Action for Sellers */}
        {!session && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Scale Your Business?</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful merchants leveraging our platform to reach global markets and grow their business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold text-lg transform hover:scale-105"
              >
                Start Selling Today
              </Link>
              <Link
                href="/products"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}