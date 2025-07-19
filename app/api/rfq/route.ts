
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
      const whatsappMessage = `New quote request for ${product.name}\n\nFrom: ${name} (${email})\nQuantity: ${quantity}\nRegion: ${region}\n\nMessage: ${message}`
      
      if (seller.whatsappNumber) {
        // WhatsApp notification will be handled on the client side
        console.log('WhatsApp notification available for seller:', seller.whatsappNumber)
      }

      // Email notification
      if (seller.email && seller.notifyOrder) {
        await emailService.sendEmail({
          to: seller.email,
          subject: `New Quote Request: ${product.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Quote Request</h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Product: ${product.name}</h3>
                <p><strong>Price:</strong> $${product.price.toLocaleString()}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h4>Buyer Information:</h4>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Delivery Region:</strong> ${region}</p>
                
                <h4>Message:</h4>
                <p style="background: #f8fafc; padding: 15px; border-radius: 4px;">${message}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <p>Reply directly to this email to respond to the buyer.</p>
              </div>
            </div>
          `
        })
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
