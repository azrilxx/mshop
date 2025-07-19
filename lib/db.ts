import Database from '@replit/database'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const db = new Database()

export interface User {
  id: string
  email: string
  passwordHash: string
  role: 'buyer' | 'seller' | 'admin'
  is_verified: boolean
  createdAt: string
  notifyOrder?: boolean
  notifyStatus?: boolean
  notifyMarketing?: boolean
  twoFactorEnabled?: boolean
  cartNotifiedAt?: string
  whatsappNumber?: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  merchantId: string
  status: 'active' | 'inactive'
  images: string[]
  listingType: 'fixed' | 'rfq'
  location: { city: string, country: string }
  certifications: string[]
  tags: string[]
  createdAt: string
}

export interface Order {
  id: string
  buyerId: string
  productIds: string[]
  totalPrice: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipmentStatus?: string
  createdAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  updatedAt: string
  reminderSent?: boolean
}

export interface SubscriptionPlan {
  userId: string
  tier: 'Free' | 'Standard' | 'Premium'
  maxProducts: number
  maxAdSlots: number
  customerSupport: boolean
  quotaUsed: number
  adSlotsUsed: number
  createdAt: string
  updatedAt: string
}

export interface Advertisement {
  id: string
  sellerId: string
  productId: string
  imageUrl: string
  title: string
  description: string
  activeFrom: string
  activeUntil: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
}

export interface SellerVerification {
  userId: string
  registrationNumber: string
  companyName: string
  logoUrl?: string
  licenseUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  adminNotes?: string
}

export interface ProductRating {
  productId: string
  userId: string
  orderId: string
  rating: number
  comment: string
  createdAt: string
}

export interface Comment {
  id: string
  productId: string
  userId: string
  parentId?: string // for replies
  content: string
  isReply: boolean
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  productId: string
  buyerId?: string // optional for anonymous quotes
  name: string
  email: string
  message: string
  createdAt: string
}

export interface Insight {
  id: string
  title: string
  content: string
  imageUrl: string
  author: string
  publishedAt: string
  featured: boolean
  excerpt: string
  tags: string[]
  readTime: number
}

export const userDb = {
  async create(email: string, password: string, role: 'buyer' | 'seller' | 'admin'): Promise<User> {
    const existingUser = await db.get(`user:${email}`)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const user: User = {
      id: uuidv4(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      is_verified: role === 'admin' ? true : false,
      createdAt: new Date().toISOString(),
      notifyOrder: true,
      notifyStatus: true,
      notifyMarketing: false,
      twoFactorEnabled: role === 'admin'
    }

    await db.set(`user:${email}`, user)
    return user
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.get(`user:${email}`)
    return user as User | null
  },

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.passwordHash)
    return isValid ? user : null
  },

  async updateVerificationStatus(email: string, is_verified: boolean): Promise<void> {
    const user = await this.findByEmail(email)
    if (user) {
      user.is_verified = is_verified
      await db.set(`user:${email}`, user)
    }
  },

  async getAll(): Promise<User[]> {
    const keys = await db.list('user:')
    const users: User[] = []
    for (const key of keys) {
      const user = await db.get(key)
      if (user) users.push(user as User)
    }
    return users
  },

  async findById(id: string): Promise<User | null> {
    const keys = await db.list('user:')
    for (const key of keys) {
      const user = await db.get(key) as User
      if (user && user.id === id) {
        return user
      }
    }
    return null
  },

  async updateUser(email: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (user) {
      const updatedUser = { ...user, ...updates }
      await db.set(`user:${email}`, updatedUser)
      return updatedUser
    }
    return null
  }
}

