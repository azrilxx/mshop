import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await userDb.verifyPassword(email, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await createSession(user)

    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}