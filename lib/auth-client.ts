'use client'

import { User } from './db'

export interface Session {
  user: User
  expires: string
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

export async function getClientSession(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/session')
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function requireClientAuth(): Promise<Session> {
  const session = await getClientSession()
  if (!session) {
    window.location.href = '/login'
    throw new Error('Authentication required')
  }
  return session
}

export async function requireClientRole(allowedRoles: ('buyer' | 'seller' | 'admin')[]): Promise<Session> {
  const session = await requireClientAuth()
  if (!allowedRoles.includes(session.user.role)) {
    window.location.href = '/dashboard'
    throw new Error('Insufficient permissions')
  }
  return session
}