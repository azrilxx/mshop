
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { serviceDb, userDb } from '@/lib/db'

interface ServicePageProps {
  params: { id: string }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const session = await getSession()
  const service = await serviceDb.findById(params.id)

  if (!service) {
    notFound()
  }

  const provider = await userDb.findById(service.providerId)

  return (
    <div>
      <Navbar user={session?.user || null} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {service.serviceType}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.serviceType}</h1>
            
            <div className="mb-6">
              <p className="text-lg text-gray-600">📍 {service.region}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>
            
            {service.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              {provider && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{provider.email}</p>
                      <p className="text-gray-600">{service.contact}</p>
                      {provider.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                          ✓ Verified Provider
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <a
                        href={`mailto:${provider.email}?subject=Service Inquiry: ${service.serviceType}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-center"
                      >
                        Contact Provider
                      </a>
                      
                      {provider.whatsappNumber && (
                        <a
                          href={`https://wa.me/${provider.whatsappNumber.replace(/[^\d]/g, '')}?text=Hi, I'm interested in your ${service.serviceType} service listed on Muvex`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 text-center"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
