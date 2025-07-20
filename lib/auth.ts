import { supabase } from './supabase'
import { dbOps } from './db'
import type { User } from './supabase'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export interface AuthSession {
  user: User | null
  token?: string
}

export async function register(email: string, password: string, name: string, role: 'buyer' | 'seller' = 'buyer'): Promise<AuthSession> {
  try {
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create the profile in our profiles table
    const userData: Omit<User, 'created_at'> = {
      id: authData.user.id,
      email,
      name,
      role,
      plan: 'free',
      tenant_id: `tenant_${authData.user.id}`,
      status: 'active'
    }

    const user = await dbOps.createUser(userData)

    // Generate JWT token for session management
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user, token }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function login(email: string, password: string): Promise<AuthSession> {
  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Invalid credentials')

    // Get the user profile
    const user = await dbOps.getUserByEmail(email)
    if (!user) throw new Error('User profile not found')

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user, token }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession(token?: string): Promise<AuthSession> {
  try {
    // First try to get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession()

    if (session?.user) {
      const user = await dbOps.getUserByEmail(session.user.email!)
      if (user) {
        return { user }
      }
    }

    // Fallback to JWT token validation if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        const user = await dbOps.getUserById(decoded.userId)
        if (user) {
          return { user, token }
        }
      } catch (jwtError) {
        console.log('JWT validation failed:', jwtError)
      }
    }

    return { user: null }
  } catch (error) {
    console.error('Session error:', error)
    return { user: null }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return await dbOps.getUserByEmail(user.email!)
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

// Legacy bcrypt functions for fallback authentication
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}