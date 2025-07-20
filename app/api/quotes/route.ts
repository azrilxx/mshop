import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { dbOps, Quote } from '@/lib/db'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const quotes = await dbOps.getQuotes(user.tenant_id)

    // Filter quotes based on user role
    let userQuotes: Quote[]
    if (user.role === 'admin') {
      userQuotes = quotes
    } else if (user.role === 'seller') {
      userQuotes = quotes.filter(q => q.seller_id === user.id)
    } else {
      userQuotes = quotes.filter(q => q.buyer_id === user.id)
    }

    return Response.json({ quotes: userQuotes })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    if (user.role !== 'buyer' && user.role !== 'admin') {
      return Response.json({ error: 'Only buyers can request quotes' }, { status: 403 })
    }

    const quoteData = await request.json()

    // Get product to find seller
    const product = await dbOps.getProductById(quoteData.product_id)
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const quote: Quote = {
      id: `quote-${Date.now()}`,
      product_id: quoteData.product_id,
      buyer_id: user.id,
      seller_id: product.seller_id,
      quantity: quoteData.quantity,
      message: quoteData.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      tenant_id: user.tenant_id || 'default'
    }

    const createdQuote = await dbOps.createQuote(quote)
    return Response.json({ quote: createdQuote })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})