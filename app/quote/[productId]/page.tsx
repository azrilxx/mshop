
import { notFound, redirect } from 'next/navigation'
import { productDb } from '@/lib/db'
import { getUser } from '@/lib/auth'
import QuoteForm from '@/components/QuoteForm'

interface QuotePageProps {
  params: { productId: string }
}

export default async function QuotePage({ params }: QuotePageProps) {
  const product = await productDb.findById(params.productId)
  
  if (!product || product.listingType !== 'rfq') {
    notFound()
  }

  const user = await getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Request Quote</h1>
          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.category}</p>
            {product.location && (
              <p className="text-sm text-gray-500">
                📍 {product.location.city}, {product.location.country}
              </p>
            )}
          </div>
          <p className="text-gray-700">{product.description}</p>
        </div>
        
        <QuoteForm productId={product.id} user={user} />
      </div>
    </div>
  )
}
