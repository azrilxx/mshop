import { NextRequest, NextResponse } from 'next/server'
import { cartDb, userDb } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    
    const abandonedCarts = await cartDb.getAbandonedCarts()
    
    // Get user details for each abandoned cart
    const cartsWithUsers = await Promise.all(
      abandonedCarts.map(async ({ userId, cart }) => {
        const user = await userDb.findByEmail(userId) // Assuming userId is email
        return {
          userId,
          user: user ? { email: user.email, role: user.role } : null,
          cart,
          itemCount: cart.items.length,
          lastUpdated: cart.updatedAt
        }
      })
    )
    
    return NextResponse.json(cartsWithUsers)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch abandoned carts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    
    const { userId, markReminderSent } = await request.json()
    
    if (!userId || typeof markReminderSent !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and markReminderSent flag are required' },
        { status: 400 }
      )
    }
    
    const cart = await cartDb.get(userId)
    cart.reminderSent = markReminderSent
    await cartDb.update(userId, cart)
    
    return NextResponse.json({ message: 'Cart reminder status updated' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update cart reminder status' },
      { status: 500 }
    )
  }
}

// Worker endpoint to check for abandoned carts
export async function PATCH(request: NextRequest) {
  try {
    // This would typically be called by a cron job or background worker
    const abandonedCarts = await cartDb.getAbandonedCarts()
    
    let remindersSent = 0
    
    for (const { userId, cart } of abandonedCarts) {
      // In a real application, you would send an email here
      // For now, we'll just mark the reminder as sent
      cart.reminderSent = true
      await cartDb.update(userId, cart)
      remindersSent++
    }
    
    return NextResponse.json({ 
      message: `Processed ${remindersSent} abandoned cart reminders`,
      remindersSent 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process abandoned cart reminders' },
      { status: 500 }
    )
  }
}