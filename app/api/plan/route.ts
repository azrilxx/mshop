
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { dbOps } from '@/lib/db'
import { getPlanLimits } from '@/lib/plan'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Get user's current plan from database
    let userPlan = await dbOps.getUserPlan(user.id)
    
    if (!userPlan) {
      // Initialize with free plan if not exists
      const freeLimits = getPlanLimits('free')
      userPlan = {
        tier: 'free',
        maxProducts: freeLimits.products,
        maxAds: freeLimits.ads,
        maxReports: freeLimits.quotes // Using quotes as reports
      }
      await dbOps.updateUserPlan(user.id, userPlan)
    }

    return NextResponse.json({
      tier: userPlan.tier,
      maxProducts: userPlan.maxProducts,
      maxAds: userPlan.maxAds,
      maxReports: userPlan.maxReports || 0,
      hasAdvancedAnalytics: userPlan.tier !== 'free',
      hasPrioritySupport: userPlan.tier === 'premium'
    })
  } catch (error) {
    console.error('Plan API error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { tier } = body

    if (!['free', 'standard', 'premium'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 })
    }

    const limits = getPlanLimits(tier)
    const planData = {
      tier,
      maxProducts: limits.products,
      maxAds: limits.ads,
      maxReports: limits.quotes
    }

    await dbOps.updateUserPlan(user.id, planData)

    return NextResponse.json({ success: true, plan: planData })
  } catch (error) {
    console.error('Update plan error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
