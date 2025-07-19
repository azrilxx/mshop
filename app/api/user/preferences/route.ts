import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { notifyOrder, notifyStatus, notifyMarketing, twoFactorEnabled } = await request.json()

    const updates: any = {}

    if (typeof notifyOrder === 'boolean') {
      updates.notifyOrder = notifyOrder
    }

    if (typeof notifyStatus === 'boolean') {
      updates.notifyStatus = notifyStatus
    }

    if (typeof notifyMarketing === 'boolean') {
      updates.notifyMarketing = notifyMarketing
    }

    if (typeof twoFactorEnabled === 'boolean') {
      if (user.role === 'admin') {
        return NextResponse.json(
          { error: 'Two-factor authentication cannot be disabled for admin accounts' },
          { status: 400 }
        )
      }
      updates.twoFactorEnabled = twoFactorEnabled
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      )
    }

    const updatedUser = await userDb.updateUser(user.email, updates)
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'Preferences updated successfully',
      user: userWithoutPassword
    })
  } catch (error: any) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({
      preferences: {
        notifyOrder: user.notifyOrder ?? true,
        notifyStatus: user.notifyStatus ?? true,
        notifyMarketing: user.notifyMarketing ?? false,
        twoFactorEnabled: user.twoFactorEnabled ?? (user.role === 'admin')
      },
      user: userWithoutPassword
    })
  } catch (error: any) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}