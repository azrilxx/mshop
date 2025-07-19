import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentMonth, canCreateAd } from '@/lib/plan'
import { getTenantContext, validateOwnership, TenantSecurityError } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (context.role !== 'seller' && context.role !== 'admin') {
      return NextResponse.json({ error: 'Only sellers can view ads' }, { status: 403 })
    }

    const ads = await db.getUserAds(context.userId)

    return NextResponse.json(ads)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (context.role !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can create ads' }, { status: 403 })
    }

    const data = await request.json()
    const { title, description, product_id, budget, duration } = data

    // Check plan limits
    const currentMonth = getCurrentMonth()
    const usage = await db.getUserPlanUsage(context.userId, currentMonth)

    if (!canCreateAd(context.role === 'admin' ? 'Premium' : 'Free', usage.adsCreated)) {
      return NextResponse.json({ 
        error: 'Ad limit reached for your plan',
        usage: usage.adsCreated,
        limit: context.role === 'admin' ? 'Premium' : 'Free'
      }, { status: 403 })
    }

    const ad = await db.createAd({
      user_id: context.userId,
      title,
      description,
      product_id,
      budget,
      duration,
      status: 'active',
      created_at: new Date().toISOString()
    })

    // Update usage
    await db.updatePlanUsage(context.userId, currentMonth, { adsCreated: 1 })

    return NextResponse.json(ad, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}