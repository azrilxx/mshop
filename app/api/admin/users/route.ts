import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userDb } from '@/lib/db'
import { getTenantContext, validateAdminAccess, TenantSecurityError } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext()
    if (!context || !validateAdminAccess(context.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const users = await userDb.getAll()
    return NextResponse.json({ 
      users: users.map((user: any) => ({
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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (action === 'suspend') {
      const user = await userDb.findById(userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      await userDb.suspend(user.email)
      return NextResponse.json({ success: true, message: 'User suspended successfully' })
    }

    if (action === 'activate') {
      const user = await userDb.findById(userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      await userDb.activate(user.email)
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