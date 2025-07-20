
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { dbOps } from '@/lib/db'
import { getPlanLimits } from '@/lib/plan'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only sellers can view ads' }, { status: 403 })
    }

    const ads = await dbOps.getAdvertisementsBySeller(user.id)
    return NextResponse.json(ads)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (user.role !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can create ads' }, { status: 403 })
    }

    const data = await request.json()
    const { title, description, product_id, duration_days } = data

    // Check user's plan limits
    const planLimits = getPlanLimits(user.plan)
    const currentAds = await dbOps.getAdvertisementsBySeller(user.id)
    const activeAds = currentAds.filter(ad => ad.status === 'active').length

    if (planLimits.ads !== -1 && activeAds >= planLimits.ads) {
      return NextResponse.json({ 
        error: `Ad limit reached for ${user.plan} plan. Current: ${activeAds}, Limit: ${planLimits.ads}`,
        planLimit: planLimits.ads,
        currentUsage: activeAds
      }, { status: 403 })
    }

    // Verify the product belongs to the seller
    const product = await dbOps.getProductById(product_id)
    if (!product || product.seller_id !== user.id) {
      return NextResponse.json({ error: 'Product not found or not owned by you' }, { status: 404 })
    }

    const newAd = {
      id: `ad-${Date.now()}`,
      seller_id: user.id,
      product_id,
      title,
      description,
      image_url: product.image_url, // Use product image for now
      active_from: new Date().toISOString(),
      active_until: new Date(Date.now() + (duration_days * 24 * 60 * 60 * 1000)).toISOString(),
      status: 'active' as const,
      created_at: new Date().toISOString()
    }

    await dbOps.createAdvertisement(newAd)

    // Update usage tracking
    await dbOps.incrementUsage(user.id, 'adsCreated')

    return NextResponse.json(newAd, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get('id')

    if (!adId) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 })
    }

    const ads = await dbOps.getAdvertisementsBySeller(user.id)
    const ad = ads.find(a => a.id === adId)

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found or not owned by you' }, { status: 404 })
    }

    await dbOps.updateAdvertisement(adId, { status: 'inactive' })

    return NextResponse.json({ message: 'Ad deactivated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
