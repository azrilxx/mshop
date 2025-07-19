
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
      <Navbar user={session?.user} />
      
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
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'

const mockInsights = [
  {
    id: '1',
    title: 'Global Supply Chain Trends for 2024',
    excerpt: 'Discover the latest trends shaping international trade and supply chain management.',
    author: 'Market Research Team',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    featured: true
  },
  {
    id: '2',
    title: 'How to Find Reliable Suppliers in Asia',
    excerpt: 'A comprehensive guide to sourcing products from verified suppliers across Asia.',
    author: 'Trade Experts',
    date: '2024-01-12',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
    featured: false
  },
  {
    id: '3',
    title: 'Sustainable Manufacturing Practices',
    excerpt: 'Learn about eco-friendly manufacturing processes that are gaining popularity.',
    author: 'Sustainability Team',
    date: '2024-01-10',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=250&fit=crop',
    featured: false
  },
  {
    id: '4',
    title: 'Digital Transformation in B2B Trade',
    excerpt: 'How technology is revolutionizing business-to-business commerce.',
    author: 'Tech Innovation',
    date: '2024-01-08',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    featured: false
  }
]

export default async function InsightsPage() {
  const session = await getSession()
  const featuredPost = mockInsights.find(post => post.featured)
  const recentPosts = mockInsights.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Market Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest trends, analysis, and insights from the global B2B marketplace
          </p>
        </div>

        {/* Featured Blog Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured</h2>
            <Link href={`/insights/${featuredPost.id}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="text-sm text-orange-500 font-semibold mb-2">FEATURED</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-orange-500">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{featuredPost.author}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/insights/${post.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-orange-500">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  )
}
