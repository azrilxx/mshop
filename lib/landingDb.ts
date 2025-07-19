
import Database from '@replit/database'

// Ensure fetch is available for Replit DB in Node.js environment
if (typeof globalThis.fetch === 'undefined') {
  try {
    // Use dynamic import for node-fetch
    import('node-fetch').then(({ default: fetch, Headers, Request, Response }) => {
      // @ts-ignore
      globalThis.fetch = fetch
      // @ts-ignore
      globalThis.Headers = Headers
      // @ts-ignore
      globalThis.Request = Request
      // @ts-ignore
      globalThis.Response = Response
    }).catch(() => {
      console.warn('node-fetch not available, using fallback')
    })
  } catch (error) {
    console.warn('node-fetch not available, using fallback')
  }
}

const db = new Database(process.env.REPLIT_DB_URL)

export interface LandingCategory {
  id: string
  name: string
  imageUrl: string
}

export interface LandingProduct {
  id: string
  name: string
  price: number | null
  imageUrl: string
  region: string | null
  tags: string[]
  category: string
}

export interface HeroSection {
  title: string
  subtitle: string
  backgroundImage: string
}

export interface CTASection {
  heading: string
  subheading: string
  buttonLabel: string
  link: string
}

export const landingDb = {
  async getHeroSection(): Promise<HeroSection | null> {
    try {
      const result = await db.get('section:hero')
      return result || null
    } catch (error) {
      console.error('Failed to get hero section:', error)
      return {
        title: 'Discover Oil & Gas Equipment. Redefined.',
        subtitle: 'Connect with verified suppliers worldwide. Advanced equipment for energy operations.',
        backgroundImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
      }
    }
  },

  async getCTASection(): Promise<CTASection | null> {
    try {
      const result = await db.get('cta:join')
      return result || null
    } catch (error) {
      console.error('Failed to get CTA section:', error)
      return {
        heading: 'Start Selling on Muvex',
        subheading: 'List your inventory and reach verified buyers today.',
        buttonLabel: 'Join as Seller',
        link: '/register'
      }
    }
  },

  async getCategories(): Promise<LandingCategory[]> {
    try {
      const keys = await db.list('category:')
      const categories: LandingCategory[] = []
      
      for (const key of keys) {
        try {
          const category = await db.get(key)
          if (category) {
            categories.push(category as LandingCategory)
          }
        } catch (error) {
          console.warn(`Failed to get category ${key}:`, error)
        }
      }
      
      return categories
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  },

  async getFeaturedProducts(): Promise<LandingProduct[]> {
    try {
      const keys = await db.list('landing:product:')
      const products: LandingProduct[] = []
      
      for (const key of keys) {
        try {
          const product = await db.get(key)
          if (product) {
            products.push(product as LandingProduct)
          }
        } catch (error) {
          console.warn(`Failed to get product ${key}:`, error)
        }
      }
      
      return products
    } catch (error) {
      console.error('Failed to get featured products:', error)
      return []
    }
  },

  async storeCategory(category: LandingCategory): Promise<void> {
    try {
      await db.set(`category:${category.id}`, category)
    } catch (error) {
      console.error(`Failed to store category ${category.id}:`, error)
    }
  },

  async storeProduct(product: LandingProduct): Promise<void> {
    try {
      await db.set(`landing:product:${product.id}`, product)
    } catch (error) {
      console.error(`Failed to store product ${product.id}:`, error)
    }
  }
}
