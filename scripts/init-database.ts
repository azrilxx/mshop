
import { supabase } from '@/lib/supabase'
import { dbOps } from '@/lib/db'
import type { User, Product, Storefront } from '@/lib/supabase'

export async function initDatabase() {
  console.log('🚀 Initializing MSHOP database with Supabase...')

  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('Supabase connection error:', error)
      throw error
    }
    console.log('✅ Supabase connection successful')

    // Create sample admin user
    const adminUser: Omit<User, 'created_at'> = {
      id: 'admin-001',
      email: 'admin@mshop.com',
      name: 'Admin User',
      role: 'admin',
      plan: 'premium',
      tenant_id: 'tenant_admin',
      status: 'active'
    }

    // Create sample seller users
    const seller1: Omit<User, 'created_at'> = {
      id: 'seller-001',
      email: 'seller1@mshop.com',
      name: 'John Seller',
      role: 'seller',
      plan: 'standard',
      tenant_id: 'tenant_seller1',
      status: 'active'
    }

    const seller2: Omit<User, 'created_at'> = {
      id: 'seller-002',
      email: 'seller2@mshop.com',
      name: 'Jane Merchant',
      role: 'seller',
      plan: 'premium',
      tenant_id: 'tenant_seller2',
      status: 'active'
    }

    // Create sample buyer user
    const buyer1: Omit<User, 'created_at'> = {
      id: 'buyer-001',
      email: 'buyer1@mshop.com',
      name: 'Bob Buyer',
      role: 'buyer',
      plan: 'free',
      tenant_id: 'tenant_buyer1',
      status: 'active'
    }

    // Insert users
    const users = [adminUser, seller1, seller2, buyer1]
    for (const user of users) {
      try {
        await dbOps.createUser(user)
        console.log(`✅ Created user: ${user.email}`)
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️ User already exists: ${user.email}`)
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error)
        }
      }
    }

    // Create sample products
    const products: Omit<Product, 'created_at' | 'id'>[] = [
      {
        name: 'Solar Panel System 5kW',
        description: 'Complete solar panel system for residential use',
        price: 5000.00,
        category: 'Solar Energy',
        seller_id: 'seller-001',
        merchant_id: 'seller-001',
        image_url: '/images/solar-panel-5kw.jpg',
        status: 'active',
        stock: 10,
        tags: ['solar', 'renewable', 'residential']
      },
      {
        name: 'Industrial Generator 50kW',
        description: 'Heavy-duty generator for industrial applications',
        price: 25000.00,
        category: 'Generators',
        seller_id: 'seller-001',
        merchant_id: 'seller-001',
        image_url: '/images/generator-50kw.jpg',
        status: 'active',
        stock: 5,
        tags: ['generator', 'industrial', 'power']
      },
      {
        name: 'LED Street Light 100W',
        description: 'Energy-efficient LED street lighting solution',
        price: 150.00,
        category: 'Lighting',
        seller_id: 'seller-002',
        merchant_id: 'seller-002',
        image_url: '/images/led-street-light.jpg',
        status: 'active',
        stock: 50,
        tags: ['led', 'street', 'lighting', 'efficient']
      },
      {
        name: 'Battery Storage System 10kWh',
        description: 'Lithium-ion battery storage for renewable energy',
        price: 8000.00,
        category: 'Energy Storage',
        seller_id: 'seller-002',
        merchant_id: 'seller-002',
        image_url: '/images/battery-storage.jpg',
        status: 'active',
        stock: 8,
        tags: ['battery', 'storage', 'lithium', 'renewable']
      }
    ]

    for (const product of products) {
      try {
        await dbOps.createProduct(product, product.seller_id)
        console.log(`✅ Created product: ${product.name}`)
      } catch (error: any) {
        console.error(`❌ Error creating product ${product.name}:`, error)
      }
    }

    // Create sample storefronts
    const storefronts: Omit<Storefront, 'created_at' | 'updated_at' | 'id'>[] = [
      {
        merchant_id: 'seller-001',
        store_name: 'SolarTech Solutions',
        slug: 'solartech-solutions',
        bio: 'Leading provider of solar energy solutions for residential and commercial applications.',
        logo_url: '/images/solartech-logo.png',
        banner_url: '/images/solartech-banner.jpg',
        contact_email: 'contact@solartech.com',
        contact_phone: '+1-555-0123',
        address: '123 Solar Street, Energy City, EC 12345',
        status: 'active'
      },
      {
        merchant_id: 'seller-002',
        store_name: 'PowerMax Industries',
        slug: 'powermax-industries',
        bio: 'Industrial power solutions and energy storage systems for modern businesses.',
        logo_url: '/images/powermax-logo.png',
        banner_url: '/images/powermax-banner.jpg',
        contact_email: 'info@powermax.com',
        contact_phone: '+1-555-0456',
        address: '456 Industrial Blvd, Power City, PC 67890',
        status: 'active'
      }
    ]

    for (const storefront of storefronts) {
      try {
        await dbOps.createStorefront(storefront, storefront.merchant_id)
        console.log(`✅ Created storefront: ${storefront.store_name}`)
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Storefront already exists: ${storefront.store_name}`)
        } else {
          console.error(`❌ Error creating storefront ${storefront.store_name}:`, error)
        }
      }
    }

    // Create sample subscriptions
    const subscriptions = [
      {
        user_id: 'seller-001',
        plan: 'standard' as const,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: 'seller-002',
        plan: 'premium' as const,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    for (const subscription of subscriptions) {
      try {
        await dbOps.createSubscription(subscription)
        console.log(`✅ Created subscription for user: ${subscription.user_id}`)
      } catch (error: any) {
        console.error(`❌ Error creating subscription for ${subscription.user_id}:`, error)
      }
    }

    console.log('🎉 Database initialization completed successfully!')
    
    return {
      success: true,
      message: 'Database initialized with sample data',
      stats: {
        users: users.length,
        products: products.length,
        storefronts: storefronts.length,
        subscriptions: subscriptions.length
      }
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}
