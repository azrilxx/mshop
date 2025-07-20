import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { insightDb } from '@/lib/db'

export default async function InsightsPage() {
  const session = await getSession()
  const [featured, allInsights] = await Promise.all([
    insightDb.getFeatured(),
    insightDb.getAll()
  ])

  // Filter out featured from the list
  const otherInsights = allInsights.filter(insight => !insight.featured)

  return (
    <div>
      <Navbar user={session?.user || null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Industry Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, technologies, and best practices in the oil and gas industry.
          </p>
        </div>

        {/* Featured Article */}
        {featured && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <Link href={`/insights/${featured.id}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      className="h-64 w-full object-cover md:h-full"
                      src={featured.imageUrl}
                      alt={featured.title}
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                      Featured
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{featured.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{featured.content.substring(0, 200)}...</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {featured.author}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {otherInsights.map((insight) => (
              <Link key={insight.id} href={`/insights/${insight.id}`}>
                <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <img
                    className="h-48 w-full object-cover"
                    src={insight.imageUrl}
                    alt={insight.title}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{insight.content.substring(0, 150)}...</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {insight.author}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(insight.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {otherInsights.length === 0 && !featured && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No insights available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}