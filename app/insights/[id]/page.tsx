
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { insightDb } from '@/lib/db'

interface InsightPageProps {
  params: { id: string }
}

export default async function InsightPage({ params }: InsightPageProps) {
  const session = await getSession()
  const insight = await insightDb.findById(params.id)

  if (!insight) {
    notFound()
  }

  return (
    <div>
      <Navbar user={session?.user} />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <img
            className="w-full h-96 object-cover rounded-lg"
            src={insight.imageUrl}
            alt={insight.title}
          />
        </div>
        
        <div className="prose max-w-none">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{insight.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span>By {insight.author}</span>
              <span className="mx-3">•</span>
              <span>{new Date(insight.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
            {insight.content}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <a
              href="/insights"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Insights
            </a>
            
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                Share
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
