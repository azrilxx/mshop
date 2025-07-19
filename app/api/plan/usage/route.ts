
import { NextRequest, NextResponse } from 'next/server'
import { planUsageDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const usage = await planUsageDb.get(user.id)
    
    return NextResponse.json(usage)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { action } = await request.json()

    if (!['products', 'ads', 'reports'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'products':
        await planUsageDb.incrementProducts(user.id)
        break
      case 'ads':
        await planUsageDb.incrementAds(user.id)
        break
      case 'reports':
        await planUsageDb.incrementReports(user.id)
        break
    }

    const usage = await planUsageDb.get(user.id)
    return NextResponse.json(usage)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update usage' },
      { status: 500 }
    )
  }
}
