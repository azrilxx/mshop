import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { reportDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, category, description, contact } = await request.json()

    if (!productId || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const report = await reportDb.create({
      productId,
      reporterId: session.id,
      category,
      description,
      contact
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: report.id 
    })
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await reportDb.getAll()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Failed to get reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}