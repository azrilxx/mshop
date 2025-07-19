import { NextRequest, NextResponse } from 'next/server'
import { orderDb, cartDb, productDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { notificationService } from '@/lib/notification-service'
import { getTenantContext, validateOwnership, TenantSecurityError } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const orders = await orderDb.findByBuyer(user.id)

    // Get product details for each order
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const products = await Promise.all(
          order.productIds.map(async (productId) => {
            return await productDb.findById(productId)
          })
        )
        return {
          ...order,
          products: products.filter(Boolean)
        }
      })
    )

    return NextResponse.json(ordersWithProducts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const cart = await cartDb.get(user.id)

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate total price
    let totalPrice = 0
    const productIds: string[] = []

    for (const item of cart.items) {
      const product = await productDb.findById(item.productId)
      if (product) {
        totalPrice += product.price * item.quantity
        // Add product ID for each quantity
        for (let i = 0; i < item.quantity; i++) {
          productIds.push(product.id)
        }
      }
    }

    const order = await orderDb.create({
      buyerId: user.id,
      productIds,
      totalPrice,
      status: 'pending'
    })

    // Clear cart after order
    await cartDb.clear(user.id)

    // Send order notification to sellers
    try {
      await notificationService.notifyOrderPlaced(order)
    } catch (error) {
      console.error('Failed to send order notification:', error)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}