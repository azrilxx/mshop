
import { replitDb } from '@/lib/db'

export async function seedLandingData() {
  try {
    // Check if data already exists
    const existingHero = await replitDb.get('section:hero')
    if (existingHero) {
      console.log('Landing data already seeded')
      return
    }

    // Seed hero section
    await replitDb.set('section:hero', {
      title: 'Global Trade Starts Here',
      subtitle: 'Millions of products, thousands of suppliers. Connect with verified businesses worldwide.',
      backgroundImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    })

    // Seed CTA section
    await replitDb.set('cta:join', {
      heading: 'Start Selling on Muvex',
      subheading: 'Join thousands of suppliers reaching global buyers',
      buttonLabel: 'Join Now',
      link: '/register'
    })

    // Seed categories
    const categories = [
      { id: 'electronics', name: 'Electronics & Technology', imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop' },
      { id: 'machinery', name: 'Machinery & Equipment', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop' },
      { id: 'textiles', name: 'Textiles & Apparel', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop' },
      { id: 'construction', name: 'Construction & Real Estate', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop' },
      { id: 'automotive', name: 'Automotive & Transportation', imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop' },
      { id: 'agriculture', name: 'Agriculture & Food', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop' },
      { id: 'energy', name: 'Energy & Minerals', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=200&fit=crop' },
      { id: 'chemicals', name: 'Chemicals & Materials', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop' }
    ]

    for (const category of categories) {
      await replitDb.set(`category:${category.id}`, category)
    }

    // Seed featured products
    const products = [
      {
        id: 'laptop-1',
        name: 'Industrial Laptop Computer',
        price: 899,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
        region: 'China',
        tags: ['electronics', 'computers'],
        category: 'electronics'
      },
      {
        id: 'excavator-1',
        name: 'Heavy Duty Excavator',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
        region: 'Germany',
        tags: ['machinery', 'construction'],
        category: 'machinery'
      },
      {
        id: 'textile-1',
        name: 'Organic Cotton Fabric',
        price: 12,
        imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=200&fit=crop',
        region: 'India',
        tags: ['textiles', 'organic'],
        category: 'textiles'
      },
      {
        id: 'solar-1',
        name: 'Solar Panel System',
        price: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop',
        region: 'USA',
        tags: ['energy', 'renewable'],
        category: 'energy'
      },
      {
        id: 'truck-1',
        name: 'Commercial Delivery Truck',
        price: 28000,
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=200&fit=crop',
        region: 'Japan',
        tags: ['automotive', 'commercial'],
        category: 'automotive'
      },
      {
        id: 'wheat-1',
        name: 'Premium Wheat Grade A',
        price: 250,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
        region: 'Canada',
        tags: ['agriculture', 'grain'],
        category: 'agriculture'
      }
    ]

    for (const product of products) {
      await replitDb.set(`product:${product.id}`, product)
    }

    console.log('Landing page data seeded successfully')
  } catch (error) {
    console.error('Failed to seed landing data:', error)
  }
}
