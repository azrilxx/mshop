import Link from 'next/link'
import { Product } from '@/lib/db'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link href={`/product/${product.id}`} className="hover:text-blue-600">
            {product.name}
          </Link>
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        <p className="text-sm text-gray-500 mb-1">
          Category: {product.category}
        </p>

        {product.location && (
          <p className="text-sm text-gray-500 mb-3">
            📍 {product.location.city}, {product.location.country}
          </p>
        )}

        <div className="flex items-center justify-between">
          {product.listingType === 'rfq' ? (
            <span className="text-lg font-semibold text-blue-600">
              Request for Quote
            </span>
          ) : (
            <span className="text-xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
          )}

          {product.listingType === 'rfq' ? (
            <Link 
              href={`/quote/${product.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Request Quote
            </Link>
          ) : (
            <AddToCartButton productId={product.id} />
          )}
        </div>
      </div>
    </div>
  )
}