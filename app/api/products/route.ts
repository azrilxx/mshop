import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { dbOps, Product } from '@/lib/db'

export async function GET() {
  try {
    const products = await dbOps.getProducts()
    const approvedProducts = products.filter(p => p.status === 'approved')
    return Response.json({ products: approvedProducts })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== 'seller' && user.role !== 'admin') {
      return Response.json({ error: 'Only sellers can create products' }, { status: 403 })
    }

    // Check plan limits
    const canCreate = await dbOps.checkUserPlanLimit(user.id, 'products')
    if (!canCreate) {
      return Response.json({ error: 'Plan limit exceeded. Upgrade your plan to create more products.' }, { status: 403 })
    }

    const productData = await request.json()

    const product: Product = {
      id: `product-${Date.now()}`,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      seller_id: user.id,
      tenant_id: user.tenant_id || 'default',
      status: 'pending',
      images: productData.images || [],
      tags: productData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const createdProduct = await dbOps.createProduct(product)
    return Response.json({ product: createdProduct })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})