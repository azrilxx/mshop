import { NextRequest, NextResponse } from 'next/server'
import { adDb, planDb, productDb } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'

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

    // Check plan limits for sellers
    if (user.role === 'seller') {
      const plan = await planDb.get(user.id)
      
      if (plan.maxAdSlots === 0) {
        return NextResponse.json(
          { error: `Ad slots not available. Your ${plan.tier} plan does not include ad slots. Upgrade to Standard or Premium plan.` },
          { status: 403 }
        )
      }

      if (plan.adSlotsUsed >= plan.maxAdSlots) {
        return NextResponse.json(
          { error: `Ad slot limit reached. Your ${plan.tier} plan allows ${plan.maxAdSlots} ad slots. Upgrade your plan for more slots.` },
          { status: 403 }
        )
      }
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
      await planDb.update(user.id, { adSlotsUsed: plan.adSlotsUsed + 1 })
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