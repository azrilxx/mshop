import { getSession } from '@/lib/auth'
import { productDb, adDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import AdBanner from '@/components/AdBanner'

export default async function ProductsPage() {
  const session = await getSession()
  const products = await productDb.getAllForPublic()
  const activeAds = await adDb.getActiveAds()

  return (
    <div>
      <Navbar user={session?.user || null} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

          {activeAds.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Advertisements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAds.slice(0, 3).map((ad) => (
                  <AdBanner key={ad.id} ad={ad} />
                ))}
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}