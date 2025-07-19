
import Link from 'next/link'
import { landingDb } from '@/lib/landingDb'
import { seedLandingData } from '@/scripts/seed-landing-data'
import SearchBar from '@/components/SearchBar'

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
      

      {/* Hero Banner - Alibaba Style */}
      <section 
        className="relative h-80 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroSection?.backgroundImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'})` 
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl">
              The leading B2B ecommerce platform for global trade
            </h1>
          </div>
          
          {/* Alibaba-style Search Bar */}
          <div className="w-full max-w-4xl">
            <form className="relative">
              <div className="flex rounded-full shadow-lg overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="What are you looking for..."
                  className="flex-1 px-6 py-4 text-lg focus:outline-none"
                />
                <button
                  type="button"
                  className="px-4 py-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-medium text-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Frequently Searched Pills */}
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-white text-sm">Frequently searched:</span>
              <div className="flex space-x-2">
                {['pipe fittings', 'valves', 'heat exchangers', 'pressure vessels'].map((term) => (
                  <button
                    key={term}
                    className="bg-black bg-opacity-40 text-white px-4 py-2 rounded-full text-sm border border-gray-500 hover:border-gray-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Alibaba Style */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="text-center text-white">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6m-6 4h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3">Thousands of equipment offerings</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Explore oil & gas equipment and suppliers for your operations from thousands of verified offerings worldwide.
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center text-white">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3">Assured quality and transactions</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Ensure equipment quality from verified suppliers, with your orders protected from payment to delivery.
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center text-white">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3">One-stop trading solution</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Order seamlessly from equipment/supplier search to order management, payment, and fulfillment.
              </p>
            </div>

            {/* Card 4 */}
            <div className="text-center text-white">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3">Tailored trading experience</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Get curated benefits, such as exclusive discounts, enhanced protection, and extra support, to help grow your business every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Source Direct-from-Factory Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Source direct-from-factory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Factory Tours Card */}
            <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 000 2h8a1 1 0 100-2H5z"/>
                    </svg>
                    <span>Take facility live tours</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <button className="bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                    View LIVE
                  </button>
                </div>
              </div>
            </div>

            {/* Get Samples Card */}
            <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}>
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Get samples
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <button className="bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                    View more
                  </button>
                </div>
              </div>
            </div>

            {/* Connect with Manufacturers Card */}
            <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Connect with top-ranking manufacturers
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <button className="bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                    View more
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors text-sm leading-tight">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-orange-500 font-bold text-lg mb-1">
                    ${product.price.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">{product.region}</p>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
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
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-700">Trusted by Leading Suppliers</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {['Schlumberger', 'Halliburton', 'Baker Hughes', 'NOV', 'Weatherford', 'TechnipFMC'].map((brand) => (
              <div key={brand} className="text-center">
                <div className="bg-white h-16 rounded-lg flex items-center justify-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <span className="text-gray-600 font-semibold text-sm">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {ctaSection?.heading || 'Start Selling on Muvex'}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {ctaSection?.subheading || 'List your inventory and reach verified buyers today.'}
          </p>
          <Link 
            href={ctaSection?.link || '/register'}
            className="bg-white text-orange-500 px-12 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 inline-block transition-colors shadow-lg"
          >
            {ctaSection?.buttonLabel || 'Join as Seller'}
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
                The leading B2B marketplace for oil & gas equipment and services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">Find Products</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Find Services</Link></li>
                <li><Link href="/insights" className="hover:text-white transition-colors">Market Insights</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
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
