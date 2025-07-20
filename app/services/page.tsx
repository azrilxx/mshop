
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { serviceDb } from '@/lib/db'

export default async function ServicesPage() {
  const session = await getSession()
  const services = await serviceDb.getAll()

  return (
    <div>
      <Navbar user={session?.user || null} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Marketplace</h1>
            <p className="text-gray-600 mt-2">Find specialized services for your oil and gas operations</p>
          </div>
          
          {session?.user?.role === 'seller' && (
            <Link
              href="/services/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              List Service
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`}>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 border">
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.serviceType}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title || service.serviceType}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="text-sm text-gray-500 mb-4">
                  📍 {service.region}
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  👤 {service.contact}
                </div>
                
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {service.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{service.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
            <p className="text-gray-500">Be the first to list your services!</p>
          </div>
        )}
      </div>
    </div>
  )
}
