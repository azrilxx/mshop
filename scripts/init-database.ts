
import { dbOps } from '../lib/db'

async function initDatabase() {
  console.log('Initializing database...')
  
  try {
    // Create sample users
    const adminUser = {
      id: 'admin-1',
      email: 'admin@muvex.com',
      name: 'System Admin',
      role: 'admin' as const,
      plan: 'premium' as const,
      tenant_id: 'system',
      created_at: new Date().toISOString(),
      status: 'active' as const
    }
    
    const sellerUser = {
      id: 'seller-1', 
      email: 'seller@example.com',
      name: 'Premium Supplier',
      role: 'seller' as const,
      plan: 'premium' as const,
      tenant_id: 'tenant-1',
      created_at: new Date().toISOString(),
      status: 'active' as const
    }
    
    const buyerUser = {
      id: 'buyer-1',
      email: 'buyer@example.com', 
      name: 'Global Buyer',
      role: 'buyer' as const,
      plan: 'standard' as const,
      tenant_id: 'tenant-2',
      created_at: new Date().toISOString(),
      status: 'active' as const
    }

    await dbOps.createUser(adminUser)
    await dbOps.createUser(sellerUser)
    await dbOps.createUser(buyerUser)

    // Create sample products
    const products = [
      {
        id: 'product-1',
        name: 'Industrial Oil Pump',
        description: 'High-performance centrifugal oil pump suitable for marine and industrial applications',
        price: 4500,
        category: 'Oil & Gas',
        seller_id: 'seller-1',
        tenant_id: 'tenant-1',
        status: 'approved' as const,
        images: ['/api/placeholder/400/300'],
        tags: ['oil', 'pump', 'industrial', 'marine'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'product-2',
        name: 'Marine Injection Molding System',
        description: 'Complete injection molding system designed for marine environment manufacturing',
        price: 125000,
        category: 'Manufacturing',
        seller_id: 'seller-1',
        tenant_id: 'tenant-1',
        status: 'approved' as const,
        images: ['/api/placeholder/400/300'],
        tags: ['injection', 'molding', 'marine', 'manufacturing'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'product-3',
        name: 'Solar Panel Kit - Commercial Grade',
        description: 'High-efficiency solar panel system for commercial and industrial applications',
        price: 15000,
        category: 'Energy',
        seller_id: 'seller-1',
        tenant_id: 'tenant-1',
        status: 'approved' as const,
        images: ['/api/placeholder/400/300'],
        tags: ['solar', 'energy', 'commercial', 'renewable'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const product of products) {
      await dbOps.createProduct(product)
    }

    // Create sample advertisements
    const advertisements = [
      {
        id: 'ad-1',
        title: 'Premium Oil & Gas Equipment',
        description: 'Discover our range of certified oil and gas equipment for industrial operations',
        imageUrl: '/api/placeholder/800/400',
        productId: 'product-1',
        sellerId: 'seller-1',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        tenant_id: 'tenant-1'
      },
      {
        id: 'ad-2',
        title: 'Advanced Manufacturing Solutions',
        description: 'Transform your manufacturing with our state-of-the-art injection molding systems',
        imageUrl: '/api/placeholder/800/400',
        productId: 'product-2',
        sellerId: 'seller-1',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        tenant_id: 'tenant-1'
      }
    ]

    for (const ad of advertisements) {
      await dbOps.createAdvertisement(ad)
    }

    // Create sample insights
    const insights = [
      {
        id: 'insight-1',
        title: 'Global Oil & Gas Market Trends 2024',
        content: 'The oil and gas industry is experiencing significant transformation with new technologies and sustainability initiatives reshaping the market landscape.',
        author_id: 'admin-1',
        category: 'Market Analysis',
        featured: true,
        published_at: new Date().toISOString(),
        tenant_id: 'system'
      },
      {
        id: 'insight-2',
        title: 'Manufacturing Efficiency in Marine Industries',
        content: 'Marine manufacturing sector is adopting new technologies to improve efficiency and reduce environmental impact.',
        author_id: 'admin-1',
        category: 'Industry News',
        featured: false,
        published_at: new Date().toISOString(),
        tenant_id: 'system'
      }
    ]

    for (const insight of insights) {
      await dbOps.createInsight(insight)
    }

    console.log('✅ Database initialized successfully!')
    console.log(`Created ${products.length} products`)
    console.log(`Created ${advertisements.length} advertisements`)
    console.log(`Created ${insights.length} insights`)
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase().catch(console.error)
}

export default initDatabase
