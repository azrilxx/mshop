// Fix for server-side usage of @replit/database
let Database: any
let db: any

if (typeof window === 'undefined') {
  // Server-side: dynamically import and handle fetch polyfill
  try {
    if (!global.fetch) {
      global.fetch = require('node-fetch')
    }
    Database = require('@replit/database')
    db = new Database()
  } catch (error) {
    console.error('Failed to initialize Replit Database:', error)
    // Fallback to mock implementation for development
    db = {
      get: async (key: string) => null,
      set: async (key: string, value: any) => {},
      delete: async (key: string) => {},
      list: async (prefix?: string) => []
    }
  }
} else {
  // Client-side: use regular import
  Database = require('@replit/database')
  db = new Database()
}

export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  plan: 'free' | 'standard' | 'premium'
  tenant_id: string
  created_at: string
  status: 'active' | 'inactive' | 'pending'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  seller_id: string
  image_url: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  stock: number
  tags: string[]
}

export interface Advertisement {
  id: string
  seller_id: string
  product_id: string
  title: string
  description: string
  image_url: string
  active_from: string
  active_until: string
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  total_price: number
  status: 'unpaid' | 'to_ship' | 'shipping' | 'complete' | 'cancelled'
  created_at: string
  updated_at: string
  shipping_address: string
}

export interface Rating {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
}

