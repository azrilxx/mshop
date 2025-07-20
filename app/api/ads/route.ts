import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { adDb, planUsageDb } from '@/lib/db'
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

    const ads = await adDb.findBySeller(context.userId)

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
    const usage = await planUsageDb.get(context.userId)

    if (!canCreateAd('Free', usage.adsCreated)) {
      return NextResponse.json({ 
        error: 'Ad limit reached for your plan',
        usage: usage.adsCreated,
        limit: 'Free'
      }, { status: 403 })
    }

    const ad = await adDb.create({
      sellerId: context.userId,
      productId: product_id,
      imageUrl: '',
      title,
      description,
      activeFrom: new Date().toISOString(),
      activeUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    })

    // Update usage
    await planUsageDb.incrementAds(context.userId)

    return NextResponse.json(ad, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}