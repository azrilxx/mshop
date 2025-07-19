import { NextRequest, NextResponse } from 'next/server'
import { adDb, planDb, productDb, planUsageDb } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { getPlanLimits } from '@/lib/plan'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    if (sellerId) {
      const ads = await adDb.findBySeller(sellerId)
      return NextResponse.json(ads)
    } else if (activeOnly) {
      const ads = await adDb.getActiveAds()
      return NextResponse.json(ads)
    } else {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['seller', 'admin'])
    const { productId, imageUrl, title, description, durationDays } = await request.json()

    if (!productId || !imageUrl || !title || !description || !durationDays) {
      return NextResponse.json(
        { error: 'Product ID, image URL, title, description, and duration are required' },
        { status: 400 }
      )
    }

    // Verify product exists and belongs to the seller
    const product = await productDb.findById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (user.role === 'seller' && product.merchantId !== user.id) {
      return NextResponse.json(
        { error: 'You can only create ads for your own products' },
        { status: 403 }
      )
    }

    // Check user's plan and monthly usage for ads
    const [plan, usage] = await Promise.all([
      planDb.get(user.id),
      planUsageDb.get(user.id)
    ])

    const limits = getPlanLimits(plan.tier)
    if (limits.maxAds === 0) {
      return NextResponse.json(
        { error: `Your ${plan.tier} plan doesn't include ads. Please upgrade.` },
        { status: 403 }
      )
    }

    if (limits.maxAds !== -1 && usage.adsCreated >= limits.maxAds) {
      return NextResponse.json(
        { error: `Ad limit reached for your ${plan.tier} plan (${limits.maxAds}/month)` },
        { status: 403 }
      )
    }

    const activeFrom = new Date()
    const activeUntil = new Date(activeFrom.getTime() + (durationDays * 24 * 60 * 60 * 1000))

    const ad = await adDb.create({
      sellerId: user.id,
      productId,
      imageUrl,
      title,
      description,
      activeFrom: activeFrom.toISOString(),
      activeUntil: activeUntil.toISOString(),
      status: 'active'
    })

    // Increment ad slot usage for sellers
    if (user.role === 'seller') {
      const plan = await planDb.get(user.id)
      await Promise.all([
        planDb.update(user.id, { adSlotsUsed: plan.adSlotsUsed + 1 }),
        planUsageDb.incrementAds(user.id)
      ])
    }

    return NextResponse.json(ad, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create ad' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(['seller', 'admin'])
    const { adId, status } = await request.json()

    if (!adId || !status) {
      return NextResponse.json(
        { error: 'Ad ID and status are required' },
        { status: 400 }
      )
    }

    const ad = await adDb.findById(adId)
    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      )
    }

    if (user.role === 'seller' && ad.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own ads' },
        { status: 403 }
      )
    }

    const updatedAd = await adDb.update(adId, { status })
    return NextResponse.json(updatedAd)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update ad' },
      { status: 500 }
    )
  }
}