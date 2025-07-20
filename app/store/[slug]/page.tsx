
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { dbOps } from '@/lib/db'
import ProductCard from '@/components/ProductCard'

interface StorefrontPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const storefront = await dbOps.getStorefrontBySlug(params.slug)
  
  if (!storefront) {
    return {
      title: 'Store Not Found'
    }
  }

  return {
    title: `${storefront.store_name} - MSHOP Marketplace`,
    description: storefront.bio || `Shop at ${storefront.store_name} on MSHOP`,
    openGraph: {
      title: storefront.store_name,
      description: storefront.bio || `Shop at ${storefront.store_name}`,
      images: storefront.banner_url ? [storefront.banner_url] : []
    }
  }
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const storefront = await dbOps.getStorefrontBySlug(params.slug)
  
  if (!storefront) {
    notFound()
  }

  const products = await dbOps.getPublicProductsByMerchant(storefront.merchant_id)
  const merchant = await dbOps.getUserById(storefront.merchant_id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Banner */}
          {storefront.banner_url && (
            <div className="relative h-48 md:h-64 mb-6 rounded-lg overflow-hidden">
              <Image
                src={storefront.banner_url}
                alt={`${storefront.store_name} banner`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Store Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Logo */}
            {storefront.logo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={storefront.logo_url}
                  alt={`${storefront.store_name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Store Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {storefront.store_name}
              </h1>
              
              {storefront.bio && (
                <p className="text-gray-600 mb-4 text-lg">
                  {storefront.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {merchant?.status === 'active' && (
                  <span className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Seller
                  </span>
                )}
                
                <span>{products.length} Products</span>
                
                {storefront.contact_email && (
                  <span>Contact: {storefront.contact_email}</span>
                )}
              </div>
            </div>

            {/* Custom Domain Info */}
            {storefront.custom_domain && (
              <div className="flex-shrink-0">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Also available at:
                  </p>
                  <p className="font-semibold text-blue-900">
                    {storefront.custom_domain}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products ({products.length})
          </h2>
          
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Browse All Products →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  sellerName: storefront.store_name,
                  sellerVerified: merchant?.status === 'active'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Products Yet
              </h3>
              <p className="text-gray-600">
                This store hasn't listed any products yet. Check back later!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Store Contact Info */}
      {(storefront.address || storefront.contact_phone) && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Store Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {storefront.address && (
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-600">{storefront.address}</p>
                </div>
              )}
              {storefront.contact_phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-600">{storefront.contact_phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
