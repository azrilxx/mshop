
export interface PlanLimits {
  maxProducts: number
  maxAds: number
  maxReports: number
  hasAdvancedAnalytics: boolean
  hasPrioritySupport: boolean
  hasUnlimitedFeatures: boolean
}

export interface PlanUsage {
  userId: string
  month: string
  productsCreated: number
  adsCreated: number
  reportsGenerated: number
  createdAt: string
  updatedAt: string
}

export const PLAN_LIMITS: Record<'Free' | 'Standard' | 'Premium', PlanLimits> = {
  Free: {
    maxProducts: 5,
    maxAds: 0,
    maxReports: 0,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    hasUnlimitedFeatures: false
  },
  Standard: {
    maxProducts: 30,
    maxAds: 12,
    maxReports: 30,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: false,
    hasUnlimitedFeatures: false
  },
  Premium: {
    maxProducts: -1, // unlimited
    maxAds: -1, // unlimited
    maxReports: -1, // unlimited
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
    hasUnlimitedFeatures: true
  }
}

export function getPlanLimits(tier: 'Free' | 'Standard' | 'Premium'): PlanLimits {
  return PLAN_LIMITS[tier]
}

export function canCreateProduct(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): boolean {
  const limits = getPlanLimits(tier)
  return limits.maxProducts === -1 || currentCount < limits.maxProducts
}

export function canCreateAd(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): boolean {
  const limits = getPlanLimits(tier)
  return limits.maxAds === -1 || currentCount < limits.maxAds
}

export function canGenerateReport(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): boolean {
  const limits = getPlanLimits(tier)
  return limits.maxReports === -1 || currentCount < limits.maxReports
}

export function getRemainingProducts(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): number {
  const limits = getPlanLimits(tier)
  if (limits.maxProducts === -1) return Infinity
  return Math.max(0, limits.maxProducts - currentCount)
}

export function getRemainingAds(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): number {
  const limits = getPlanLimits(tier)
  if (limits.maxAds === -1) return Infinity
  return Math.max(0, limits.maxAds - currentCount)
}

export function getRemainingReports(tier: 'Free' | 'Standard' | 'Premium', currentCount: number): number {
  const limits = getPlanLimits(tier)
  if (limits.maxReports === -1) return Infinity
  return Math.max(0, limits.maxReports - currentCount)
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getUpgradeMessage(tier: 'Free' | 'Standard' | 'Premium'): string {
  switch (tier) {
    case 'Free':
      return 'Upgrade to Standard for 30 products and 12 ads per month'
    case 'Standard':
      return 'Upgrade to Premium for unlimited products and ads'
    default:
      return 'You have unlimited access to all features'
  }
}
