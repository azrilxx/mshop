import { supabase } from './supabase'
import type { User, Product, Advertisement, Order, Rating, Storefront, Subscription } from './supabase'

export class DatabaseOperations {
  // Security middleware - Row Level Security equivalent
  private async checkUserAccess(userId: string, resourceOwnerId: string, userRole?: string): Promise<boolean> {
    // Admin bypass
    if (userRole === 'admin') return true
    // User can access their own resources
    return userId === resourceOwnerId
  }

  // User operations with Supabase
  async createUser(user: Omit<User, 'created_at'>): Promise<User> {
    // Validate required fields
    if (!user.email || !user.name || !user.role) {
      throw new Error('Missing required user fields')
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan || 'free',
        tenant_id: user.tenant_id,
        status: user.status || 'active'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  async getUserById(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Security check - users can only access their own profile unless admin
    if (data && requestingUserId && !await this.checkUserAccess(requestingUserId, data.id, requestingUserRole)) {
      return null
    }
    return data
  }

  async updateUser(id: string, updates: Partial<User>, requestingUserId?: string, requestingUserRole?: string): Promise<void> {
    // Security check
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }

  // Product operations with Supabase
  async getProducts(requestingUserId?: string, requestingUserRole?: string): Promise<Product[]> {
    let query = supabase.from('products').select('*')

    // If not admin, only return active products or user's own products
    if (requestingUserRole !== 'admin') {
      if (requestingUserId) {
        query = query.or(`status.eq.active,seller_id.eq.${requestingUserId}`)
      } else {
        query = query.eq('status', 'active')
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getProductsBySeller(sellerId: string, requestingUserId?: string, requestingUserRole?: string): Promise<Product[]> {
    // Security check - users can only access their own products unless admin
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, sellerId, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getProductById(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Security check - non-active products only visible to owner or admin
    if (data && data.status !== 'active' && requestingUserId) {
      if (!await this.checkUserAccess(requestingUserId, data.seller_id, requestingUserRole)) {
        return null
      }
    }
    return data
  }

  async createProduct(product: Omit<Product, 'created_at' | 'id'>, requestingUserId: string): Promise<Product> {
    // Validate required fields
    if (!product.name || !product.price || !product.seller_id) {
      throw new Error('Missing required product fields')
    }

    // Security check - users can only create products for themselves
    if (product.seller_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create product for another user')
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        merchant_id: product.seller_id, // Ensure merchant_id is set
        tags: product.tags || []
      }])
      .select()
      .single()

    if (error) throw error
    return data
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

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }

  // Advertisement operations with Supabase
  async getAdvertisements(requestingUserId?: string, requestingUserRole?: string): Promise<Advertisement[]> {
    let query = supabase.from('ads').select('*')

    // If not admin, only return user's own ads or active public ads
    if (requestingUserRole !== 'admin') {
      if (requestingUserId) {
        query = query.or(`seller_id.eq.${requestingUserId},and(status.eq.active,active_from.lte.${new Date().toISOString()},active_until.gte.${new Date().toISOString()})`)
      } else {
        const now = new Date().toISOString()
        query = query.eq('status', 'active').lte('active_from', now).gte('active_until', now)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getActiveAdvertisements(): Promise<Advertisement[]> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .lte('active_from', now)
      .gte('active_until', now)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createAdvertisement(ad: Omit<Advertisement, 'created_at' | 'id'>, requestingUserId: string): Promise<Advertisement> {
    // Validate required fields
    if (!ad.seller_id || !ad.title || !ad.active_from || !ad.active_until) {
      throw new Error('Missing required advertisement fields')
    }

    // Security check
    if (ad.seller_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create advertisement for another user')
    }

    const { data, error } = await supabase
      .from('ads')
      .insert([{
        ...ad,
        merchant_id: ad.seller_id // Ensure merchant_id is set
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const { data: ad, error: fetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!ad) throw new Error('Advertisement not found')

    // Security check
    if (!await this.checkUserAccess(requestingUserId, ad.seller_id, requestingUserRole)) {
      throw new Error('Unauthorized access')
    }

    const { error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }

  // Order operations with Supabase
  async getOrders(requestingUserId: string, requestingUserRole?: string): Promise<Order[]> {
    let query = supabase.from('orders').select('*')

    // Security: only admins can see all orders
    if (requestingUserRole !== 'admin') {
      // Users can only see their own orders (as buyer or seller)
      query = query.or(`buyer_id.eq.${requestingUserId},seller_id.eq.${requestingUserId}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createOrder(order: Omit<Order, 'created_at' | 'updated_at' | 'id'>, requestingUserId: string): Promise<Order> {
    // Validate required fields
    if (!order.buyer_id || !order.seller_id || !order.product_id || !order.total_price) {
      throw new Error('Missing required order fields')
    }

    // Security check - users can only create orders as buyers
    if (order.buyer_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create order for another user')
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateOrder(id: string, updates: Partial<Order>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!order) throw new Error('Order not found')

    // Security check - buyers and sellers can update their orders
    const canAccess = order.buyer_id === requestingUserId || 
                     order.seller_id === requestingUserId || 
                     requestingUserRole === 'admin'

    if (!canAccess) {
      throw new Error('Unauthorized access')
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }

  // Rating operations with Supabase
  async getRatingsByProduct(productId: string): Promise<Rating[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createRating(rating: Omit<Rating, 'created_at' | 'id'>, requestingUserId: string): Promise<Rating> {
    // Validate required fields
    if (!rating.product_id || !rating.user_id || !rating.rating || rating.rating < 1 || rating.rating > 5) {
      throw new Error('Invalid rating data')
    }

    // Security check - users can only create ratings as themselves
    if (rating.user_id !== requestingUserId) {
      throw new Error('Unauthorized: Cannot create rating for another user')
    }

    // Check for duplicate ratings
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('product_id', rating.product_id)
      .eq('user_id', requestingUserId)
      .single()

    if (existingRating) {
      throw new Error('User has already rated this product')
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert([rating])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Storefront operations with Supabase
  async getStorefronts(requestingUserId?: string, requestingUserRole?: string): Promise<Storefront[]> {
    let query = supabase.from('storefronts').select('*')

    // If not admin, only return user's own storefront or active public ones
    if (requestingUserRole !== 'admin') {
      if (requestingUserId) {
        query = query.or(`merchant_id.eq.${requestingUserId},status.eq.active`)
      } else {
        query = query.eq('status', 'active')
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getStorefrontBySlug(slug: string): Promise<Storefront | null> {
    const { data, error } = await supabase
      .from('storefronts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async getStorefrontByMerchant(merchantId: string, requestingUserId?: string, requestingUserRole?: string): Promise<Storefront | null> {
    const { data, error } = await supabase
      .from('storefronts')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Security check for private access
    if (requestingUserId && !await this.checkUserAccess(requestingUserId, merchantId, requestingUserRole)) {
      // Return only if storefront is public
      return (data && data.status === 'active') ? data : null
    }

    return data
  }

  async createStorefront(storefront: Omit<Storefront, 'created_at' | 'updated_at' | 'id'>, requestingUserId: string): Promise<Storefront> {
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

    const { data, error } = await supabase
      .from('storefronts')
      .insert([storefront])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateStorefront(id: string, updates: Partial<Storefront>, requestingUserId: string, requestingUserRole?: string): Promise<void> {
    const { data: storefront, error: fetchError } = await supabase
      .from('storefronts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!storefront) throw new Error('Storefront not found')

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

    const { error } = await supabase
      .from('storefronts')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  }

  async generateUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let counter = 0
    let slug = baseSlug

    while (true) {
      const existing = await this.getStorefrontBySlug(slug)
      if (!existing) break

      counter++
      slug = `${baseSlug}-${counter}`
    }

    return slug
  }

  // Subscription operations with Supabase
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async createSubscription(subscription: Omit<Subscription, 'created_at' | 'updated_at' | 'id'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateSubscription(userId: string, updates: Partial<Subscription>): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Legacy compatibility methods for plan operations
  async getUserPlan(userId: string): Promise<{ tier: string; maxProducts: number; maxAds: number } | null> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return { tier: 'free', maxProducts: 1, maxAds: 0 }

    const planLimits = {
      free: { tier: 'free', maxProducts: 1, maxAds: 0 },
      standard: { tier: 'standard', maxProducts: 10, maxAds: 3 },
      premium: { tier: 'premium', maxProducts: 100, maxAds: 10 }
    }

    return planLimits[subscription.plan] || planLimits.free
  }

  async updateUserPlan(userId: string, planData: any): Promise<void> {
    const existing = await this.getUserSubscription(userId)
    if (existing) {
      await this.updateSubscription(userId, planData)
    } else {
      await this.createSubscription({
        user_id: userId,
        plan: planData.tier || 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
    }
  }

  // Usage tracking (can be implemented later with dedicated tables)
  async getUserUsage(userId: string): Promise<{ productsCreated: number; adsCreated: number; reportsGenerated: number }> {
    // Count from actual tables
    const [productCount, adCount] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', userId),
      supabase.from('ads').select('id', { count: 'exact' }).eq('seller_id', userId)
    ])

    return {
      productsCreated: productCount.count || 0,
      adsCreated: adCount.count || 0,
      reportsGenerated: 0 // Placeholder
    }
  }

  async incrementUsage(userId: string, field: string): Promise<void> {
    // This can be implemented with a dedicated usage tracking table if needed
    // For now, we track usage by counting actual records
    console.log(`Usage incremented for user ${userId}: ${field}`)
  }

  // Insights operations (placeholder)
  async getInsights(): Promise<any[]> {
    // This would typically aggregate data from multiple tables
    return []
  }
}

// Export the database operations instance
export const dbOps = new DatabaseOperations()

// Export types for convenience
export type { User, Product, Advertisement, Order, Rating, Storefront, Subscription }