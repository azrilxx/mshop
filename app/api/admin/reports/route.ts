
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { reportDb, productDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await reportDb.getAll()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Failed to get reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, reportId, action } = await request.json()

    if (action === 'reviewed') {
      await reportDb.update(productId, reportId, { 
        status: 'reviewed',
        reviewedAt: new Date().toISOString()
      })
      return NextResponse.json({ success: true, message: 'Report marked as reviewed' })
    }

    if (action === 'suspend') {
      // Suspend the product
      await productDb.update(productId, { status: 'inactive' })
      
      // Mark report as resolved
      await reportDb.update(productId, reportId, { 
        status: 'resolved',
        reviewedAt: new Date().toISOString(),
        adminNotes: 'Product suspended due to abuse report'
      })
      
      return NextResponse.json({ success: true, message: 'Listing suspended and report resolved' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
