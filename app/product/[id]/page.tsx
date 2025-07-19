import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { productDb, ratingDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ProductRatings from '@/components/ProductRatings'
import AddToCartButton from '@/components/AddToCartButton'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getSession()
  const product = await productDb.findById(params.id)
  
  if (!product) {
    notFound()
  }

  const ratings = await ratingDb.getByProduct(product.id)
  const averageRating = await ratingDb.getAverageRating(product.id)

  return (
    <div>
      <Navbar user={session?.user || null} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="aspect-w-1 aspect-h-1">
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-2">{product.category}</p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {averageRating.count > 0 && (
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating.average)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {averageRating.average} ({averageRating.count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {session?.user.role === 'buyer' && (
                <div className="pt-4">
                  <AddToCartButton productId={product.id} />
                </div>
              )}

              <div className="pt-4 border-t">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="mt-12">
            <ProductRatings
              productId={product.id}
              ratings={ratings}
              averageRating={averageRating}
              currentUser={session?.user || null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}