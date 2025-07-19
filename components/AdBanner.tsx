import { Advertisement } from '@/lib/db'
import Link from 'next/link'

interface AdBannerProps {
  ad: Advertisement
}

export default function AdBanner({ ad }: AdBannerProps) {
  return (
    <div className="card-modern card-hover-lift group relative overflow-hidden">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        {/* Featured Badge */}
        <div className="absolute top-4 right-4">
          <span className="badge-premium text-xs font-medium shadow-lg">
            ⭐ Featured
          </span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-t-xl"></div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <Link 
            href={`/product/${ad.productId}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            View Product
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}