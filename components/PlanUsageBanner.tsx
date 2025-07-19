
'use client'

import Link from 'next/link'
import { useUserPlan } from '@/lib/hooks'

interface PlanUsageBannerProps {
  feature: 'products' | 'ads' | 'reports'
}

export default function PlanUsageBanner({ feature }: PlanUsageBannerProps) {
  const { plan, usage, featureAccess, loading } = useUserPlan()

  if (loading || !plan || !usage || !featureAccess) {
    return null
  }

  const getFeatureData = () => {
    switch (feature) {
      case 'products':
        return {
          current: usage.productsCreated,
          limit: plan.tier === 'Premium' ? '∞' : (plan.tier === 'Standard' ? '30' : '5'),
          remaining: featureAccess.remainingProducts,
          canUse: featureAccess.canCreateProducts
        }
      case 'ads':
        return {
          current: usage.adsCreated,
          limit: plan.tier === 'Premium' ? '∞' : (plan.tier === 'Standard' ? '12' : '0'),
          remaining: featureAccess.remainingAdSlots,
          canUse: featureAccess.canCreateAds
        }
      case 'reports':
        return {
          current: usage.reportsGenerated,
          limit: plan.tier === 'Premium' ? '∞' : (plan.tier === 'Standard' ? '30' : '0'),
          remaining: featureAccess.remainingReports,
          canUse: featureAccess.canAccessReports
        }
    }
  }

  const featureData = getFeatureData()
  const warningThreshold = 0.8 // Show warning at 80% usage
  const isNearLimit = typeof featureData.remaining === 'number' && featureData.remaining <= (parseInt(featureData.limit as string) * (1 - warningThreshold))

  if (featureData.canUse && !isNearLimit) {
    return null // Don't show banner if everything is fine
  }

  return (
    <div className={`rounded-lg p-4 mb-6 ${
      !featureData.canUse 
        ? 'bg-red-50 border border-red-200' 
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${
            !featureData.canUse ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {!featureData.canUse 
              ? `${feature.charAt(0).toUpperCase() + feature.slice(1)} Limit Reached`
              : `${feature.charAt(0).toUpperCase() + feature.slice(1)} Usage Warning`
            }
          </h3>
          <p className={`text-sm ${
            !featureData.canUse ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {!featureData.canUse 
              ? `You've used ${featureData.current}/${featureData.limit} ${feature} this month on your ${plan.tier} plan`
              : `You've used ${featureData.current}/${featureData.limit} ${feature} this month (${featureData.remaining} remaining)`
            }
          </p>
          <p className={`text-sm mt-1 ${
            !featureData.canUse ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {featureAccess.upgradeMessage}
          </p>
        </div>
        <Link
          href="/seller/plan"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !featureData.canUse
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {plan.tier === 'Premium' ? 'Manage Plan' : 'Upgrade Plan'}
        </Link>
      </div>
    </div>
  )
}
