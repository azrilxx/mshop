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

    const { userId, subject, message, htmlContent } = await request.json()

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: 'User ID, subject, and message are required' },
        { status: 400 }
      )
    }

    await notificationService.sendMarketingEmail(userId, subject, message, htmlContent)

    return NextResponse.json({ 
      message: `Marketing email sent to user ${userId}` 
    })
  } catch (error: any) {
    console.error('Error sending marketing email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send marketing email' },
      { status: 500 }
    )
  }
}