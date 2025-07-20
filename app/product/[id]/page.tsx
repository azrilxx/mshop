
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { dbOps } from '@/lib/db'
import AddToCartButton from '@/components/AddToCartButton'
import ProductRatings from '@/components/ProductRatings'
import QuoteForm from '@/components/QuoteForm'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getSession()
  const product = await dbOps.getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Get ratings for this product
  const ratings = await dbOps.getRatingsByProduct(params.id)
  const totalRatings = ratings.length
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
    : 0

  // Get seller information
  const seller = await dbOps.getUserById(product.seller_id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xl text-blue-600 font-semibold mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Rating Summary */}
          {totalRatings > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
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
              <span className="text-lg font-medium text-gray-900">
                {averageRating.toFixed(1)} out of 5
              </span>
              <span className="text-sm text-gray-500">
                ({totalRatings} reviews)
              </span>
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Details</h3>
              <dl className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="text-gray-900">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Stock:</dt>
                  <dd className="text-gray-900">{product.stock} units</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Seller:</dt>
                  <dd className="text-gray-900">{seller?.name || 'Unknown'}</dd>
                </div>
                {product.status === 'active' && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Status:</dt>
                    <dd className="text-green-600 font-medium">Available</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {session?.user.role === 'buyer' && product.status === 'active' && (
              <AddToCartButton 
                productId={product.id}
                price={product.price}
                stock={product.stock}
              />
            )}
            
            {session?.user.role === 'buyer' && (
              <QuoteForm 
                productId={product.id}
                productName={product.name}
                sellerId={product.seller_id}
              />
            )}

            {!session && (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">Please log in to purchase or request a quote</p>
                <a
                  href="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Log In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings and Reviews Section */}
      <div className="mt-12">
        <ProductRatings
          productId={product.id}
          ratings={ratings}
          averageRating={{
            average: Math.round(averageRating * 10) / 10,
            count: totalRatings
          }}
          currentUser={session?.user || null}
        />
      </div>
    </div>
  )
}
