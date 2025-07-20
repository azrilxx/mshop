import { cookies } from 'next/headers'
import { User } from './db'

export interface Session {
  user: User
  expires: string
}

export async function createSession(user: User): Promise<void> {
  const session: Session = {
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }

  cookies().set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get('session')
  if (!sessionCookie) return null

  try {
    const session: Session = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      await deleteSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  cookies().delete('session')
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session.user
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}