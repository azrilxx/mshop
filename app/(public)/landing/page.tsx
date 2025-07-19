
import Link from 'next/link'
import { landingDb } from '@/lib/landingDb'
import { seedLandingData } from '@/scripts/seed-landing-data'

export default async function LandingPage() {
  // Seed data if not exists
  await seedLandingData()

  // Fetch all landing data
  const [heroSection, ctaSection, categories, featuredProducts] = await Promise.all([
    landingDb.getHeroSection(),
    landingDb.getCTASection(),
    landingDb.getCategories(),
    landingDb.getFeaturedProducts()
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-orange-500">
                Muvex
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-orange-500">
                Products
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-orange-500">
                Services
              </Link>
              <Link href="/insights" className="text-gray-700 hover:text-orange-500">
                Insights
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-orange-500">
                Sign In
              </Link>
              <Link href="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section 
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroSection?.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {heroSection?.title || 'Global Trade Starts Here'}
            </h1>
            <p className="text-xl mb-8">
              {heroSection?.subtitle || 'Connect with verified businesses worldwide'}
            </p>
            <div className="flex space-x-4">
              <Link href="/products" className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600">
                Find Products
              </Link>
              <Link href="/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-500">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-orange-500 font-bold">${product.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.region}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Logos */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Trusted by Leading Suppliers</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            {['TechCorp', 'Global Supply', 'Industrial Solutions', 'Energy Plus', 'AgriMax', 'BuildMaster'].map((brand) => (
              <div key={brand} className="text-center">
                <div className="bg-gray-300 h-16 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Block */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {ctaSection?.heading || 'Start Selling on Muvex'}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {ctaSection?.subheading || 'Join thousands of suppliers reaching global buyers'}
          </p>
          <Link 
            href={ctaSection?.link || '/register'}
            className="bg-white text-orange-500 px-12 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 inline-block"
          >
            {ctaSection?.buttonLabel || 'Join Now'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-orange-500 mb-4">Muvex</h3>
              <p className="text-gray-400">
                The leading B2B marketplace connecting global buyers and suppliers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white">Find Products</Link></li>
                <li><Link href="/services" className="hover:text-white">Find Services</Link></li>
                <li><Link href="/insights" className="hover:text-white">Market Insights</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white">Start Selling</Link></li>
                <li><Link href="/seller/plan" className="hover:text-white">Pricing Plans</Link></li>
                <li><Link href="/seller/verify" className="hover:text-white">Get Verified</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Muvex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
