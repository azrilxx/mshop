import { NextRequest, NextResponse } from 'next/server'
import { ratingDb, orderDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const ratings = await ratingDb.getByProduct(productId)
    const averageRating = await ratingDb.getAverageRating(productId)
    
    return NextResponse.json({
      ratings,
      averageRating
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { productId, orderId, rating, comment } = await request.json()

    if (!productId || !orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Product ID, order ID, and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Verify the order exists and belongs to the user
    const order = await orderDb.findById(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only rate products from your own orders' },
        { status: 403 }
      )
    }

    // Verify the product is in the order
    if (!order.productIds.includes(productId)) {
      return NextResponse.json(
        { error: 'Product not found in this order' },
        { status: 400 }
      )
    }

    // Check if rating already exists
    const existingRating = await ratingDb.get(productId, user.id)
    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this product' },
        { status: 400 }
      )
    }

    const newRating = await ratingDb.create({
      productId,
      userId: user.id,
      orderId,
      rating,
      comment: comment || ''
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create rating' },
      { status: 500 }
    )
  }
}