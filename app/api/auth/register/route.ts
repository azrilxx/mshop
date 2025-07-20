import { NextRequest } from 'next/server'
import { registerUser, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400 })
    }

    const user = await registerUser(email, password, name, role || 'buyer')
    const sessionId = await createSession(user)

    return Response.json({ success: true, user, sessionId })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}