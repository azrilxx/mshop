import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notification-service'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      )
    }

    const connectionStatus = await notificationService.testEmailConnection()

    return NextResponse.json({
      message: 'Email service connection test completed',
      status: connectionStatus
    })
  } catch (error: any) {
    console.error('Error testing email connection:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to test email connection' },
      { status: 500 }
    )
  }
}