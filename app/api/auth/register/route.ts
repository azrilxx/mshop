import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await userDb.create(email, password, role)
    await createSession(user)

    if (role === 'seller') {
      try {
        await notificationService.notifyNewSellerRegistration(user)
      } catch (error) {
        console.error('Failed to send new seller notification:', error)
      }
    }

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    )
  }
}