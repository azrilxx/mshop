import { NextRequest, NextResponse } from 'next/server'
import { orderDb, productDb } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(['seller', 'admin'])
    const { orderId, shipmentStatus } = await request.json()

    if (!orderId || !shipmentStatus) {
      return NextResponse.json(
        { error: 'Order ID and shipment status are required' },
        { status: 400 }
      )
    }

    const order = await orderDb.findById(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if seller owns products in this order
    if (user.role === 'seller') {
      const products = await Promise.all(
        order.productIds.map(id => productDb.findById(id))
      )
      
      const hasOwnProducts = products.some(product => 
        product && product.merchantId === user.id
      )
      
      if (!hasOwnProducts) {
        return NextResponse.json(
          { error: 'You can only update shipment status for your own products' },
          { status: 403 }
        )
      }
    }

    const updatedOrder = await orderDb.update(orderId, { shipmentStatus })
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update shipment status' },
      { status: 500 }
    )
  }
}