export interface Storefront {
  id: string
  merchant_id: string
  store_name: string
  slug: string
  bio: string
  logo_url?: string
  banner_url?: string
  custom_domain?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export class DatabaseOperations {
  private async safeGet(key: string): Promise<any> {
    try {
      const result = await db.get(key)
      return result || null
    } catch (error) {
      console.error(`Database get error for key ${key}:`, error)
      return null
    }
  }

  private async safeSet(key: string, value: any): Promise<void> {
    try {
      await db.set(key, value)
    } catch (error) {
      console.error(`Database set error for key ${key}:`, error)
      throw error
    }
  }

  async getAllFromTable<T>(tableName: string): Promise<T[]> {
    try {
      const data = await this.safeGet(tableName)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error(`Error fetching from table ${tableName}:`, error)
      return []
    }
  }

  async addToTable<T>(tableName: string, item: T): Promise<void> {
    try {
      const existingData = await this.getAllFromTable<T>(tableName)
      existingData.push(item)
      await this.safeSet(tableName, existingData)
    } catch (error) {
      console.error(`Error adding to table ${tableName}:`, error)
      throw error
    }
  }

  async updateInTable<T extends { id: string }>(tableName: string, id: string, updates: Partial<T>): Promise<void> {
    try {
      const existingData = await this.getAllFromTable<T>(tableName)
      const index = existingData.findIndex(item => item.id === id)
      if (index !== -1) {
        existingData[index] = { ...existingData[index], ...updates }
        await this.safeSet(tableName, existingData)
      }
    } catch (error) {
      console.error(`Error updating in table ${tableName}:`, error)
      throw error
    }
  }

  async removeFromTable<T extends { id: string }>(tableName: string, id: string): Promise<void> {
    try {
      const existingData = await this.getAllFromTable<T>(tableName)
      const filteredData = existingData.filter(item => item.id !== id)
      await this.safeSet(tableName, filteredData)
    } catch (error) {
      console.error(`Error removing from table ${tableName}:`, error)
      throw error
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    await this.addToTable('users', user)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllFromTable<User>('users')
    return users.find(user => user.email === email) || null
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllFromTable<User>('users')
    return users.find(user => user.id === id) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await this.updateInTable('users', id, updates)
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return this.getAllFromTable<Product>('products')
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const products = await this.getProducts()
    return products.filter(product => product.seller_id === sellerId)
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts()
    return products.find(product => product.id === id) || null
  }

  async createProduct(product: Product): Promise<void> {
    await this.addToTable('products', product)
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await this.updateInTable('products', id, updates)
  }

  // Advertisement operations
  async getAdvertisements(): Promise<Advertisement[]> {
    return this.getAllFromTable<Advertisement>('advertisements')
  }

  async getActiveAdvertisements(): Promise<Advertisement[]> {
    const ads = await this.getAdvertisements()
    const now = new Date().toISOString()
    return ads.filter(ad => 
      ad.status === 'active' && 
      ad.active_from <= now && 
      ad.active_until >= now
    )
  }

  async getAdvertisementsBySeller(sellerId: string): Promise<Advertisement[]> {
    const ads = await this.getAdvertisements()
    return ads.filter(ad => ad.seller_id === sellerId)
  }

  async createAdvertisement(ad: Advertisement): Promise<void> {
    await this.addToTable('advertisements', ad)
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<void> {
    await this.updateInTable('advertisements', id, updates)
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return this.getAllFromTable<Order>('orders')
  }

  async getOrdersBySeller(sellerId: string): Promise<Order[]> {
    const orders = await this.getOrders()
    return orders.filter(order => order.seller_id === sellerId)
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    const orders = await this.getOrders()
    return orders.filter(order => order.buyer_id === buyerId)
  }

  async createOrder(order: Order): Promise<void> {
    await this.addToTable('orders', order)
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    await this.updateInTable('orders', id, updates)
  }

  // Rating operations
  async getRatingsByProduct(productId: string): Promise<Rating[]> {
    const ratings = await this.getAllFromTable<Rating>('ratings')
    return ratings.filter(rating => rating.product_id === productId)
  }

  async createRating(rating: Rating): Promise<void> {
    await this.addToTable('ratings', rating)
  }

  // Plan operations
  async getUserPlan(userId: string): Promise<{ tier: string; maxProducts: number; maxAds: number } | null> {
    const plans = await this.getAllFromTable<any>('user_plans')
    return plans.find(plan => plan.userId === userId) || null
  }

  async updateUserPlan(userId: string, planData: any): Promise<void> {
    const plans = await this.getAllFromTable<any>('user_plans')
    const existingIndex = plans.findIndex(plan => plan.userId === userId)

    if (existingIndex !== -1) {
      plans[existingIndex] = { ...plans[existingIndex], ...planData }
    } else {
      plans.push({ userId, ...planData })
    }

    await this.safeSet('user_plans', plans)
  }

  // Usage tracking
  async getUserUsage(userId: string): Promise<{ productsCreated: number; adsCreated: number; reportsGenerated: number } | null> {
    const usage = await this.getAllFromTable<any>('user_usage')
    return usage.find(u => u.userId === userId) || { productsCreated: 0, adsCreated: 0, reportsGenerated: 0 }
  }

  async incrementUsage(userId: string, field: string): Promise<void> {
    const usage = await this.getAllFromTable<any>('user_usage')
    const existingIndex = usage.findIndex(u => u.userId === userId)

    if (existingIndex !== -1) {
      usage[existingIndex][field] = (usage[existingIndex][field] || 0) + 1
    } else {
      usage.push({ userId, [field]: 1 })
    }

    await this.safeSet('user_usage', usage)
  }

  // Insights operations
  async getInsights(): Promise<any[]> {
    return this.getAllFromTable<any>('insights')
  }

  // Storefront operations
  async getStorefronts(): Promise<Storefront[]> {
    return this.getAllFromTable<Storefront>('storefronts')
  }

  async getStorefrontBySlug(slug: string): Promise<Storefront | null> {
    const storefronts = await this.getStorefronts()
    return storefronts.find(store => store.slug === slug) || null
  }

  async getStorefrontByMerchant(merchantId: string): Promise<Storefront | null> {
    const storefronts = await this.getStorefronts()
    return storefronts.find(store => store.merchant_id === merchantId) || null
  }

  async createStorefront(storefront: Storefront): Promise<void> {
    await this.addToTable('storefronts', storefront)
  }

  async updateStorefront(id: string, updates: Partial<Storefront>): Promise<void> {
    await this.updateInTable('storefronts', id, updates)
  }

  async generateUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const storefronts = await this.getStorefronts()
    let counter = 0
    let slug = baseSlug

    while (storefronts.find(store => store.slug === slug)) {
      counter++
      slug = `${baseSlug}-${counter}`
    }

    return slug
  }

  // Enhanced product operations with merchant filtering
  async getProductsByMerchant(merchantId: string): Promise<Product[]> {
    const products = await this.getProducts()
    return products.filter(product => product.seller_id === merchantId)
  }

  async getPublicProductsByMerchant(merchantId: string): Promise<Product[]> {
    const products = await this.getProductsByMerchant(merchantId)
    return products.filter(product => product.status === 'active')
  }

  // Enhanced order operations with merchant filtering
  async getOrdersByMerchantId(merchantId: string): Promise<Order[]> {
    const orders = await this.getOrders()
    return orders.filter(order => order.seller_id === merchantId)
  }

  // Enhanced advertisement operations with merchant filtering
  async getAdsByMerchant(merchantId: string): Promise<Advertisement[]> {
    const ads = await this.getAdvertisements()
    return ads.filter(ad => ad.seller_id === merchantId)
  }
}

export const dbOps = new DatabaseOperations()