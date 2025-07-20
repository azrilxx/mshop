
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { dbOps, User } from './db'

export interface Session {
  user: User
  sessionId: string
  expiresAt: Date
}

// Session management using cookies
export async function createSession(user: User): Promise<string> {
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const session: Session = {
    user,
    sessionId,
    expiresAt
  }
  
  // Store session in database
  try {
    const sessions = await dbOps.getAllFromTable<Session>('sessions') || []
    sessions.push(session)
    await dbOps.addToTable('sessions', session)
    
    // Set cookie
    cookies().set('session', sessionId, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return sessionId
  } catch (error) {
    console.error('Error creating session:', error)
    throw new Error('Failed to create session')
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const sessionId = cookies().get('session')?.value
    if (!sessionId) return null
    
    const sessions = await dbOps.getAllFromTable<Session>('sessions') || []
    const session = sessions.find(s => s.sessionId === sessionId)
    
    if (!session) return null
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await deleteSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const sessionId = cookies().get('session')?.value
    if (!sessionId) return
    
    // Remove from database
    const sessions = await dbOps.getAllFromTable<Session>('sessions') || []
    const filteredSessions = sessions.filter(s => s.sessionId !== sessionId)
    await dbOps.addToTable('sessions', filteredSessions)
    
    // Clear cookie
    cookies().delete('session')
  } catch (error) {
    console.error('Error deleting session:', error)
  }
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

// Middleware helper for API routes
export function withAuth(handler: (req: NextRequest, user: User) => Promise<Response>) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      return handler(req, user)
    } catch (error) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
}

export function withRole(allowedRoles: string[], handler: (req: NextRequest, user: User) => Promise<Response>) {
  return async (req: NextRequest) => {
    try {
      const user = await requireRole(allowedRoles)
      return handler(req, user)
    } catch (error) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
}

// Password hashing (simple implementation for demo)
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

// User registration
export async function registerUser(email: string, password: string, name: string, role: 'buyer' | 'seller' = 'buyer'): Promise<User> {
  // Check if user already exists
  const existingUser = await dbOps.getUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }
  
  const hashedPassword = await hashPassword(password)
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role,
    plan: 'free',
    tenant_id: `tenant-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'active'
  }
  
  await dbOps.createUser(user)
  
  // Store password separately (in production, use proper user management)
  const passwords = await dbOps.getAllFromTable<any>('passwords') || []
  passwords.push({ userId: user.id, hash: hashedPassword })
  await dbOps.addToTable('passwords', { userId: user.id, hash: hashedPassword })
  
  return user
}

// User login
export async function loginUser(email: string, password: string): Promise<string> {
  const user = await dbOps.getUserByEmail(email)
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  // Verify password
  const passwords = await dbOps.getAllFromTable<any>('passwords') || []
  const userPassword = passwords.find(p => p.userId === user.id)
  
  if (!userPassword || !(await verifyPassword(password, userPassword.hash))) {
    throw new Error('Invalid credentials')
  }
  
  return createSession(user)
}
