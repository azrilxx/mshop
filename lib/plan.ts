export interface PlanLimits {
  products: number
  ads: number
  quotes: number
  storage: number // in MB
  support: 'basic' | 'priority' | 'dedicated'
  features: string[]
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    products: 5,
    ads: 1,
    quotes: 10,
    storage: 100,
    support: 'basic',
    features: ['Basic listing', 'Standard support', 'Limited analytics']
  },
  standard: {
    products: 50,
    ads: 10,
    quotes: 100,
    storage: 1000,
    support: 'priority',
    features: ['Advanced listing', 'Priority support', 'Detailed analytics', 'Quote management']
  },
  premium: {
    products: -1, // unlimited
    ads: -1, // unlimited
    quotes: -1, // unlimited
    storage: 10000,
    support: 'dedicated',
    features: ['Unlimited listings', 'Dedicated support', 'Advanced analytics', 'Custom branding', 'API access']
  }
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function checkPlanLimit(currentUsage: number, limit: number): boolean {
  if (limit === -1) return true // unlimited
  return currentUsage < limit
}

export function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    free: 'Free Plan',
    standard: 'Standard Plan', 
    premium: 'Premium Plan'
  }
  return names[plan] || 'Unknown Plan'
}

export function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    free: 0,
    standard: 49,
    premium: 199
  }
  return prices[plan] || 0
}

export function canAccessFeature(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy = ['free', 'standard', 'premium']
  const userLevel = planHierarchy.indexOf(userPlan)
  const requiredLevel = planHierarchy.indexOf(requiredPlan)

  return userLevel >= requiredLevel
}