
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userDb, productDb, reportDb } from '@/lib/db'
import Database from '@replit/database'

const db = new Database(process.env.REPLIT_DB_URL)

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users
    const users = await userDb.getAll()
    const buyers = users.filter(user => user.role === 'buyer')
    const sellers = users.filter(user => user.role === 'seller')
    const verifiedSellers = sellers.filter(seller => seller.is_verified)
    const unverifiedSellers = sellers.filter(seller => !seller.is_verified)
    const suspendedUsers = users.filter(user => user.status === 'suspended')

    // Get all products
    const products = await productDb.getAll()

    // Get all reports
    const reports = await reportDb.getAll()
    const pendingReports = reports.filter(report => report.status === 'pending')

    // Count RFQs
    let totalRFQs = 0
    try {
      const rfqKeys = await db.list('rfq:')
      totalRFQs = rfqKeys.length
    } catch (error) {
      console.error('Failed to count RFQs:', error)
    }

    const metrics = {
      totalBuyers: buyers.length,
      totalSellers: sellers.length,
      totalProducts: products.length,
      totalRFQs,
      verifiedSellers: verifiedSellers.length,
      unverifiedSellers: unverifiedSellers.length,
      pendingReports: pendingReports.length,
      suspendedUsers: suspendedUsers.length
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Failed to get metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
