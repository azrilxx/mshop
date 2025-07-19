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

          {product.certifications && product.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.certifications.map((cert, index) => {
                  const fileName = cert.split('/').pop() || 'Certificate'
                  const isPdf = cert.toLowerCase().includes('.pdf')
                  return (
                    <a
                      key={index}
                      href={cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      {isPdf ? (
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="truncate">{fileName}</span>
                      <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

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