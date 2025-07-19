
import db from './db'

export interface LandingCategory {
  id: string
  name: string
  imageUrl: string
}

export interface LandingProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  region: string
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
      return await db.get('section:hero')
    } catch (error) {
      console.error('Failed to get hero section:', error)
      return null
    }
  },

  async getCTASection(): Promise<CTASection | null> {
    try {
      return await db.get('cta:join')
    } catch (error) {
      console.error('Failed to get CTA section:', error)
      return null
    }
  },

  async getCategories(): Promise<LandingCategory[]> {
    try {
      const keys = await db.list('category:')
      const categories = await Promise.all(
        keys.map(async (key) => {
          const category = await db.get(key)
          return category
        })
      )
      return categories.filter(Boolean)
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  },

  async getFeaturedProducts(): Promise<LandingProduct[]> {
    try {
      const keys = await db.list('product:')
      const products = await Promise.all(
        keys.map(async (key) => {
          const product = await db.get(key)
          return product
        })
      )
      return products.filter(Boolean)
    } catch (error) {
      console.error('Failed to get featured products:', error)
      return []
    }
  }
}
