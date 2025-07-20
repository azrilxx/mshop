
import { supabase } from './supabase'
import type { User } from './supabase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export class AuthClient {
  private static instance: AuthClient
  private listeners: ((state: AuthState) => void)[] = []
  private state: AuthState = {
    user: null,
    loading: true,
    error: null
  }

  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient()
    }
    return AuthClient.instance
  }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch user profile
        const response = await fetch('/api/auth/session')
        const result = await response.json()
        
        if (result.success && result.user) {
          this.setState({
            user: result.user,
            loading: false,
            error: null
          })
        } else {
          this.setState({
            user: null,
            loading: false,
            error: null
          })
        }
      } else {
        this.setState({
          user: null,
          loading: false,
          error: null
        })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const response = await fetch('/api/auth/session')
          const result = await response.json()
          
          if (result.success && result.user) {
            this.setState({
              user: result.user,
              loading: false,
              error: null
            })
          }
        } else if (event === 'SIGNED_OUT') {
          this.setState({
            user: null,
            loading: false,
            error: null
          })
        }
      })

    } catch (error: any) {
      this.setState({
        user: null,
        loading: false,
        error: error.message
      })
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    
    // Immediately call with current state
    listener(this.state)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getState(): AuthState {
    return this.state
  }

  async login(email: string, password: string): Promise<void> {
    this.setState({ loading: true, error: null })
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success) {
        this.setState({
          user: result.user,
          loading: false,
          error: null
        })
      } else {
        this.setState({
          user: null,
          loading: false,
          error: result.error || 'Login failed'
        })
      }
    } catch (error: any) {
      this.setState({
        user: null,
        loading: false,
        error: error.message
      })
    }
  }

  async register(email: string, password: string, name: string, role: 'buyer' | 'seller' = 'buyer'): Promise<void> {
    this.setState({ loading: true, error: null })
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })

      const result = await response.json()

      if (result.success) {
        this.setState({
          user: result.user,
          loading: false,
          error: null
        })
      } else {
        this.setState({
          user: null,
          loading: false,
          error: result.error || 'Registration failed'
        })
      }
    } catch (error: any) {
      this.setState({
        user: null,
        loading: false,
        error: error.message
      })
    }
  }

  async logout(): Promise<void> {
    this.setState({ loading: true })
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await supabase.auth.signOut()
      
      this.setState({
        user: null,
        loading: false,
        error: null
      })
    } catch (error: any) {
      this.setState({
        user: null,
        loading: false,
        error: error.message
      })
    }
  }
}

// Export singleton instance
export const authClient = AuthClient.getInstance()
