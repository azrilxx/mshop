import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { dbOps } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get current usage from database
    let usage = await dbOps.getUserUsage(user.id)

    if (!usage) {
      usage = {
        productsCreated: 0,
        adsCreated: 0,
        reportsGenerated: 0
      }
    }

    // Count actual records to ensure accuracy
    const userProducts = await dbOps.getProductsBySeller(user.id)
    const userAds = await dbOps.getAdvertisementsBySeller(user.id)

    return NextResponse.json({
      productsCreated: userProducts.length,
      adsCreated: userAds.length,
      reportsGenerated: usage.reportsGenerated || 0
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}