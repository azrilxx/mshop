
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { rfqDb, productDb } from '@/lib/db'

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, rfqId, status } = await request.json()

    if (!productId || !rfqId || !status) {
      return NextResponse.json(
        { error: 'Product ID, RFQ ID and status are required' },
        { status: 400 }
      )
    }

    // Verify seller owns the product
    const product = await productDb.findById(productId)
    if (!product || product.merchantId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validStatuses = ['submitted', 'viewed', 'responded', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedRFQ = await rfqDb.updateStatus(productId, rfqId, status)
    if (!updatedRFQ) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 })
    }

    return NextResponse.json(updatedRFQ)

  } catch (error) {
    console.error('RFQ status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update RFQ status' },
      { status: 500 }
    )
  }
}
