import { NextRequest, NextResponse } from 'next/server'
import { orderDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { notificationService } from '@/lib/notification-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { status, shipmentStatus } = await request.json()

    if (!params.id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = await orderDb.findById(params.id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins and sellers can update order status' },
        { status: 403 }
      )
    }

    const oldStatus = order.status
    const updates: any = {}
    
    if (status && status !== oldStatus) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updates.status = status
    }

    if (shipmentStatus !== undefined) {
      updates.shipmentStatus = shipmentStatus
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const updatedOrder = await orderDb.update(params.id, updates)
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    if (status && status !== oldStatus) {
      try {
        await notificationService.notifyOrderStatusUpdate(updatedOrder, oldStatus)
      } catch (error) {
        console.error('Failed to send status update notification:', error)
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = await orderDb.findById(params.id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.buyerId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}