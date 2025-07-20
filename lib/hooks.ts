
'use client'

import { useState, useEffect } from 'react'
import { planDb, planUsageDb } from './db'
import { getPlanLimits, canCreateProduct, canCreateAd, canGenerateReport, getRemainingProducts, getRemainingAds, getRemainingReports } from './plan'

interface SubscriptionPlan {
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

interface PlanUsage {
  userId: string
  month: string
  productsCreated: number
  adsCreated: number
  reportsGenerated: number
  createdAt: string
  updatedAt: string
}

interface FeatureAccess {
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
    canCreateProducts: canCreateProduct(plan.tier, usage.productsCreated),
    canCreateAds: canCreateAd(plan.tier, usage.adsCreated),
    canAccessReports: canGenerateReport(plan.tier, usage.reportsGenerated),
    canAccessMassShipment: plan.tier === 'Standard' || plan.tier === 'Premium',
    canAccessPrioritySupport: plan.tier === 'Premium',
    hasAdSlotsAvailable: canCreateAd(plan.tier, usage.adsCreated),
    hasProductSlotsAvailable: canCreateProduct(plan.tier, usage.productsCreated),
    remainingProducts: getRemainingProducts(plan.tier, usage.productsCreated),
    remainingAdSlots: getRemainingAds(plan.tier, usage.adsCreated),
    remainingReports: getRemainingReports(plan.tier, usage.reportsGenerated),
    upgradeMessage: plan.tier === 'Free' ? 'Upgrade to Standard for 30 products and 12 ads per month' :
                   plan.tier === 'Standard' ? 'Upgrade to Premium for unlimited products and ads' :
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

export function getPlanAccess(tier: 'Free' | 'Standard' | 'Premium') {
  const limits = getPlanLimits(tier)
  
  return {
    // Product limits
    canCreateProducts: (currentCount: number) => canCreateProduct(tier, currentCount),
    getProductLimit: () => limits.maxProducts,
    getRemainingProducts: (currentCount: number) => getRemainingProducts(tier, currentCount),

    // Ad limits  
    canCreateAds: (currentCount: number) => canCreateAd(tier, currentCount),
    getAdLimit: () => limits.maxAds,
    getRemainingAds: (currentCount: number) => getRemainingAds(tier, currentCount),

    // Report limits
    canAccessReports: (currentCount: number) => canGenerateReport(tier, currentCount),
    getReportLimit: () => limits.maxReports,
    getRemainingReports: (currentCount: number) => getRemainingReports(tier, currentCount),

    // Feature access
    hasFeature: (feature: string) => {
      const featureMap = {
        'shipment': tier === 'Standard' || tier === 'Premium',
        'analytics': limits.hasAdvancedAnalytics,
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

export function usePlanAccess(tier: 'Free' | 'Standard' | 'Premium') {
  return getPlanAccess(tier)
}

export function checkFeatureAccess(tier: 'Free' | 'Standard' | 'Premium', feature: string): boolean {
  return hasFeature(tier, feature)
}

export function useFeatureAccess(feature: string) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        // For now, assume all features are accessible
        // This would be enhanced based on actual plan validation
        setHasAccess(true)
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
