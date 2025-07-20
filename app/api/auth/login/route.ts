import { NextRequest } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const sessionId = await loginUser(email, password)

    return Response.json({ success: true, sessionId })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 401 })
  }
}