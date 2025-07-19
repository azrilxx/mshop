import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getTenantContext, validateAdminAccess, TenantSecurityError } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext()
    if (!context || !validateAdminAccess(context.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const users = await db.getAll()
    return NextResponse.json({ 
      users: users.map(user => ({
        ...user,
        password: undefined // Don't send passwords
      }))
    })
  } catch (error) {
    console.error('Failed to get users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (action === 'suspend') {
      await db.suspend(userId)
      return NextResponse.json({ success: true, message: 'User suspended successfully' })
    }

    if (action === 'activate') {
      await db.activate(userId)
      return NextResponse.json({ success: true, message: 'User activated successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext()
    if (!context || !validateAdminAccess(context.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}