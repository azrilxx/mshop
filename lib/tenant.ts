
import { getSession } from './auth'

export interface TenantContext {
  userId: string
  role: 'admin' | 'seller' | 'buyer'
  shopName?: string
}

export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    const session = await getSession()
    if (!session) return null

    return {
      userId: session.user.id,
      role: session.role,
      shopName: session.shopName
    }
  } catch (error) {
    console.error('Failed to get tenant context:', error)
    return null
  }
}

export function validateOwnership(resourceUserId: string, currentUserId: string): boolean {
  return resourceUserId === currentUserId
}

export function validateAdminAccess(role: string): boolean {
  return role === 'admin'
}

export function validateSellerAccess(role: string): boolean {
  return role === 'seller' || role === 'admin'
}

export class TenantSecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TenantSecurityError'
  }
}

export function createTenantGuard(allowedRoles: string[] = []) {
  return async function tenantGuard(userId?: string) {
    const context = await getTenantContext()
    
    if (!context) {
      throw new TenantSecurityError('Authentication required')
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(context.role)) {
      throw new TenantSecurityError('Insufficient permissions')
    }

    if (userId && !validateOwnership(userId, context.userId) && context.role !== 'admin') {
      throw new TenantSecurityError('Access denied: resource belongs to another user')
    }

    return context
  }
}
