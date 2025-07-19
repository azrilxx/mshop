import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const users = await userDb.getAll()
    
    // Remove password hashes from response
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      createdAt: user.createdAt
    }))

    return NextResponse.json(safeUsers)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const { email, is_verified } = await request.json()

    if (!email || typeof is_verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Email and verification status are required' },
        { status: 400 }
      )
    }

    await userDb.updateVerificationStatus(email, is_verified)

    return NextResponse.json({ message: 'User verification status updated' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}