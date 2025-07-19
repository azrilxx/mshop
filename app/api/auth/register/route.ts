import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, companyName, fullName, phone, country } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await userDb.create(email, password, role)

    // Update user with additional profile information
    if (companyName || fullName || phone || country) {
      await userDb.updateUser(email, {
        companyName,
        fullName,
        phone,
        country,
        registeredAt: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}