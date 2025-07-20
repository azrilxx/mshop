import Database from "@replit/database"

// Initialize Replit Database
const db = new Database()

// Types for our multi-tenant SaaS
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  plan: 'free' | 'standard' | 'premium'
  tenant_id?: string
  created_at: string
  status: 'active' | 'suspended' | 'pending'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  seller_id: string
  tenant_id: string
  status: 'pending' | 'approved' | 'rejected'
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  products: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  tenant_id: string
}

export interface Advertisement {
  id: string
  title: string
  description: string
  imageUrl: string
  productId: string
  sellerId: string
  status: 'active' | 'paused' | 'expired'
  created_at: string
  tenant_id: string
}

export interface Quote {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  quantity: number
  message: string
  status: 'pending' | 'responded' | 'accepted' | 'declined'
  created_at: string
  tenant_id: string
}

export interface Cart {
  id: string
  user_id: string
  items: Array<{
    product_id: string
    quantity: number
  }>
  tenant_id: string
  updated_at: string
}

export interface Rating {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  tenant_id: string
}

export interface Report {
  id: string
  reporter_id: string
  type: 'product' | 'user' | 'order'
  target_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  tenant_id: string
}

export interface Service {
  id: string
  name: string
  description: string
  provider_id: string
  category: string
  pricing: {
    type: 'fixed' | 'hourly' | 'project'
    amount: number
  }
  status: 'active' | 'inactive'
  created_at: string
  tenant_id: string
}

export interface Insight {
  id: string
  title: string
  content: string
  author_id: string
  category: string
  featured: boolean
  published_at: string
  tenant_id: string
}

// Database operations with tenant isolation
class DatabaseOperations {
  private async getKey(table: string, id?: string): Promise<string> {
    return id ? `${table}:${id}` : table
  }

  private async getAllFromTable<T>(table: string, tenant_id?: string): Promise<T[]> {
    try {
      const data = await db.get(table) || []
      if (tenant_id) {
        return data.filter((item: any) => item.tenant_id === tenant_id)
      }
      return data
    } catch (error) {
      console.error(`Error fetching ${table}:`, error)
      return []
    }
  }

  private async addToTable<T extends { id: string }>(table: string, item: T): Promise<T> {
    try {
      const existing = await db.get(table) || []
      const updated = [...existing, item]
      await db.set(table, updated)
      return item
    } catch (error) {
      console.error(`Error adding to ${table}:`, error)
      throw error
    }
  }

  private async updateInTable<T extends { id: string }>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const existing = await db.get(table) || []
      const index = existing.findIndex((item: any) => item.id === id)
      if (index === -1) return null

      existing[index] = { ...existing[index], ...updates }
      await db.set(table, existing)
      return existing[index]
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }
  }

  private async removeFromTable(table: string, id: string): Promise<boolean> {
    try {
      const existing = await db.get(table) || []
      const filtered = existing.filter((item: any) => item.id !== id)
      await db.set(table, filtered)
      return true
    } catch (error) {
      console.error(`Error removing from ${table}:`, error)
      return false
    }
  }

  // User operations
  async getUsers(tenant_id?: string): Promise<User[]> {
    return this.getAllFromTable<User>('users', tenant_id)
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(user => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(user => user.email === email) || null
  }

  async createUser(user: User): Promise<User> {
    return this.addToTable('users', user)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.updateInTable('users', id, updates)
  }

  // Product operations
  async getProducts(tenant_id?: string): Promise<Product[]> {
    return this.getAllFromTable<Product>('products', tenant_id)
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts()
    return products.find(product => product.id === id) || null
  }

  async createProduct(product: Product): Promise<Product> {
    return this.addToTable('products', product)
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return this.updateInTable('products', id, updates)
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.removeFromTable('products', id)
  }

  // Order operations
  async getOrders(tenant_id?: string): Promise<Order[]> {
    return this.getAllFromTable<Order>('orders', tenant_id)
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders()
    return orders.find(order => order.id === id) || null
  }

  async createOrder(order: Order): Promise<Order> {
    return this.addToTable('orders', order)
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    return this.updateInTable('orders', id, updates)
  }

  // Advertisement operations
  async getAdvertisements(tenant_id?: string): Promise<Advertisement[]> {
    return this.getAllFromTable<Advertisement>('advertisements', tenant_id)
  }

  async createAdvertisement(ad: Advertisement): Promise<Advertisement> {
    return this.addToTable('advertisements', ad)
  }

  // Quote operations
  async getQuotes(tenant_id?: string): Promise<Quote[]> {
    return this.getAllFromTable<Quote>('quotes', tenant_id)
  }

  async createQuote(quote: Quote): Promise<Quote> {
    return this.addToTable('quotes', quote)
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    return this.updateInTable('quotes', id, updates)
  }

  // Cart operations
  async getCart(user_id: string): Promise<Cart | null> {
    const carts = await this.getAllFromTable<Cart>('carts')
    return carts.find(cart => cart.user_id === user_id) || null
  }

  async updateCart(cart: Cart): Promise<Cart> {
    const existing = await this.getCart(cart.user_id)
    if (existing) {
      return this.updateInTable('carts', existing.id, cart) as Promise<Cart>
    } else {
      return this.addToTable('carts', cart)
    }
  }

  // Rating operations
  async getRatings(product_id?: string): Promise<Rating[]> {
    const ratings = await this.getAllFromTable<Rating>('ratings')
    return product_id ? ratings.filter(r => r.product_id === product_id) : ratings
  }

  async createRating(rating: Rating): Promise<Rating> {
    return this.addToTable('ratings', rating)
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    return this.getAllFromTable<Report>('reports')
  }

  async createReport(report: Report): Promise<Report> {
    return this.addToTable('reports', report)
  }

  // Service operations
  async getServices(tenant_id?: string): Promise<Service[]> {
    return this.getAllFromTable<Service>('services', tenant_id)
  }

  async getServiceById(id: string): Promise<Service | null> {
    const services = await this.getServices()
    return services.find(service => service.id === id) || null
  }

  async createService(service: Service): Promise<Service> {
    return this.addToTable('services', service)
  }

  // Insight operations
  async getInsights(): Promise<Insight[]> {
    return this.getAllFromTable<Insight>('insights')
  }

  async getInsightById(id: string): Promise<Insight | null> {
    const insights = await this.getInsights()
    return insights.find(insight => insight.id === id) || null
  }

  async createInsight(insight: Insight): Promise<Insight> {
    return this.addToTable('insights', insight)
  }

  // Plan enforcement helpers
  async checkUserPlanLimit(userId: string, resource: string): Promise<boolean> {
    const user = await this.getUserById(userId)
    if (!user) return false

    const limits = {
      free: { products: 5, ads: 1, quotes: 10 },
      standard: { products: 50, ads: 10, quotes: 100 },
      premium: { products: -1, ads: -1, quotes: -1 } // unlimited
    }

    const userLimits = limits[user.plan]
    if (!userLimits) return false

    const limit = userLimits[resource as keyof typeof userLimits]
    if (limit === -1) return true // unlimited

    // Count current usage
    let currentCount = 0
    switch (resource) {
      case 'products':
        const products = await this.getProducts(user.tenant_id)
        currentCount = products.filter(p => p.seller_id === userId).length
        break
      case 'ads':
        const ads = await this.getAdvertisements(user.tenant_id)
        currentCount = ads.filter(a => a.sellerId === userId).length
        break
      case 'quotes':
        const quotes = await this.getQuotes(user.tenant_id)
        currentCount = quotes.filter(q => q.buyer_id === userId).length
        break
    }

    return currentCount < limit
  }
}

