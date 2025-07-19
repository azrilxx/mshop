
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userDb, productDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unverifiedSellers = await userDb.getUnverifiedSellers()
    return NextResponse.json({ sellers: unverifiedSellers })
  } catch (error) {
    console.error('Failed to get merchants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sellerId, action, reason } = await request.json()

    if (action === 'verify') {
      await userDb.verify(sellerId)
      return NextResponse.json({ success: true, message: 'Seller verified successfully' })
    }

    if (action === 'reject') {
      // Suspend the seller account instead of deleting
      await userDb.suspend(sellerId)
      
      // Optionally hide their products
      const sellerProducts = await productDb.getBySeller(sellerId)
      for (const product of sellerProducts) {
        await productDb.update(product.id, { status: 'inactive' })
      }
      
      return NextResponse.json({ success: true, message: 'Seller rejected and suspended' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update merchant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
