import { NextRequest, NextResponse } from 'next/server'
import { cartDb, productDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const cart = await cartDb.get(user.id)
    
    // Get product details for each cart item
    const cartWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productDb.findById(item.productId)
        return {
          ...item,
          product
        }
      })
    )

    return NextResponse.json({
      items: cartWithProducts,
      updatedAt: cart.updatedAt
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await productDb.findById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await cartDb.addItem(user.id, productId, quantity)

    return NextResponse.json({ message: 'Item added to cart' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await cartDb.removeItem(user.id, productId)

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}