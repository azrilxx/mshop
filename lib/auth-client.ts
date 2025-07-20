
'use client'

import { useState, useEffect } from 'react'
import { User } from './db'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/session')
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err: any) {
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, error }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    
    if (response.ok) {
      // Reload page to update auth state
      window.location.reload()
      return { success: true }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function registerUser(email: string, password: string, name: string, role: 'buyer' | 'seller' = 'buyer'): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    })

    const data = await response.json()
    
    if (response.ok) {
      // Reload page to update auth state  
      window.location.reload()
      return { success: true }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = '/'
  }
}

export function requireClientRole(allowedRoles: string[]) {
  return function withRoleCheck<T extends React.ComponentType<any>>(Component: T): T {
    return function AuthorizedComponent(props: any) {
      const { user, loading } = useAuth()
      
      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          </div>
        )
      }
      
      if (!user) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to access this page.</p>
              <a href="/login" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Log In
              </a>
            </div>
          </div>
        )
      }
      
      if (!allowedRoles.includes(user.role)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
              <a href="/dashboard" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Go to Dashboard
              </a>
            </div>
          </div>
        )
      }
      
      return <Component {...props} />
    } as T
  }
}