export const productDb = {
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }

    await db.set(`product:${newProduct.id}`, newProduct)
    return newProduct
  },

  async findById(id: string): Promise<Product | null> {
    const product = await db.get(`product:${id}`)
    return product as Product | null
  },

  async findByMerchant(merchantId: string): Promise<Product[]> {
    const keys = await db.list('product:')
    const products: Product[] = []
    
    for (const key of keys) {
      const product = await db.get(key)
      if (product && (product as Product).merchantId === merchantId) {
        products.push(product as Product)
      }
    }
    
    return products
  },

  async getAll(): Promise<Product[]> {
    const keys = await db.list('product:')
    const products: Product[] = []
    
    for (const key of keys) {
      const product = await db.get(key)
      if (product && (product as Product).status === 'active') {
        // Only show products from verified merchants
        const merchant = await this.getMerchantById((product as Product).merchantId)
        if (merchant && merchant.is_verified) {
          products.push(product as Product)
        }
      }
    }
    
    return products
  },

  async getAllForPublic(): Promise<Product[]> {
    const keys = await db.list('product:')
    const products: Product[] = []
    
    for (const key of keys) {
      const product = await db.get(key)
      if (product && (product as Product).status === 'active') {
        // For public display, verify merchant by finding user record
        const merchant = await this.getMerchantById((product as Product).merchantId)
        if (merchant && merchant.is_verified) {
          products.push(product as Product)
        }
      }
    }
    
    return products
  },

  async getMerchantById(merchantId: string): Promise<User | null> {
    return await userDb.findById(merchantId)
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const product = await this.findById(id)
    if (!product) return null

    const updatedProduct = { ...product, ...updates }
    await db.set(`product:${id}`, updatedProduct)
    return updatedProduct
  }
}

export const orderDb = {
  async create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }

    await db.set(`order:${newOrder.id}`, newOrder)
    return newOrder
  },

  async findById(id: string): Promise<Order | null> {
    const order = await db.get(`order:${id}`)
    return order as Order | null
  },

  async findByBuyer(buyerId: string): Promise<Order[]> {
    const keys = await db.list('order:')
    const orders: Order[] = []
    
    for (const key of keys) {
      const order = await db.get(key)
      if (order && (order as Order).buyerId === buyerId) {
        orders.push(order as Order)
      }
    }
    
    return orders
  },

  async getAll(): Promise<Order[]> {
    const keys = await db.list('order:')
    const orders: Order[] = []
    
    for (const key of keys) {
      const order = await db.get(key)
      if (order) orders.push(order as Order)
    }
    
    return orders
  },

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = await this.findById(id)
    if (!order) return null

    const updatedOrder = { ...order, ...updates }
    await db.set(`order:${id}`, updatedOrder)
    return updatedOrder
  },

  async findBySeller(sellerId: string): Promise<Order[]> {
    const keys = await db.list('order:')
    const orders: Order[] = []
    
    for (const key of keys) {
      const order = await db.get(key) as Order
      if (order) {
        // Check if any product in the order belongs to this seller
        const products = await Promise.all(
          order.productIds.map(id => productDb.findById(id))
        )
        
        const hasSellerProducts = products.some(product => 
          product && product.merchantId === sellerId
        )
        
        if (hasSellerProducts) {
          orders.push(order)
        }
      }
    }
    
    return orders
  }
}

export const cartDb = {
  async get(userId: string): Promise<Cart> {
    const cart = await db.get(`cart:${userId}`)
    return cart as Cart || { items: [], updatedAt: new Date().toISOString() }
  },

  async update(userId: string, cart: Cart): Promise<void> {
    cart.updatedAt = new Date().toISOString()
    await db.set(`cart:${userId}`, cart)
  },

  async addItem(userId: string, productId: string, quantity: number = 1): Promise<void> {
    const cart = await this.get(userId)
    const existingItem = cart.items.find(item => item.productId === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, quantity })
    }
    
    await this.update(userId, cart)
  },

  async removeItem(userId: string, productId: string): Promise<void> {
    const cart = await this.get(userId)
    cart.items = cart.items.filter(item => item.productId !== productId)
    await this.update(userId, cart)
  },

  async clear(userId: string): Promise<void> {
    await db.set(`cart:${userId}`, { items: [], updatedAt: new Date().toISOString() })
  },

  async getAbandonedCarts(): Promise<{ userId: string, cart: Cart }[]> {
    const keys = await db.list('cart:')
    const abandonedCarts: { userId: string, cart: Cart }[] = []
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const key of keys) {
      const cart = await db.get(key) as Cart
      if (cart && cart.items.length > 0 && !cart.reminderSent) {
        const updatedAt = new Date(cart.updatedAt)
        if (updatedAt < oneDayAgo) {
          const userId = key.replace('cart:', '')
          abandonedCarts.push({ userId, cart })
        }
      }
    }
    
    return abandonedCarts
  }
}

