import Database from '@replit/database'

const db = new Database()

export interface ImageRecord {
  id: string
  url: string
  type: 'banner' | 'product' | 'ad' | 'background'
  tags: string[]
  description?: string
}

// Default fallback images
const FALLBACK_IMAGES = {
  product: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
  banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
  ad: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop',
  background: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop'
}

class ImageLibrary {
  private async safeGet(key: string): Promise<any> {
    try {
      return await db.get(key) || null
    } catch (error) {
      console.error(`Image library get error for key ${key}:`, error)
      return null
    }
  }

  private async safeSet(key: string, value: any): Promise<void> {
    try {
      await db.set(key, value)
    } catch (error) {
      console.error(`Image library set error for key ${key}:`, error)
    }
  }

  async initializeImages(): Promise<void> {
    try {
      const existingImages = await this.safeGet('image_library')
      if (!existingImages || existingImages.length === 0) {
        const defaultImages: ImageRecord[] = [
          {
            id: 'banner-1',
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
            type: 'banner',
            tags: ['business', 'industry', 'corporate'],
            description: 'Industrial warehouse banner'
          },
          {
            id: 'product-1',
            url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            type: 'product',
            tags: ['equipment', 'industrial', 'machinery'],
            description: 'Industrial equipment'
          },
          {
            id: 'ad-1',
            url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop',
            type: 'ad',
            tags: ['logistics', 'shipping', 'supply'],
            description: 'Supply chain advertisement'
          }
        ]
        await this.safeSet('image_library', defaultImages)
      }
    } catch (error) {
      console.error('Failed to initialize image library:', error)
    }
  }

  async getImageByTag(tag: string): Promise<string> {
    try {
      const images = await this.safeGet('image_library') || []
      const matchingImage = images.find((img: ImageRecord) => 
        img.tags.includes(tag)
      )
      return matchingImage?.url || FALLBACK_IMAGES.product
    } catch (error) {
      console.error('Failed to get image by tag:', error)
      return FALLBACK_IMAGES.product
    }
  }

  async getImagesByType(type: 'banner' | 'product' | 'ad' | 'background'): Promise<ImageRecord[]> {
    try {
      const images = await this.safeGet('image_library') || []
      return images.filter((img: ImageRecord) => img.type === type)
    } catch (error) {
      console.error('Failed to get images by type:', error)
      return []
    }
  }

  async addImage(image: ImageRecord): Promise<void> {
    try {
      const images = await this.safeGet('image_library') || []
      images.push(image)
      await this.safeSet('image_library', images)
    } catch (error) {
      console.error('Failed to add image:', error)
    }
  }

  getFallbackImage(type: keyof typeof FALLBACK_IMAGES): string {
    return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.product
  }
}

export const imageLibrary = new ImageLibrary()

export async function getImageByTag(tag: string): Promise<string> {
  return imageLibrary.getImageByTag(tag)
}

export async function initializeImages(): Promise<void> {
  return imageLibrary.initializeImages()
}