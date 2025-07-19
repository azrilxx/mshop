'use client'

import { useState, useEffect } from 'react'

export interface Plan {
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

export interface FeatureAccess {
  canCreateProducts: boolean
  canCreateAds: boolean
  canAccessMassShipment: boolean
  canAccessReports: boolean
  canAccessPrioritySupport: boolean
  hasAdSlotsAvailable: boolean
  hasProductSlotsAvailable: boolean
  remainingProducts: number
  remainingAdSlots: number
}

export function useFeatureAccess(): {
  featureAccess: FeatureAccess | null
  plan: Plan | null
  loading: boolean
  error: string | null
} {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlan()
  }, [])

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plan')
      if (!response.ok) {
        throw new Error('Failed to fetch plan')
      }
      const data = await response.json()
      setPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const featureAccess: FeatureAccess | null = plan ? {
    canCreateProducts: plan.quotaUsed < plan.maxProducts,
    canCreateAds: plan.adSlotsUsed < plan.maxAdSlots && plan.tier !== 'Free',
    canAccessMassShipment: plan.tier === 'Standard' || plan.tier === 'Premium',
    canAccessReports: plan.tier === 'Standard' || plan.tier === 'Premium',
    canAccessPrioritySupport: plan.tier === 'Premium',
    hasAdSlotsAvailable: plan.adSlotsUsed < plan.maxAdSlots,
    hasProductSlotsAvailable: plan.quotaUsed < plan.maxProducts,
    remainingProducts: plan.maxProducts - plan.quotaUsed,
    remainingAdSlots: plan.maxAdSlots - plan.adSlotsUsed
  } : null

  return {
    featureAccess,
    plan,
    loading,
    error
  }
}

export function getPlanAccess(tier: 'Free' | 'Standard' | 'Premium') {
  const planLimits = {
    Free: { 
      maxProducts: 20, 
      maxAds: 0, 
      maxReports: 0,
      hasShipment: false,
      hasAnalytics: false,
      hasPrioritySupport: false
    },
    Standard: { 
      maxProducts: 60, 
      maxAds: 12, 
      maxReports: 30,
      hasShipment: true,
      hasAnalytics: true,
      hasPrioritySupport: false
    },
    Premium: { 
      maxProducts: -1, // unlimited
      maxAds: -1, // unlimited
      maxReports: -1, // unlimited
      hasShipment: true,
      hasAnalytics: true,
      hasPrioritySupport: true
    }
  }

  const limits = planLimits[tier]

  return {
    // Product limits
    canCreateProducts: (currentCount: number) => 
      limits.maxProducts === -1 || currentCount < limits.maxProducts,
    getProductLimit: () => limits.maxProducts,
    getRemainingProducts: (currentCount: number) => 
      limits.maxProducts === -1 ? Infinity : Math.max(0, limits.maxProducts - currentCount),

    // Ad limits  
    canCreateAds: (currentCount: number) => 
      limits.maxAds === -1 || currentCount < limits.maxAds,
    getAdLimit: () => limits.maxAds,
    getRemainingAds: (currentCount: number) => 
      limits.maxAds === -1 ? Infinity : Math.max(0, limits.maxAds - currentCount),

    // Report limits
    canAccessReports: (currentCount: number) => 
      limits.maxReports === -1 || currentCount < limits.maxReports,
    getReportLimit: () => limits.maxReports,
    getRemainingReports: (currentCount: number) => 
      limits.maxReports === -1 ? Infinity : Math.max(0, limits.maxReports - currentCount),

    // Feature access
    hasFeature: (feature: string) => {
      const featureMap = {
        'shipment': limits.hasShipment,
        'analytics': limits.hasAnalytics,
        'priority_support': limits.hasPrioritySupport,
        'ads': limits.maxAds > 0,
        'reports': limits.maxReports > 0
      }
      return featureMap[feature as keyof typeof featureMap] || false
    },

    // Plan info
    getPlanLimits: () => limits,
    isUnlimited: (feature: 'products' | 'ads' | 'reports') => {
      const limitMap = {
        'products': limits.maxProducts,
        'ads': limits.maxAds,
        'reports': limits.maxReports
      }
      return limitMap[feature] === -1
    }
  }
}

export function hasFeature(userPlan: 'Free' | 'Standard' | 'Premium', featureName: string): boolean {
  const planAccess = getPlanAccess(userPlan)
  return planAccess.hasFeature(featureName)
}

// Client-side hook wrapper
export function usePlanAccess(tier: 'Free' | 'Standard' | 'Premium') {
  return getPlanAccess(tier)
}

export function checkFeatureAccess(tier: 'Free' | 'Standard' | 'Premium', feature: string): boolean {
  return hasFeature(tier, feature)
}