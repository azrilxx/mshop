import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { insightDb } from '@/lib/db'

const mockInsights = [
  {
    id: '1',
    title: 'The Future of E-commerce in Emerging Markets',
    author: 'Jane Doe',
    date: '2024-01-20',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3086&q=80',
    content: `
      <p>E-commerce in emerging markets is experiencing unprecedented growth, driven by increasing internet penetration and mobile adoption. This article explores the key trends and opportunities in these rapidly evolving markets.</p>
      <p>One of the most significant trends is the rise of mobile commerce. With smartphones becoming more affordable, more consumers in emerging markets are using their mobile devices to shop online. This has led to the development of mobile-first e-commerce platforms and payment solutions.</p>
      <p>Another key trend is the increasing demand for cross-border e-commerce. Consumers in emerging markets are increasingly looking to purchase products from international brands, and e-commerce platforms are making it easier than ever for them to do so.</p>
    `,
  },
  {
    id: '2',
    title: 'Sustainable Supply Chains: A Competitive Advantage',
    author: 'John Smith',
    date: '2024-02-15',
    image: 'https://images.unsplash.com/photo-1523372850339-d9bc82c4b46e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
    content: `
      <p>Sustainability is no longer a niche concern but a core business imperative. This article examines how companies can build sustainable supply chains and gain a competitive advantage.</p>
      <p>One of the key steps in building a sustainable supply chain is to identify and address environmental and social risks. This includes assessing the environmental impact of your operations, as well as the labor practices of your suppliers.</p>
      <p>Another important step is to collaborate with your suppliers to improve their sustainability performance. This can involve providing training and support, as well as setting clear expectations for environmental and social responsibility.</p>
    `,
  },
  {
    id: '3',
    title: 'The Role of AI in Optimizing Logistics',
    author: 'Alice Johnson',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1559163438-64e75447c741?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
    content: `
      <p>Artificial intelligence (AI) is revolutionizing the logistics industry, enabling companies to optimize their operations and improve efficiency. This article explores the various applications of AI in logistics.</p>
      <p>One of the most promising applications of AI is in predictive maintenance. By analyzing data from sensors and other sources, AI can predict when equipment is likely to fail, allowing companies to schedule maintenance proactively and avoid costly downtime.</p>
      <p>AI is also being used to optimize routing and delivery schedules. By taking into account factors such as traffic conditions and delivery locations, AI can help companies to find the most efficient routes and delivery times.</p>
    `,
  },
];

export default async function InsightDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getSession()
  const insight = mockInsights.find(post => post.id === params.id)

  if (!insight) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session?.user || null} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src={insight.image} 
            alt={insight.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {insight.title}
            </h1>

            <div className="flex items-center text-gray-600 mb-8">
              <span>{insight.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(insight.date).toLocaleDateString()}</span>
            </div>

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: insight.content }} />
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInsights.filter(post => post.id !== insight.id).slice(0, 2).map((relatedPost) => (
                  <a key={relatedPost.id} href={`/insights/${relatedPost.id}`} className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">{relatedPost.title}</h4>
                    <p className="text-sm text-gray-600">{relatedPost.content.substring(0, 100) + '...'}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}