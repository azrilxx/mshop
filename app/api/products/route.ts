import { NextRequest, NextResponse } from 'next/server'
import { productDb, planDb } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const isPublic = searchParams.get('public') === 'true'
    const recommendations = searchParams.get('recommendations')
    const id = searchParams.get('id')

    if (id) {
      const product = await productDb.findById(id)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json([product])
    }

    if (recommendations) {
      const recommendedProducts = await productDb.getRecommendations(recommendations, 4)
      return NextResponse.json(recommendedProducts)
    }

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
    const user = await requireAuth()
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, price, description, category, images, listingType, location } = await request.json()

    // Check seller's plan limits
    const plan = await planDb.get(user.id)
    const sellerProducts = await productDb.findByMerchant(user.id)

    if (plan.maxProducts !== -1 && sellerProducts.length >= plan.maxProducts) {
      return NextResponse.json({ 
        error: `Product limit reached. Your ${plan.tier} plan allows ${plan.maxProducts} products.` 
      }, { status: 403 })
    }

    const product = await productDb.create({
      name,
      price: parseFloat(price) || 0,
      description,
      category,
      merchantId: user.id,
      status: 'active',
      images: images || [],
      listingType: listingType || 'fixed',
      location: location || { city: '', country: '' }
    })

    // Increment seller's quota
    await planDb.incrementQuota(user.id)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}