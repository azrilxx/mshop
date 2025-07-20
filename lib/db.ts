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
  // Security middleware - Row Level Security equivalent
  private async checkUserAccess(userId: string, resourceOwnerId: string, userRole?: string): Promise<boolean> {
    // Admin bypass
    if (userRole === 'admin') return true
    // User can access their own resources
    return userId === resourceOwnerId
  }

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

  // Performance optimization - In-memory indexes
  private productIndexes: Map<string, string[]> = new Map()
  private orderIndexes: Map<string, string[]> = new Map()
  private ratingIndexes: Map<string, string[]> = new Map()

  private async buildIndexes(): Promise<void> {
    try {
      // Build product indexes by merchant_id
      const products = await this.getAllFromTable<Product>('products')
      const productsByMerchant = new Map<string, string[]>()
      products.forEach(product => {
        if (!productsByMerchant.has(product.seller_id)) {
          productsByMerchant.set(product.seller_id, [])
        }
        productsByMerchant.get(product.seller_id)?.push(product.id)
      })
      this.productIndexes = productsByMerchant

      // Build order indexes
      const orders = await this.getAllFromTable<Order>('orders')
      const ordersByBuyer = new Map<string, string[]>()
      const ordersBySeller = new Map<string, string[]>()
      orders.forEach(order => {
        if (!ordersByBuyer.has(order.buyer_id)) {
          ordersByBuyer.set(order.buyer_id, [])
        }
        if (!ordersBySeller.has(order.seller_id)) {
          ordersBySeller.set(order.seller_id, [])
        }
        ordersByBuyer.get(order.buyer_id)?.push(order.id)
        ordersBySeller.get(order.seller_id)?.push(order.id)
      })
      this.orderIndexes = new Map([...ordersByBuyer, ...ordersBySeller])

      // Build rating indexes by product_id
      const ratings = await this.getAllFromTable<Rating>('ratings')
      const ratingsByProduct = new Map<string, string[]>()
      ratings.forEach(rating => {
        if (!ratingsByProduct.has(rating.product_id)) {
          ratingsByProduct.set(rating.product_id, [])
        }
        ratingsByProduct.get(rating.product_id)?.push(rating.id)
      })
      this.ratingIndexes = ratingsByProduct
    } catch (error) {
      console.error('Error building indexes:', error)
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

  // User operations with security checks
  async createUser(user: User): Promise<void> {
    // Validate required fields
    if (!user.email || !user.name || !user.role) {
      throw new Error('Missing required user fields')
    }
    await this.addToTable('users', user)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllFromTable<User>('users')
    return users.find(user => user.email === email) || null
  }

  async getUserById(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<User | null> {
    const users = await this.getAllFromTable<User>('users')
    const user = users.find(user => user.id === id) || null
    
    // Security check - users can only access their own profile unless admin
    if (user && requestingUserId && !await this.checkUserAccess(requestingUserId, user.id, requestingUserRole)) {
      return null
    }
    return user
  }

  async updateUser(id: string, updates: Partial<User>, requestingUserId?: string, requestingUserRole?: string): Promise<void> {
    // Security check
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    await this.updateInTable('users', id, updates)
  }

  // Product operations with security and performance optimization
  async getProducts(requestingUserId?: string, requestingUserRole?: string): Promise<Product[]> {
    const products = await this.getAllFromTable<Product>('products')
    
    // If not admin, only return active products or user's own products
    if (requestingUserRole !== 'admin') {
      return products.filter(product => 
        product.status === 'active' || 
        (requestingUserId && product.seller_id === requestingUserId)
      )
    }
    return products
  }

  async getProductsBySeller(sellerId: string, requestingUserId?: string, requestingUserRole?: string): Promise<Product[]> {
    // Security check - users can only access their own products unless admin
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, sellerId, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    // Use index if available for performance
    await this.buildIndexes()
    const productIds = this.productIndexes.get(sellerId) || []
    const allProducts = await this.getProducts()
    return allProducts.filter(product => productIds.includes(product.id))
  }

  async getProductById(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<Product | null> {
    const products = await this.getProducts()
    const product = products.find(product => product.id === id) || null
    
    // Security check - non-active products only visible to owner or admin
    if (product && product.status !== 'active' && requestingUserId) {
      if (!await this.checkUserAccess(requestingUserId, product.seller_id, requestingUserRole)) {
        return null
      }
    }
    return product
  }

  async createProduct(product: Product, requestingUserId: string): Promise<void> {
    // Validate required fields
    if (!product.name || !product.price || !product.seller_id) {
      throw new Error('Missing required product fields')
    }
    
    // Security check - users can only create products for themselves
    if (product.seller_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create product for another user')
    }
    
    await this.addToTable('products', product)
    // Update indexes
    await this.buildIndexes()
  }

  async updateProduct(id: string, updates: Partial<Product>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const product = await this.getProductById(id)
    if (!product) {
      throw new Error('Product not found')
    }
    
    // Security check
    if (!await this.checkUserAccess(requestingUserId, product.seller_id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    await this.updateInTable('products', id, updates)
  }

  // Advertisement operations with security checks
  async getAdvertisements(requestingUserId?: string, requestingUserRole?: string): Promise<Advertisement[]> {
    const ads = await this.getAllFromTable<Advertisement>('advertisements')
    
    // If not admin, only return user's own ads or active public ads
    if (requestingUserRole !== 'admin') {
      return ads.filter(ad => 
        ad.seller_id === requestingUserId || 
        (ad.status === 'active' && new Date(ad.active_from) <= new Date() && new Date(ad.active_until) >= new Date())
      )
    }
    return ads
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

  async getAdvertisementsBySeller(sellerId: string, requestingUserId: string, requestingUserRole?: string): Promise<Advertisement[]> {
    // Security check
    if (!await this.checkUserAccess(requestingUserId, sellerId, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    const ads = await this.getAdvertisements()
    return ads.filter(ad => ad.seller_id === sellerId)
  }

  async createAdvertisement(ad: Advertisement, requestingUserId: string): Promise<void> {
    // Validate required fields
    if (!ad.seller_id || !ad.title || !ad.active_from || !ad.active_until) {
      throw new Error('Missing required advertisement fields')
    }
    
    // Security check
    if (ad.seller_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create advertisement for another user')
    }
    
    await this.addToTable('advertisements', ad)
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const ads = await this.getAllFromTable<Advertisement>('advertisements')
    const ad = ads.find(a => a.id === id)
    if (!ad) {
      throw new Error('Advertisement not found')
    }
    
    // Security check
    if (!await this.checkUserAccess(requestingUserId, ad.seller_id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    await this.updateInTable('advertisements', id, updates)
  }

  // Order operations with security and performance optimization
  async getOrders(requestingUserId: string, requestingUserRole?: string): Promise<Order[]> {
    const orders = await this.getAllFromTable<Order>('orders')
    
    // Security: only admins can see all orders
    if (requestingUserRole === 'admin') {
      return orders
    }
    
    // Users can only see their own orders (as buyer or seller)
    return orders.filter(order => 
      order.buyer_id === requestingUserId || order.seller_id === requestingUserId
    )
  }

  async getOrdersBySeller(sellerId: string, requestingUserId: string, requestingUserRole?: string): Promise<Order[]> {
    // Security check
    if (!await this.checkUserAccess(requestingUserId, sellerId, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    // Use index for performance
    await this.buildIndexes()
    const orderIds = this.orderIndexes.get(sellerId) || []
    const allOrders = await this.getAllFromTable<Order>('orders')
    return allOrders.filter(order => orderIds.includes(order.id) && order.seller_id === sellerId)
  }

  async getOrdersByBuyer(buyerId: string, requestingUserId: string, requestingUserRole?: string): Promise<Order[]> {
    // Security check
    if (!await this.checkUserAccess(requestingUserId, buyerId, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    // Use index for performance
    await this.buildIndexes()
    const orderIds = this.orderIndexes.get(buyerId) || []
    const allOrders = await this.getAllFromTable<Order>('orders')
    return allOrders.filter(order => orderIds.includes(order.id) && order.buyer_id === buyerId)
  }

  async createOrder(order: Order, requestingUserId: string): Promise<void> {
    // Validate required fields
    if (!order.buyer_id || !order.seller_id || !order.product_id || !order.total_price) {
      throw new Error('Missing required order fields')
    }
    
    // Security check - users can only create orders as buyers
    if (order.buyer_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create order for another user')
    }
    
    await this.addToTable('orders', order)
    // Update indexes
    await this.buildIndexes()
  }

  async updateOrder(id: string, updates: Partial<Order>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const orders = await this.getAllFromTable<Order>('orders')
    const order = orders.find(o => o.id === id)
    if (!order) {
      throw new Error('Order not found')
    }
    
    // Security check - buyers and sellers can update their orders
    const canAccess = order.buyer_id === requestingUserId || 
                     order.seller_id === requestingUserId || 
                     requestingUserRole === 'admin'
    
    if (!canAccess) {
      throw new Error('Unauthorized access')
    }
    
    await this.updateInTable('orders', id, updates)
  }

  // Rating operations with security and performance optimization
  async getRatingsByProduct(productId: string): Promise<Rating[]> {
    // Use index for performance
    await this.buildIndexes()
    const ratingIds = this.ratingIndexes.get(productId) || []
    const allRatings = await this.getAllFromTable<Rating>('ratings')
    return allRatings.filter(rating => ratingIds.includes(rating.id))
  }

  async createRating(rating: Rating, requestingUserId: string): Promise<void> {
    // Validate required fields
    if (!rating.product_id || !rating.user_id || !rating.rating || rating.rating < 1 || rating.rating > 5) {
      throw new Error('Invalid rating data')
    }
    
    // Security check - users can only create ratings as themselves
    if (rating.user_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create rating for another user')
    }
    
    // Check for duplicate ratings
    const existingRatings = await this.getRatingsByProduct(rating.product_id)
    const existingRating = existingRatings.find(r => r.user_id === requestingUserId)
    if (existingRating) {
      throw new Error('User has already rated this product')
    }
    
    await this.addToTable('ratings', rating)
    // Update indexes
    await this.buildIndexes()
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

  // Storefront operations with security checks
  async getStorefronts(requestingUserId?: string, requestingUserRole?: string): Promise<Storefront[]> {
    const storefronts = await this.getAllFromTable<Storefront>('storefronts')
    
    // If not admin, only return user's own storefront or active public ones
    if (requestingUserRole !== 'admin') {
      return storefronts.filter(store => 
        store.merchant_id === requestingUserId || 
        store.status === 'active'
      )
    }
    return storefronts
  }

  async getStorefrontBySlug(slug: string): Promise<Storefront | null> {
    const storefronts = await this.getStorefronts()
    const storefront = storefronts.find(store => store.slug === slug) || null
    
    // Public storefronts are visible to all
    if (storefront && storefront.status === 'active') {
      return storefront
    }
    return null
  }

  async getStorefrontByMerchant(merchantId: string, requestingUserId?: string, requestingUserRole?: string): Promise<Storefront | null> {
    // Security check for private access
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, merchantId, requestingUserRole)) {
      // Return only if storefront is public
      const storefronts = await this.getStorefronts()
      const storefront = storefronts.find(store => store.merchant_id === merchantId) || null
      return (storefront && storefront.status === 'active') ? storefront : null
    }
    
    const storefronts = await this.getStorefronts()
    return storefronts.find(store => store.merchant_id === merchantId) || null
  }

  async createStorefront(storefront: Storefront, requestingUserId: string): Promise<void> {
    // Validate required fields
    if (!storefront.merchant_id || !storefront.store_name || !storefront.slug) {
      throw new Error('Missing required storefront fields')
    }
    
    // Security check
    if (storefront.merchant_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create storefront for another user')
    }
    
    // Check for duplicate slug
    const existingStorefront = await this.getStorefrontBySlug(storefront.slug)
    if (existingStorefront) {
      throw new Error('Storefront slug already exists')
    }
    
    await this.addToTable('storefronts', storefront)
  }

  async updateStorefront(id: string, updates: Partial<Storefront>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const storefronts = await this.getAllFromTable<Storefront>('storefronts')
    const storefront = storefronts.find(s => s.id === id)
    if (!storefront) {
      throw new Error('Storefront not found')
    }
    
    // Security check
    if (!await this.checkUserAccess(requestingUserId, storefront.merchant_id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }
    
    // If updating slug, check for duplicates
    if (updates.slug && updates.slug !== storefront.slug) {
      const existingStorefront = await this.getStorefrontBySlug(updates.slug)
      if (existingStorefront) {
        throw new Error('Storefront slug already exists')
      }
    }
    
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

// Initialize database operations and build indexes
export const dbOps = new DatabaseOperations()

// Initialize indexes on startup
if (typeof window === 'undefined') {
  // Only run on server side
  dbOps.buildIndexes().catch(console.error)
}