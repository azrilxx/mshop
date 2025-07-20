
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { rfqDb, productDb, userDb } from '@/lib/db'
import { emailService } from '@/lib/mailchimp'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const { productId, name, email, quantity, region, message } = await request.json()

    // Validate required fields
    if (!productId || !name || !email || !quantity || !region || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get product to verify it exists and get seller info
    const product = await productDb.findById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get seller info for notifications
    const seller = await userDb.findById(product.merchantId)
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Create RFQ
    const rfq = await rfqDb.create({
      productId,
      buyerId: session?.user?.id || null,
      name,
      email,
      quantity: parseInt(quantity),
      region,
      message
    })

    // Send notification to seller
    try {
      if (seller.whatsappNumber) {
        console.log('WhatsApp notification available for seller:', seller.whatsappNumber)
      }

      // Email notification - TODO: Implement proper email service integration
      if (seller.email && seller.notifyOrder) {
        console.log(`Email notification would be sent to ${seller.email} for RFQ on ${product.name}`)
        // await emailService.sendTransactionalEmail(...)
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the RFQ submission if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      rfqId: rfq.id,
      whatsappAvailable: !!seller.whatsappNumber,
      whatsappNumber: seller.whatsappNumber 
    })

  } catch (error) {
    console.error('RFQ submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const buyerId = searchParams.get('buyerId')

    let rfqs = []

    if (productId) {
      // Get RFQs for a specific product (seller view)
      const product = await productDb.findById(productId)
      if (!product || product.merchantId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      rfqs = await rfqDb.getByProduct(productId)
    } else if (buyerId) {
      // Get RFQs by buyer (buyer view)
      if (session.user.id !== buyerId && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      rfqs = await rfqDb.getByBuyer(buyerId)
    } else if (session.user.role === 'seller') {
      // Get all RFQs for seller's products
      rfqs = await rfqDb.getBySeller(session.user.id)
    } else if (session.user.role === 'buyer') {
      // Get buyer's own RFQs
      rfqs = await rfqDb.getByBuyer(session.user.id)
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    return NextResponse.json(rfqs)

  } catch (error) {
    console.error('Get RFQs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RFQs' },
      { status: 500 }
    )
  }
}
