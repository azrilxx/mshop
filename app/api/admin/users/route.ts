
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await userDb.getAll()
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
      await userDb.suspend(userId)
      return NextResponse.json({ success: true, message: 'User suspended successfully' })
    }

    if (action === 'activate') {
      await userDb.activate(userId)
      return NextResponse.json({ success: true, message: 'User activated successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
