
'use client'

import { useState, useEffect } from 'react'
import { getPlanLimits, checkPlanLimit, canAccessFeature } from './plan'

export interface PlanUsage {
  productsCreated: number
  adsCreated: number
  reportsGenerated: number
}

export interface SubscriptionPlan {
  tier: 'free' | 'standard' | 'premium'
  maxProducts: number
  maxAds: number
  maxReports: number
  hasAdvancedAnalytics: boolean
  hasPrioritySupport: boolean
}

export interface FeatureAccess {
  canCreateProducts: boolean
  canCreateAds: boolean
  canAccessReports: boolean
  canAccessMassShipment: boolean
  canAccessPrioritySupport: boolean
  hasAdSlotsAvailable: boolean
  hasProductSlotsAvailable: boolean
  remainingProducts: number
  remainingAdSlots: number
  remainingReports: number
  upgradeMessage: string
}

export function useUserPlan() {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [usage, setUsage] = useState<PlanUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlanData()
  }, [])

  const fetchPlanData = async () => {
    try {
      setLoading(true)
      const [planResponse, usageResponse] = await Promise.all([
        fetch('/api/plan'),
        fetch('/api/plan/usage')
      ])

      if (!planResponse.ok || !usageResponse.ok) {
        throw new Error('Failed to fetch plan data')
      }

      const planData = await planResponse.json()
      const usageData = await usageResponse.json()

      setPlan(planData)
      setUsage(usageData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const featureAccess: FeatureAccess | null = plan && usage ? {
    canCreateProducts: checkPlanLimit(usage.productsCreated, plan.maxProducts),
    canCreateAds: checkPlanLimit(usage.adsCreated, plan.maxAds),
    canAccessReports: plan.tier !== 'free',
    canAccessMassShipment: plan.tier === 'standard' || plan.tier === 'premium',
    canAccessPrioritySupport: plan.tier === 'premium',
    hasAdSlotsAvailable: checkPlanLimit(usage.adsCreated, plan.maxAds),
    hasProductSlotsAvailable: checkPlanLimit(usage.productsCreated, plan.maxProducts),
    remainingProducts: plan.maxProducts === -1 ? 999 : Math.max(0, plan.maxProducts - usage.productsCreated),
    remainingAdSlots: plan.maxAds === -1 ? 999 : Math.max(0, plan.maxAds - usage.adsCreated),
    remainingReports: plan.maxReports === -1 ? 999 : Math.max(0, plan.maxReports - usage.reportsGenerated),
    upgradeMessage: plan.tier === 'free' ? 'Upgrade to Standard for 50 products and 10 ads per month' :
                   plan.tier === 'standard' ? 'Upgrade to Premium for unlimited products and ads' :
                   'You have unlimited access to all features'
  } : null

  return {
    plan,
    usage,
    featureAccess,
    loading,
    error,
    refetch: fetchPlanData
  }
}

export function useFeatureAccess(feature: string) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch('/api/plan')
        if (response.ok) {
          const plan = await response.json()
          setHasAccess(canAccessFeature(plan.tier, feature))
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }
    checkAccess()
  }, [feature])

  return { hasAccess, loading }
}

export function usePlanAccess(tier: 'free' | 'standard' | 'premium') {
  const limits = getPlanLimits(tier)
  
  return {
    // Product limits
    canCreateProducts: (currentCount: number) => checkPlanLimit(currentCount, limits.products),
    getProductLimit: () => limits.products,
    getRemainingProducts: (currentCount: number) => limits.products === -1 ? 999 : Math.max(0, limits.products - currentCount),

    // Ad limits  
    canCreateAds: (currentCount: number) => checkPlanLimit(currentCount, limits.ads),
    getAdLimit: () => limits.ads,
    getRemainingAds: (currentCount: number) => limits.ads === -1 ? 999 : Math.max(0, limits.ads - currentCount),

    // Report limits
    canAccessReports: (currentCount: number) => tier !== 'free',
    getReportLimit: () => tier === 'free' ? 0 : -1,
    getRemainingReports: (currentCount: number) => tier === 'free' ? 0 : 999,

    // Feature access
    hasFeature: (feature: string) => {
      const featureMap = {
        'shipment': tier === 'standard' || tier === 'premium',
        'analytics': tier !== 'free',
        'priority_support': tier === 'premium',
        'ads': limits.ads > 0,
        'reports': tier !== 'free'
      }
      return featureMap[feature as keyof typeof featureMap] || false
    },

    // Plan info
    getPlanLimits: () => limits,
    isUnlimited: (feature: 'products' | 'ads' | 'reports') => {
      const limitMap = {
        'products': limits.products,
        'ads': limits.ads,
        'reports': tier === 'free' ? 0 : -1
      }
      return limitMap[feature] === -1
    }
  }
}

export function hasFeature(userPlan: 'free' | 'standard' | 'premium', featureName: string): boolean {
  const planAccess = usePlanAccess(userPlan)
  return planAccess.hasFeature(featureName)
}

export function checkFeatureAccess(tier: 'free' | 'standard' | 'premium', feature: string): boolean {
  return canAccessFeature(tier, feature)
}
