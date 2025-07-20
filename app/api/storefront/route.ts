
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { dbOps, Storefront } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const merchantId = searchParams.get('merchantId')

    if (slug) {
      const storefront = await dbOps.getStorefrontBySlug(slug)
      if (!storefront) {
        return NextResponse.json({ error: 'Storefront not found' }, { status: 404 })
      }
      return NextResponse.json({ storefront })
    }

    if (merchantId) {
      const storefront = await dbOps.getStorefrontByMerchant(merchantId)
      return NextResponse.json({ storefront })
    }

    const storefronts = await dbOps.getStorefronts()
    return NextResponse.json({ storefronts })
  } catch (error: any) {
    console.error('Failed to get storefront:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.role !== 'seller' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only sellers can create storefronts' }, { status: 403 })
    }

    const data = await request.json()
    const { store_name, bio, contact_email, contact_phone, address, custom_domain } = data

    // Check if merchant already has a storefront
    const existingStorefront = await dbOps.getStorefrontByMerchant(session.user.id)
    if (existingStorefront) {
      return NextResponse.json({ error: 'Storefront already exists for this merchant' }, { status: 400 })
    }

    // Generate unique slug
    const slug = await dbOps.generateUniqueSlug(store_name)

    const storefront: Storefront = {
      id: `storefront-${Date.now()}`,
      merchant_id: session.user.id,
      store_name,
      slug,
      bio: bio || '',
      contact_email,
      contact_phone,
      address,
      custom_domain,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await dbOps.createStorefront(storefront)
    return NextResponse.json({ storefront }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create storefront:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.role !== 'seller' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only sellers can update storefronts' }, { status: 403 })
    }

    const data = await request.json()
    const { id, store_name, bio, logo_url, banner_url, contact_email, contact_phone, address, custom_domain } = data

    // Get existing storefront to verify ownership
    const existingStorefront = await dbOps.getStorefrontByMerchant(session.user.id)
    if (!existingStorefront || existingStorefront.id !== id) {
      return NextResponse.json({ error: 'Storefront not found or access denied' }, { status: 404 })
    }

    const updates: Partial<Storefront> = {
      bio,
      logo_url,
      banner_url,
      contact_email,
      contact_phone,
      address,
      custom_domain,
      updated_at: new Date().toISOString()
    }

    // If store name is changing, regenerate slug
    if (store_name && store_name !== existingStorefront.store_name) {
      updates.store_name = store_name
      updates.slug = await dbOps.generateUniqueSlug(store_name)
    }

    await dbOps.updateStorefront(id, updates)
    
    const updatedStorefront = await dbOps.getStorefrontByMerchant(session.user.id)
    return NextResponse.json({ storefront: updatedStorefront })
  } catch (error: any) {
    console.error('Failed to update storefront:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
