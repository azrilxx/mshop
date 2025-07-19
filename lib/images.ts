
import Database from '@replit/database'

// Ensure fetch is available for Replit DB in Node.js environment
if (typeof globalThis.fetch === 'undefined') {
  try {
    const nodeFetch = require('node-fetch')
    globalThis.fetch = nodeFetch.default || nodeFetch
    globalThis.Headers = nodeFetch.Headers
    globalThis.Request = nodeFetch.Request
    globalThis.Response = nodeFetch.Response
  } catch (error) {
    console.warn('node-fetch not available, using fallback')
    globalThis.fetch = async () => ({ ok: false, json: async () => ({}), text: async () => '' })
  }
}

const db = new Database(process.env.REPLIT_DB_URL)

export interface ImageRecord {
  id: string
  type: 'banner' | 'product' | 'ad' | 'background' | 'category' | 'supplier'
  tags: string[]
  url: string
  alt?: string
  createdAt: string
}

// Curated industrial/oil & gas/marine images for Muvex
const defaultImages: Omit<ImageRecord, 'id' | 'createdAt'>[] = [
  // Oil & Gas Equipment
  {
    type: 'product',
    tags: ['oil', 'gas', 'pipe', 'fitting', 'industrial'],
    url: 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=400&h=300&fit=crop&q=80',
    alt: 'Industrial pipe fittings'
  },
  {
    type: 'product',
    tags: ['pressure', 'vessel', 'tank', 'steel'],
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&h=300&fit=crop&q=80',
    alt: 'Pressure vessels'
  },
  {
    type: 'product',
    tags: ['valve', 'control', 'industrial', 'steel'],
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&q=80',
    alt: 'Industrial valves'
  },
  {
    type: 'product',
    tags: ['measurement', 'instrument', 'gauge', 'precision'],
    url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop&q=80',
    alt: 'Measurement instruments'
  },
  
  // Marine & Offshore
  {
    type: 'product',
    tags: ['offshore', 'marine', 'platform', 'drilling'],
    url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop&q=80',
    alt: 'Offshore drilling platform'
  },
  {
    type: 'product',
    tags: ['rope', 'access', 'safety', 'equipment'],
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&q=80',
    alt: 'Rope access equipment'
  },
  
  // Categories
  {
    type: 'category',
    tags: ['cra', 'alloy', 'corrosion', 'resistant'],
    url: 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=300&h=200&fit=crop&q=80',
    alt: 'Corrosion-resistant alloys'
  },
  {
    type: 'category',
    tags: ['storage', 'tank', 'rental'],
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop&q=80',
    alt: 'Storage tanks'
  },
  
  // Banners & Backgrounds
  {
    type: 'banner',
    tags: ['industrial', 'facility', 'manufacturing'],
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=2070&h=800&fit=crop&q=80',
    alt: 'Industrial facility'
  },
  {
    type: 'background',
    tags: ['warehouse', 'logistics', 'supply'],
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&q=80',
    alt: 'Industrial warehouse'
  },
  {
    type: 'background',
    tags: ['factory', 'tour', 'manufacturing'],
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop&q=80',
    alt: 'Factory tour'
  }
]

export const imageLibrary = {
  async initializeImages(): Promise<void> {
    try {
      const existingImages = await db.get('image_library')
      if (!existingImages || existingImages.length === 0) {
        const images: ImageRecord[] = defaultImages.map(img => ({
          ...img,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        }))
        
        await db.set('image_library', images)
        console.log(`✅ Initialized ${images.length} images in library`)
      }
    } catch (error) {
      console.error('Failed to initialize image library:', error)
    }
  },

  async getImageByTag(tag: string, type?: ImageRecord['type']): Promise<string> {
    try {
      const images = await db.get('image_library') as ImageRecord[] || []
      const filteredImages = images.filter(img => {
        const hasTag = img.tags.includes(tag)
        const hasType = type ? img.type === type : true
        return hasTag && hasType
      })
      
      if (filteredImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredImages.length)
        return filteredImages[randomIndex].url
      }
      
      // Fallback to default image
      return 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=400&h=300&fit=crop&q=80'
    } catch (error) {
      console.error('Failed to get image by tag:', error)
      return 'https://images.unsplash.com/photo-1565611684819-ba5b9e6e2a18?w=400&h=300&fit=crop&q=80'
    }
  },

  async getImagesByType(type: ImageRecord['type']): Promise<ImageRecord[]> {
    try {
      const images = await db.get('image_library') as ImageRecord[] || []
      return images.filter(img => img.type === type)
    } catch (error) {
      console.error('Failed to get images by type:', error)
      return []
    }
  },

  async addImage(image: Omit<ImageRecord, 'id' | 'createdAt'>): Promise<void> {
    try {
      const images = await db.get('image_library') as ImageRecord[] || []
      const newImage: ImageRecord = {
        ...image,
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }
      
      images.push(newImage)
      await db.set('image_library', images)
    } catch (error) {
      console.error('Failed to add image:', error)
    }
  }
}
