import { notFound } from 'next/navigation'
import Link from 'next/link'
import { productDb } from '@/lib/db'
import AddToCartButton from '@/components/AddToCartButton'
import ProductRatings from '@/components/ProductRatings'
import ProductReviewList from '@/components/ProductReviewList'

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await productDb.findById(params.id)

  if (!product) {
    notFound()
  }

  const merchant = await productDb.getMerchantById(product.merchantId)

  const whatsappUrl = merchant?.whatsappNumber 
    ? `https://wa.me/${merchant.whatsappNumber.replace(/[^\d]/g, '')}?text=Hi, I am interested in your listing "${product.name}" on Muvex`
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <div className="space-y-2">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.category}</p>
            {product.location && (
              <p className="text-sm text-gray-500 mt-1">
                📍 {product.location.city}, {product.location.country}
              </p>
            )}
          </div>

          <div>
            {product.listingType === 'rfq' ? (
              <span className="text-2xl font-bold text-blue-600">
                Request for Quote
              </span>
            ) : (
              <span className="text-3xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {merchant && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
              <p className="text-gray-600">Email: {merchant.email}</p>
              {merchant.is_verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  ✓ Verified Seller
                </span>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  💬 Contact via WhatsApp
                </a>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            {product.listingType === 'rfq' ? (
              <Link 
                href={`/quote/${product.id}`}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 inline-block text-center"
              >
                Request Quote
              </Link>
            ) : (
              <AddToCartButton productId={product.id} />
            )}
          </div>
        </div>
      </div>

      {/* Product Ratings & Reviews */}
      {product.listingType === 'fixed' && (
        <div className="mt-12">
          <ProductRatings productId={product.id} />
          <ProductReviewList productId={product.id} />
        </div>
      )}
    </div>
  )
}