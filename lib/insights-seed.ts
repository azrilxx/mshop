
import { insightDb } from './db'

export const sampleInsights = [
  {
    title: "The Future of Renewable Energy in Oil & Gas",
    content: "The oil and gas industry is undergoing a significant transformation as companies increasingly adopt renewable energy technologies. This shift is driven by environmental regulations, investor pressure, and the economic viability of clean energy solutions. Companies are investing heavily in solar, wind, and hydrogen technologies to reduce their carbon footprint and prepare for a sustainable future. The integration of these technologies with traditional operations presents both challenges and opportunities for industry leaders.",
    imageUrl: "/attached_assets/images/renewable-energy.jpg",
    author: "Dr. Sarah Mitchell",
    publishedAt: "2024-01-15T10:00:00Z",
    featured: true,
    excerpt: "Exploring how oil and gas companies are embracing renewable energy technologies to create a more sustainable future.",
    tags: ["renewable", "sustainability", "technology", "future"],
    readTime: 5
  },
  {
    title: "Digital Transformation in Upstream Operations",
    content: "Digital technologies are revolutionizing upstream oil and gas operations. From IoT sensors on drilling rigs to AI-powered predictive maintenance, companies are leveraging technology to improve efficiency, reduce costs, and enhance safety. Machine learning algorithms can now predict equipment failures before they occur, while digital twins provide virtual representations of physical assets for better decision-making.",
    imageUrl: "/attached_assets/images/digital-transformation.jpg",
    author: "Mark Thompson",
    publishedAt: "2024-01-10T14:30:00Z",
    featured: false,
    excerpt: "How digital technologies are transforming upstream operations and improving efficiency across the industry.",
    tags: ["digital", "upstream", "technology", "AI"],
    readTime: 4
  },
  {
    title: "Supply Chain Resilience in Energy Markets",
    content: "The COVID-19 pandemic and recent geopolitical events have highlighted the importance of supply chain resilience in the energy sector. Companies are now focusing on diversifying suppliers, implementing risk management strategies, and building more flexible supply chains that can adapt to disruptions.",
    imageUrl: "/attached_assets/images/supply-chain.jpg",
    author: "Jennifer Lee",
    publishedAt: "2024-01-05T09:15:00Z",
    featured: false,
    excerpt: "Building resilient supply chains to navigate disruptions and ensure energy security.",
    tags: ["supply-chain", "resilience", "risk-management"],
    readTime: 3
  }
]

export async function seedInsights() {
  for (const insight of sampleInsights) {
    try {
      await insightDb.create(insight)
    } catch (error) {
      console.log('Insight may already exist:', insight.title)
    }
  }
}
