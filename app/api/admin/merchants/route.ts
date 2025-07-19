import { NextRequest, NextResponse } from 'next/server'
import { userDb, productDb } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    
    const users = await userDb.getAll()
    const sellers = users.filter(user => user.role === 'seller')
    
    // Get product counts for each seller
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const products = await productDb.findByMerchant(seller.id)
        return {
          id: seller.id,
          email: seller.email,
          is_verified: seller.is_verified,
          createdAt: seller.createdAt,
          productCount: products.length,
          recentActivity: products.length > 0 
            ? `Last product: ${new Date(Math.max(...products.map(p => new Date(p.createdAt).getTime()))).toLocaleDateString()}`
            : 'No products yet'
        }
      })
    )

    return NextResponse.json(sellersWithStats)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}