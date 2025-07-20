
export interface SecurityContext {
  userId: string
  userRole: 'buyer' | 'seller' | 'admin'
  tenantId?: string
}

export class SecurityManager {
  static hasRole(context: SecurityContext, requiredRole: 'buyer' | 'seller' | 'admin'): boolean {
    const roleHierarchy = { buyer: 0, seller: 1, admin: 2 }
    return roleHierarchy[context.userRole] >= roleHierarchy[requiredRole]
  }

  static canAccessResource(context: SecurityContext, resourceOwnerId: string): boolean {
    // Admin can access everything
    if (context.userRole === 'admin') return true
    
    // Users can access their own resources
    return context.userId === resourceOwnerId
  }

  static canModifyResource(context: SecurityContext, resourceOwnerId: string, resourceType: string): boolean {
    // Admin can modify everything
    if (context.userRole === 'admin') return true
    
    // Sellers can modify their own products, ads, storefronts
    if (context.userRole === 'seller' && ['product', 'advertisement', 'storefront'].includes(resourceType)) {
      return context.userId === resourceOwnerId
    }
    
    // Buyers can modify their own orders, ratings
    if (context.userRole === 'buyer' && ['order', 'rating'].includes(resourceType)) {
      return context.userId === resourceOwnerId
    }
    
    return false
  }

  static validateInput(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }

  static sanitizeInput(input: string): string {
    // Basic XSS protection
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  static paginateResults<T>(data: T[], page: number = 1, limit: number = 50): { data: T[], total: number, page: number, totalPages: number } {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      total: data.length,
      page,
      totalPages: Math.ceil(data.length / limit)
    }
  }
}

export default SecurityManager
