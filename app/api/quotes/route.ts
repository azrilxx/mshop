
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
        console.log(`Email notification would be sent to ${seller.email} for quote request on ${product.name}`)
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
