import { NextRequest, NextResponse } from 'next/server'
import { productDb, planDb } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const isPublic = searchParams.get('public') === 'true'
    
    if (merchantId) {
      // Get products for a specific merchant
      const products = await productDb.findByMerchant(merchantId)
      return NextResponse.json(products)
    } else if (isPublic) {
      // Get products for public display (verified merchants only)
      const products = await productDb.getAllForPublic()
      return NextResponse.json(products)
    } else {
      // Get all active products (admin/internal use)
      const products = await productDb.getAll()
      return NextResponse.json(products)
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['seller', 'admin'])
    const { name, price, description, category, images } = await request.json()

    if (!name || !price || !description || !category) {
      return NextResponse.json(
        { error: 'Name, price, description, and category are required' },
        { status: 400 }
      )
    }

    // Check plan limits for sellers
    if (user.role === 'seller') {
      const plan = await planDb.get(user.id)
      
      if (plan.quotaUsed >= plan.maxProducts) {
        return NextResponse.json(
          { error: `Product limit reached. Your ${plan.tier} plan allows ${plan.maxProducts} products. Upgrade your plan to create more products.` },
          { status: 403 }
        )
      }
    }

    const product = await productDb.create({
      name,
      price: parseFloat(price),
      description,
      category,
      merchantId: user.id,
      status: 'active',
      images: images || []
    })

    // Increment quota for sellers
    if (user.role === 'seller') {
      await planDb.incrementQuota(user.id)
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}