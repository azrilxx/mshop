
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import Database from '@replit/database'

const db = new Database(process.env.REPLIT_DB_URL)

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count keys for each type
    const [userKeys, productKeys, rfqKeys] = await Promise.all([
      db.list('user:'),
      db.list('product:'),
      db.list('rfq:')
    ])

    // Count buyers and sellers
    let totalBuyers = 0
    let totalSellers = 0

    for (const key of userKeys) {
      try {
        const user = await db.get(key)
        if (user?.role === 'buyer') totalBuyers++
        if (user?.role === 'seller') totalSellers++
      } catch (error) {
        console.warn(`Failed to get user ${key}:`, error)
      }
    }

    const metrics = {
      totalBuyers,
      totalSellers,
      totalProducts: productKeys.length,
      totalRFQs: rfqKeys.length
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Metrics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
