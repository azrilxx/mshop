import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notification-service'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      )
    }

    await notificationService.processAbandonedCarts()

    return NextResponse.json({ 
      message: 'Abandoned cart processing initiated' 
    })
  } catch (error: any) {
    console.error('Error processing abandoned carts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process abandoned carts' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await notificationService.sendAbandonedCartReminder(userId)

    return NextResponse.json({ 
      message: `Abandoned cart reminder sent to user ${userId}` 
    })
  } catch (error: any) {
    console.error('Error sending abandoned cart reminder:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send abandoned cart reminder' },
      { status: 500 }
    )
  }
}