import Link from 'next/link'
import { productDb, adDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import AdBanner from '@/components/AdBanner'

export default async function Home() {
  const session = await getSession()
  const products = await productDb.getAllForPublic()
  const activeAds = await adDb.getActiveAds()

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={session?.user || null} />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-balance mb-6">
              Next-Generation 
              <span className="text-accent"> B2B Marketplace</span>
            </h1>
            <p className="text-xl mb-10 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with verified suppliers and buyers worldwide. Experience seamless trade with our advanced marketplace platform designed for modern businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/shop" 
                className="btn-primary text-lg px-8 py-4"
              >
                Explore Marketplace
              </Link>
              {!session && (
                <Link 
                  href="/register" 
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Start Selling Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Advertisements */}
      {activeAds.length > 0 && (
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-secondary mb-4">Featured Products</h2>
              <p className="text-gray-600 text-lg">Discover premium offerings from our verified partners</p>
            </div>
            <div className="grid-products">
              {activeAds.slice(0, 6).map((ad) => (
                <AdBanner key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest Products */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12">
            <div>
              <h2 className="heading-secondary mb-2">Latest Products</h2>
              <p className="text-gray-600 text-lg">Fresh arrivals from our marketplace</p>
            </div>
            <Link 
              href="/shop" 
              className="btn-ghost text-blue-600 hover:text-blue-700 font-medium mt-4 md:mt-0"
            >
              View All Products →
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-500 text-lg">Check back soon for exciting new listings!</p>
            </div>
          ) : (
            <div className="grid-products">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-secondary mb-4">Why Choose Muvex?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the future of B2B commerce with our comprehensive platform
            </p>
          </div>
          
          <div className="grid-features">
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Merchants</h3>
              <p className="text-gray-600">All sellers go through rigorous verification process ensuring quality and trust</p>
            </div>
            
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">Advanced technology stack delivering exceptional performance and user experience</p>
            </div>
            
            <div className="text-center">
              <div className="feature-icon mx-auto mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600">Connect with businesses worldwide through our international marketplace platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful merchants who trust Muvex for their B2B commerce needs. Start your journey today.
          </p>
          {!session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold text-lg transform hover:scale-105"
              >
                Start Selling Now
              </Link>
              <Link 
                href="/shop" 
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <Link 
              href={session.user.role === 'seller' ? '/seller' : '/dashboard'} 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold text-lg transform hover:scale-105 inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}