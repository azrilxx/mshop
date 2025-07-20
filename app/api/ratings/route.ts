
import { NextRequest, NextResponse } from 'next/server'
import { dbOps } from '@/lib/db'
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

    const ratings = await dbOps.getRatingsByProduct(productId)
    
    // Calculate average rating
    const totalRatings = ratings.length
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
      : 0

    return NextResponse.json({
      ratings,
      averageRating: {
        average: Math.round(averageRating * 10) / 10,
        count: totalRatings
      }
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

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Product ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    if (user.role !== 'buyer') {
      return NextResponse.json(
        { error: 'Only buyers can rate products' },
        { status: 403 }
      )
    }

    // Check if user has purchased this product (verify order exists)
    const orders = await dbOps.getOrdersByBuyer(user.id)
    const validOrder = orders.find(order => 
      order.id === orderId && order.product_id === productId && order.status === 'complete'
    )

    if (!validOrder) {
      return NextResponse.json(
        { error: 'You can only rate products you have purchased' },
        { status: 403 }
      )
    }

    // Check if rating already exists
    const existingRatings = await dbOps.getRatingsByProduct(productId)
    const existingRating = existingRatings.find(r => r.user_id === user.id)
    
    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this product' },
        { status: 400 }
      )
    }

    const newRating = {
      id: `rating-${Date.now()}`,
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment || '',
      created_at: new Date().toISOString()
    }

    await dbOps.createRating(newRating)

    return NextResponse.json(newRating, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create rating' },
      { status: 500 }
    )
  }
}
