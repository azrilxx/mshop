
import db from '@/lib/db'

export async function seedLandingData() {
  try {
    // Check if data already exists
    const existingHero = await db.get('section:hero')
    if (existingHero) {
      console.log('Landing data already seeded')
      return
    }

    // Seed hero section
    await db.set('section:hero', {
      title: 'Discover Oil & Gas Equipment. Redefined.',
      subtitle: 'Connect with verified suppliers worldwide. Advanced equipment for energy operations.',
      backgroundImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    })

    // Seed CTA section
    await db.set('cta:join', {
      heading: 'Start Selling on Muvex',
      subheading: 'List your inventory and reach verified buyers today.',
      buttonLabel: 'Join as Seller',
      link: '/register'
    })

    // Seed oil & gas categories
    const categories = [
      { id: 'cra', name: 'Corrosion-Resistant Alloys (CRA)', imageUrl: 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=300&h=200&fit=crop' },
      { id: 'vessels', name: 'Pressure Vessels & Flanges', imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=200&fit=crop' },
      { id: 'rope', name: 'Rope Access Equipment', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop' },
      { id: 'pipe', name: 'Pipe Cleaning Tools', imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=200&fit=crop' },
      { id: 'measure', name: 'Measurement & Instrumentation', imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop' },
      { id: 'tanks', name: 'Rental Tanks & Storage', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop' },
      { id: 'valves', name: 'Valves & Actuators', imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop' },
      { id: 'offshore', name: 'Offshore & Marine Equipment', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=200&fit=crop' }
    ]

    for (const category of categories) {
      await db.set(`category:${category.id}`, category)
    }

    // Seed oil & gas products
    const products = [
      {
        id: 'inconel-625',
        name: 'Inconel 625 Seamless Pipe',
        price: 98,
        imageUrl: 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=300&h=200&fit=crop',
        region: 'Malaysia',
        tags: ['CRA', 'Nickel Alloy'],
        category: 'cra'
      },
      {
        id: 'pressure-vessel',
        name: 'ASME Pressure Vessel 316L',
        price: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=200&fit=crop',
        region: 'Singapore',
        tags: ['Pressure', 'Stainless Steel'],
        category: 'vessels'
      },
      {
        id: 'rope-access',
        name: 'Industrial Rope Access Kit',
        price: 850,
        imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop',
        region: 'UAE',
        tags: ['Safety', 'Access'],
        category: 'rope'
      },
      {
        id: 'pig-launcher',
        name: 'Pipeline Pig Launcher',
        price: 7500,
        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
        region: 'Norway',
        tags: ['Pipeline', 'Cleaning'],
        category: 'pipe'
      },
      {
        id: 'flow-meter',
        name: 'Ultrasonic Flow Meter',
        price: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop',
        region: 'Germany',
        tags: ['Measurement', 'Digital'],
        category: 'measure'
      },
      {
        id: 'storage-tank',
        name: 'API 650 Storage Tank',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
        region: 'USA',
        tags: ['Storage', 'API Standard'],
        category: 'tanks'
      },
      {
        id: 'ball-valve',
        name: 'Trunnion Ball Valve DN200',
        price: 1850,
        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
        region: 'Italy',
        tags: ['Valve', 'High Pressure'],
        category: 'valves'
      },
      {
        id: 'subsea-connector',
        name: 'Subsea Electrical Connector',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=200&fit=crop',
        region: 'UK',
        tags: ['Offshore', 'Subsea'],
        category: 'offshore'
      }
    ]

    for (const product of products) {
      await db.set(`product:${product.id}`, product)
    }

    console.log('Landing page data seeded successfully')
  } catch (error) {
    console.error('Failed to seed landing data:', error)
  }
}
