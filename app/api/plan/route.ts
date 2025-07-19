import { NextRequest, NextResponse } from 'next/server'
import { planDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const plan = await planDb.get(user.id)
    
    return NextResponse.json(plan)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { tier } = await request.json()

    if (!tier || !['Free', 'Standard', 'Premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    const plan = await planDb.update(user.id, { tier })
    
    return NextResponse.json(plan)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { action } = await request.json()

    if (action === 'increment_quota') {
      await planDb.incrementQuota(user.id)
    } else if (action === 'decrement_quota') {
      await planDb.decrementQuota(user.id)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const plan = await planDb.get(user.id)
    return NextResponse.json(plan)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update quota' },
      { status: 500 }
    )
  }
}