export const planDb = {
  async create(userId: string, tier: 'Free' | 'Standard' | 'Premium' = 'Free'): Promise<SubscriptionPlan> {
    const planLimits = {
      Free: { maxProducts: 20, maxAdSlots: 0, customerSupport: false },
      Standard: { maxProducts: 60, maxAdSlots: 12, customerSupport: true },
      Premium: { maxProducts: -1, maxAdSlots: -1, customerSupport: true } // -1 = unlimited
    }

    const plan: SubscriptionPlan = {
      userId,
      tier,
      ...planLimits[tier],
      quotaUsed: 0,
      adSlotsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.set(`plan:${userId}`, plan)
    return plan
  },

  async get(userId: string): Promise<SubscriptionPlan> {
    const plan = await db.get(`plan:${userId}`)
    if (!plan) {
      return await this.create(userId, 'Free')
    }
    return plan as SubscriptionPlan
  },

  async update(userId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = await this.get(userId)
    const updatedPlan = { ...plan, ...updates, updatedAt: new Date().toISOString() }
    await db.set(`plan:${userId}`, updatedPlan)
    return updatedPlan
  },

  async incrementQuota(userId: string): Promise<void> {
    const plan = await this.get(userId)
    plan.quotaUsed += 1
    await this.update(userId, { quotaUsed: plan.quotaUsed })
  },

  async decrementQuota(userId: string): Promise<void> {
    const plan = await this.get(userId)
    if (plan.quotaUsed > 0) {
      plan.quotaUsed -= 1
      await this.update(userId, { quotaUsed: plan.quotaUsed })
    }
  }
}

export const adDb = {
  async create(ad: Omit<Advertisement, 'id' | 'createdAt'>): Promise<Advertisement> {
    const newAd: Advertisement = {
      ...ad,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }

    await db.set(`ad:${newAd.id}`, newAd)
    return newAd
  },

  async findById(id: string): Promise<Advertisement | null> {
    const ad = await db.get(`ad:${id}`)
    return ad as Advertisement | null
  },

  async findBySeller(sellerId: string): Promise<Advertisement[]> {
    const keys = await db.list('ad:')
    const ads: Advertisement[] = []
    
    for (const key of keys) {
      const ad = await db.get(key)
      if (ad && (ad as Advertisement).sellerId === sellerId) {
        ads.push(ad as Advertisement)
      }
    }
    
    return ads
  },

  async getActiveAds(): Promise<Advertisement[]> {
    const keys = await db.list('ad:')
    const ads: Advertisement[] = []
    const now = new Date()
    
    for (const key of keys) {
      const ad = await db.get(key) as Advertisement
      if (ad && ad.status === 'active' && 
          new Date(ad.activeFrom) <= now && 
          new Date(ad.activeUntil) >= now) {
        ads.push(ad)
      }
    }
    
    return ads
  },

  async update(id: string, updates: Partial<Advertisement>): Promise<Advertisement | null> {
    const ad = await this.findById(id)
    if (!ad) return null

    const updatedAd = { ...ad, ...updates }
    await db.set(`ad:${id}`, updatedAd)
    return updatedAd
  }
}

export const verificationDb = {
  async create(verification: Omit<SellerVerification, 'submittedAt'>): Promise<SellerVerification> {
    const newVerification: SellerVerification = {
      ...verification,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }

    await db.set(`verification:${verification.userId}`, newVerification)
    return newVerification
  },

  async get(userId: string): Promise<SellerVerification | null> {
    const verification = await db.get(`verification:${userId}`)
    return verification as SellerVerification | null
  },

  async update(userId: string, updates: Partial<SellerVerification>): Promise<SellerVerification | null> {
    const verification = await this.get(userId)
    if (!verification) return null

    const updatedVerification = { ...verification, ...updates }
    if (updates.status && updates.status !== 'pending') {
      updatedVerification.reviewedAt = new Date().toISOString()
    }
    
    await db.set(`verification:${userId}`, updatedVerification)
    return updatedVerification
  },

  async getAll(): Promise<SellerVerification[]> {
    const keys = await db.list('verification:')
    const verifications: SellerVerification[] = []
    
    for (const key of keys) {
      const verification = await db.get(key)
      if (verification) verifications.push(verification as SellerVerification)
    }
    
    return verifications
  }
}

export const ratingDb = {
  async create(rating: Omit<ProductRating, 'createdAt'>): Promise<ProductRating> {
    const newRating: ProductRating = {
      ...rating,
      createdAt: new Date().toISOString()
    }

    await db.set(`rating:${rating.productId}:${rating.userId}`, newRating)
    return newRating
  },

  async get(productId: string, userId: string): Promise<ProductRating | null> {
    const rating = await db.get(`rating:${productId}:${userId}`)
    return rating as ProductRating | null
  },

  async getByProduct(productId: string): Promise<ProductRating[]> {
    const keys = await db.list(`rating:${productId}:`)
    const ratings: ProductRating[] = []
    
    for (const key of keys) {
      const rating = await db.get(key)
      if (rating) ratings.push(rating as ProductRating)
    }
    
    return ratings
  },

  async getAverageRating(productId: string): Promise<{ average: number, count: number }> {
    const ratings = await this.getByProduct(productId)
    
    if (ratings.length === 0) {
      return { average: 0, count: 0 }
    }
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    const average = sum / ratings.length
    
    return { average: Number(average.toFixed(1)), count: ratings.length }
  }
}

export const commentDb = {
  async create(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.set(`comment:${newComment.id}`, newComment)
    return newComment
  },

  async getByProduct(productId: string): Promise<Comment[]> {
    const keys = await db.list(`comment:`)
    const comments: Comment[] = []
    
    for (const key of keys) {
      const comment = await db.get(key)
      if (comment && (comment as Comment).productId === productId) {
        comments.push(comment as Comment)
      }
    }
    
    // Sort by creation date, newest first
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getReplies(parentId: string): Promise<Comment[]> {
    const keys = await db.list(`comment:`)
    const replies: Comment[] = []
    
    for (const key of keys) {
      const comment = await db.get(key) as Comment
      if (comment && comment.parentId === parentId) {
        replies.push(comment)
      }
    }
    
    // Sort by creation date, oldest first for replies
    return replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },

  async update(id: string, updates: Partial<Comment>): Promise<Comment | null> {
    const comment = await db.get(`comment:${id}`) as Comment
    if (!comment) return null

    const updatedComment = { 
      ...comment, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    
    await db.set(`comment:${id}`, updatedComment)
    return updatedComment
  },

  async delete(id: string): Promise<boolean> {
    const comment = await db.get(`comment:${id}`) as Comment
    if (!comment) return false

    // Delete the comment and all its replies
    const replies = await this.getReplies(id)
    for (const reply of replies) {
      await db.delete(`comment:${reply.id}`)
    }
    
    await db.delete(`comment:${id}`)
    return true
  }
}

export const quoteDb = {
  async create(quote: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
    const newQuote: Quote = {
      ...quote,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }

    await db.set(`quote:${newQuote.id}`, newQuote)
    return newQuote
  },

  async getByProduct(productId: string): Promise<Quote[]> {
    const keys = await db.list('quote:')
    const quotes: Quote[] = []
    
    for (const key of keys) {
      const quote = await db.get(key)
      if (quote && (quote as Quote).productId === productId) {
        quotes.push(quote as Quote)
      }
    }
    
    return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getBySeller(sellerId: string): Promise<Quote[]> {
    const keys = await db.list('quote:')
    const quotes: Quote[] = []
    
    for (const key of keys) {
      const quote = await db.get(key) as Quote
      if (quote) {
        const product = await productDb.findById(quote.productId)
        if (product && product.merchantId === sellerId) {
          quotes.push(quote)
        }
      }
    }
    
    return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export interface Service {
  id: string
  title: string
  serviceType: string
  description: string
  region: string
  contact: string
  contactEmail: string
  tags: string[]
  providerId: string
  status: 'active' | 'inactive'
  createdAt: string
}

export const insightDb = {
  async create(insight: Omit<Insight, 'id'>): Promise<Insight> {
    const newInsight: Insight = {
      ...insight,
      id: uuidv4(),
      excerpt: insight.excerpt || insight.content.substring(0, 200) + '...',
      readTime: insight.readTime || Math.ceil(insight.content.length / 1000)
    }

    await db.set(`insight:${newInsight.id}`, newInsight)
    return newInsight
  },

  async findById(id: string): Promise<Insight | null> {
    const insight = await db.get(`insight:${id}`)
    return insight as Insight | null
  },

  async getAll(): Promise<Insight[]> {
    const keys = await db.list('insight:')
    const insights: Insight[] = []
    
    for (const key of keys) {
      const insight = await db.get(key)
      if (insight) insights.push(insight as Insight)
    }
    
    return insights.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  },

  async getFeatured(): Promise<Insight | null> {
    const insights = await this.getAll()
    return insights.find(insight => insight.featured) || null
  },

  async getByTag(tag: string): Promise<Insight[]> {
    const insights = await this.getAll()
    return insights.filter(insight => insight.tags.includes(tag))
  },

  async update(id: string, updates: Partial<Insight>): Promise<Insight | null> {
    const insight = await this.findById(id)
    if (!insight) return null

    const updatedInsight = { ...insight, ...updates }
    await db.set(`insight:${id}`, updatedInsight)
    return updatedInsight
  }
}

export const serviceDb = {
  async create(service: Omit<Service, 'id' | 'createdAt'>): Promise<Service> {
    const newService: Service = {
      ...service,
      id: uuidv4(),
      title: service.title || service.serviceType,
      createdAt: new Date().toISOString()
    }

    await db.set(`service:${newService.id}`, newService)
    return newService
  },

  async findById(id: string): Promise<Service | null> {
    const service = await db.get(`service:${id}`)
    return service as Service | null
  },

  async getAll(): Promise<Service[]> {
    const keys = await db.list('service:')
    const services: Service[] = []
    
    for (const key of keys) {
      const service = await db.get(key)
      if (service && (service as Service).status === 'active') {
        services.push(service as Service)
      }
    }
    
    return services.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async findByProvider(providerId: string): Promise<Service[]> {
    const keys = await db.list('service:')
    const services: Service[] = []
    
    for (const key of keys) {
      const service = await db.get(key)
      if (service && (service as Service).providerId === providerId) {
        services.push(service as Service)
      }
    }
    
    return services.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

// Sample insights for initial data
export async function initializeSampleData() {
  // Check if insights already exist
  const existingInsights = await insightDb.getAll()
  
  if (existingInsights.length === 0) {
    const sampleInsights = [
      {
        title: "The Future of Renewable Energy in Oil & Gas",
        content: "The oil and gas industry is undergoing a significant transformation as companies increasingly adopt renewable energy technologies. This shift is driven by environmental regulations, investor pressure, and the economic viability of clean energy solutions. Companies are investing heavily in solar, wind, and hydrogen technologies to reduce their carbon footprint and prepare for a sustainable future. The integration of these technologies with traditional operations presents both challenges and opportunities for industry leaders.",
        imageUrl: "/attached_assets/images/renewable-energy.jpg",
        author: "Dr. Sarah Mitchell",
        publishedAt: "2024-01-15T10:00:00Z",
        featured: true,
        excerpt: "Exploring how oil and gas companies are embracing renewable energy technologies to create a more sustainable future.",
        tags: ["renewable", "sustainability", "technology", "future"],
        readTime: 5
      },
      {
        title: "Digital Transformation in Upstream Operations",
        content: "Digital technologies are revolutionizing upstream oil and gas operations. From IoT sensors on drilling rigs to AI-powered predictive maintenance, companies are leveraging technology to improve efficiency, reduce costs, and enhance safety. Machine learning algorithms can now predict equipment failures before they occur, while digital twins provide virtual representations of physical assets for better decision-making.",
        imageUrl: "/attached_assets/images/digital-transformation.jpg",
        author: "Mark Thompson",
        publishedAt: "2024-01-10T14:30:00Z",
        featured: false,
        excerpt: "How digital technologies are transforming upstream operations and improving efficiency across the industry.",
        tags: ["digital", "upstream", "technology", "AI"],
        readTime: 4
      }
    ]
    
    for (const insight of sampleInsights) {
      try {
        await insightDb.create(insight)
      } catch (error) {
        console.log('Sample insight already exists:', insight.title)
      }
    }
  }
}

export default db