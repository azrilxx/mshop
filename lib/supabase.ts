
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gpxhjjhhnijrxoumxsqp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweGhqamhobmlqcnhvdW14c3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTE3MTksImV4cCI6MjA2ODM4NzcxOX0.t-0zVxVbY5R52qrXn8cuA6CFYVG41jjBkGzOMR9UEtU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  plan: 'free' | 'standard' | 'premium'
  tenant_id: string
  created_at: string
  status: 'active' | 'inactive' | 'pending'
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  seller_id: string
  merchant_id: string
  image_url: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at?: string
  stock: number
  tags: string[]
}

export interface Advertisement {
  id: string
  seller_id: string
  merchant_id: string
  product_id?: string
  title: string
  description: string
  image_url: string
  active_from: string
  active_until: string
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at?: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  total_price: number
  status: 'unpaid' | 'to_ship' | 'shipping' | 'complete' | 'cancelled'
  created_at: string
  updated_at: string
  shipping_address: string
}

export interface Rating {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
}

export interface Storefront {
  id: string
  merchant_id: string
  store_name: string
  slug: string
  bio: string
  logo_url?: string
  banner_url?: string
  custom_domain?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'standard' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export default supabase