// Export singleton instance
export const dbOps = new DatabaseOperations()

// Legacy exports for backward compatibility
export const userDb = {
  getAll: () => dbOps.getUsers(),
  getById: (id: string) => dbOps.getUserById(id),
  getByEmail: (email: string) => dbOps.getUserByEmail(email),
  create: (user: User) => dbOps.createUser(user),
  update: (id: string, updates: Partial<User>) => dbOps.updateUser(id, updates)
}

export const productDb = {
  getAll: () => dbOps.getProducts(),
  getById: (id: string) => dbOps.getProductById(id),
  create: (product: Product) => dbOps.createProduct(product),
  update: (id: string, updates: Partial<Product>) => dbOps.updateProduct(id, updates),
  delete: (id: string) => dbOps.deleteProduct(id)
}

export const orderDb = {
  getAll: () => dbOps.getOrders(),
  getById: (id: string) => dbOps.getOrderById(id),
  create: (order: Order) => dbOps.createOrder(order),
  update: (id: string, updates: Partial<Order>) => dbOps.updateOrder(id, updates)
}

export const quoteDb = {
  getAll: () => dbOps.getQuotes(),
  create: (quote: Quote) => dbOps.createQuote(quote),
  update: (id: string, updates: Partial<Quote>) => dbOps.updateQuote(id, updates)
}

export const adDb = {
  getAll: () => dbOps.getAdvertisements(),
  create: (ad: Advertisement) => dbOps.createAdvertisement(ad)
}

export const cartDb = {
  get: (userId: string) => dbOps.getCart(userId),
  update: (cart: Cart) => dbOps.updateCart(cart)
}

export const ratingDb = {
  getByProduct: (productId: string) => dbOps.getRatings(productId),
  create: (rating: Rating) => dbOps.createRating(rating)
}

export const reportDb = {
  getAll: () => dbOps.getReports(),
  create: (report: Report) => dbOps.createReport(report)
}

export const serviceDb = {
  getAll: () => dbOps.getServices(),
  getById: (id: string) => dbOps.getServiceById(id),
  create: (service: Service) => dbOps.createService(service)
}

export const insightDb = {
  getAll: () => dbOps.getInsights(),
  getById: (id: string) => dbOps.getInsightById(id),
  create: (insight: Insight) => dbOps.createInsight(insight)
}

// Initialize database with seed data if empty
export async function initializeDatabase() {
  try {
    const users = await dbOps.getUsers()
    if (users.length === 0) {
      // Create default admin user
      await dbOps.createUser({
        id: 'admin-1',
        email: 'admin@muvex.com',
        name: 'System Admin',
        role: 'admin',
        plan: 'premium',
        tenant_id: 'system',
        created_at: new Date().toISOString(),
        status: 'active'
      })

      // Create sample seller
      await dbOps.createUser({
        id: 'seller-1',
        email: 'seller@example.com',
        name: 'Test Seller',
        role: 'seller',
        plan: 'standard',
        tenant_id: 'tenant-1',
        created_at: new Date().toISOString(),
        status: 'active'
      })

      console.log('Database initialized with seed data')
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

export default db