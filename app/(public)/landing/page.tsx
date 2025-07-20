import { dbOps } from '@/lib/db'
import { initializeImages, getImageByTag } from '@/lib/images'

async function LandingPage() {
  // Initialize images first with error handling
  try {
    await initializeImages()
  } catch (error) {
    console.error('Failed to initialize image library:', error)
  }

  // Fetch data with fallbacks
  let products: any[] = []
  let advertisements: any[] = []
  let insights: any[] = []
  let heroImage = ''

  try {
    products = await dbOps.getProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    products = []
  }

  try {
    advertisements = await dbOps.getActiveAdvertisements()
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    advertisements = []
  }

  try {
    insights = await dbOps.getInsights()
  } catch (error) {
    console.error('Error fetching insights:', error)
    insights = []
  }

  try {
    heroImage = await getImageByTag('industrial')
  } catch (error) {
    console.error('Failed to get hero image:', error)
    heroImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.8), rgba(29, 78, 216, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Global B2B Marketplace for Industrial Equipment
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Connect with verified suppliers worldwide. Source oil & gas equipment, marine supplies, 
            injection molding machinery, and industrial components at competitive prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register?role=buyer" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Sourcing
            </a>
            <a 
              href="/register?role=seller" 
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Supplier
            </a>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Oil & Gas Equipment',
                description: 'Pumps, valves, drilling equipment',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
              },
              {
                title: 'Marine Supplies',
                description: 'Navigation, safety, deck equipment',
                image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
              },
              {
                title: 'Injection Molding',
                description: 'Machines, molds, spare parts',
                image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop'
              },
              {
                title: 'Industrial Components',
                description: 'Bearings, seals, fasteners',
                image: 'https://images.unsplash.com/photo-1565689330114-50837e6cea9e?w=300&h=200&fit=crop'
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop'} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600">${product.price}</span>
                      <a 
                        href={`/product/${product.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Advertisements */}
      {advertisements.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Suppliers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advertisements.slice(0, 6).map((ad) => (
                <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={ad.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop'} 
                    alt={ad.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{ad.title}</h3>
                    <p className="text-gray-600 mb-4">{ad.description}</p>
                    <a 
                      href={`/product/${ad.product_id}`}
                      className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Expand Your Business?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of buyers and suppliers who trust our platform for their B2B sourcing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register?role=buyer" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Buying
            </a>
            <a 
              href="/register?role=seller" 
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Selling
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage