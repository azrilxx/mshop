import { emailService, EMAIL_TEMPLATES } from './mailchimp'
import { userDb, orderDb, productDb, planDb, cartDb } from './db'
import type { User, Order, Product, SubscriptionPlan } from './db'

interface NotificationContext {
  user: User
  plan: SubscriptionPlan
}

export class NotificationService {
  
  private async canSendEmail(user: User, plan: SubscriptionPlan, emailType: 'transactional' | 'cart' | 'marketing'): Promise<boolean> {
    if (!user.email) {
      console.log(`Skipped email - missing email for user ${user.id}`)
      return false
    }

    if (emailType === 'transactional') {
      return true
    }

    if (emailType === 'cart') {
      if (plan.tier === 'Free') {
        console.log(`Skipped cart email - Free plan user ${user.id}`)
        return false
      }
      return user.notifyStatus !== false
    }

    if (emailType === 'marketing') {
      if (plan.tier === 'Free') {
        console.log(`Skipped marketing email - Free plan user ${user.id}`)
        return false
      }
      return user.notifyMarketing === true
    }

    return false
  }

  async notifyOrderPlaced(order: Order): Promise<void> {
    try {
      const buyer = await userDb.findById(order.buyerId)
      if (!buyer) {
        console.error(`Order notification failed - buyer not found: ${order.buyerId}`)
        return
      }

      const sellerIds = new Set<string>()
      const products = await Promise.all(
        order.productIds.map(async (productId) => {
          const product = await productDb.findById(productId)
          if (product) {
            sellerIds.add(product.merchantId)
          }
          return product
        })
      )

      const validProducts = products.filter(Boolean) as Product[]

      for (const sellerId of sellerIds) {
        const seller = await userDb.findById(sellerId)
        if (!seller) {
          console.error(`Seller not found for notification: ${sellerId}`)
          continue
        }

        const sellerPlan = await planDb.get(sellerId)
        if (!await this.canSendEmail(seller, sellerPlan, 'transactional')) {
          continue
        }

        const sellerProducts = validProducts.filter(p => p.merchantId === sellerId)
        const itemCount = order.productIds.filter(id => 
          sellerProducts.some(p => p.id === id)
        ).length

        try {
          await emailService.sendTransactionalEmail(
            EMAIL_TEMPLATES.ORDER_NOTIFY_SELLER,
            { email: seller.email },
            {
              orderId: order.id,
              buyerEmail: buyer.email,
              totalPrice: order.totalPrice,
              itemCount,
              orderDate: order.createdAt,
              products: sellerProducts.map(p => p.name).join(', ')
            }
          )
          console.log(`Order notification sent to seller ${seller.email} for order ${order.id}`)
        } catch (error) {
          console.error(`Failed to send order notification to seller ${seller.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in notifyOrderPlaced:', error)
    }
  }

  async notifyOrderStatusUpdate(order: Order, oldStatus: string): Promise<void> {
    try {
      const buyer = await userDb.findById(order.buyerId)
      if (!buyer) {
        console.error(`Status update notification failed - buyer not found: ${order.buyerId}`)
        return
      }

      const buyerPlan = await planDb.get(order.buyerId)
      if (!await this.canSendEmail(buyer, buyerPlan, 'transactional')) {
        return
      }

      if (!buyer.notifyStatus) {
        console.log(`Skipped status update email - user ${buyer.id} has notifications disabled`)
        return
      }

      try {
        await emailService.sendTransactionalEmail(
          EMAIL_TEMPLATES.STATUS_NOTIFY_BUYER,
          { email: buyer.email },
          {
            orderId: order.id,
            status: order.status,
            oldStatus,
            totalPrice: order.totalPrice,
            trackingNumber: order.shipmentStatus
          }
        )
        console.log(`Status update notification sent to buyer ${buyer.email} for order ${order.id}`)
      } catch (error) {
        console.error(`Failed to send status update notification to buyer ${buyer.email}:`, error)
      }
    } catch (error) {
      console.error('Error in notifyOrderStatusUpdate:', error)
    }
  }

  async notifyNewSellerRegistration(seller: User): Promise<void> {
    try {
      const adminUsers = await userDb.getAll()
      const admins = adminUsers.filter(user => user.role === 'admin')

      for (const admin of admins) {
        const adminPlan = await planDb.get(admin.id)
        if (!await this.canSendEmail(admin, adminPlan, 'transactional')) {
          continue
        }

        try {
          await emailService.sendTransactionalEmail(
            EMAIL_TEMPLATES.ADMIN_ALERT_NEW_SELLER,
            { email: admin.email },
            {
              companyName: seller.email, 
              email: seller.email,
              registrationNumber: 'Pending verification',
              submittedAt: seller.createdAt
            }
          )
          console.log(`New seller notification sent to admin ${admin.email}`)
        } catch (error) {
          console.error(`Failed to send new seller notification to admin ${admin.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in notifyNewSellerRegistration:', error)
    }
  }

  async sendAbandonedCartReminder(userId: string): Promise<void> {
    try {
      const user = await userDb.findById(userId)
      if (!user) {
        console.error(`Abandoned cart reminder failed - user not found: ${userId}`)
        return
      }

      const plan = await planDb.get(userId)
      if (!await this.canSendEmail(user, plan, 'cart')) {
        return
      }

      if (user.cartNotifiedAt) {
        const lastNotified = new Date(user.cartNotifiedAt)
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
        if (lastNotified > twelveHoursAgo) {
          console.log(`Skipped cart reminder - already sent within 12 hours for user ${userId}`)
          return
        }
      }

      const cart = await cartDb.get(userId)
      if (!cart.items || cart.items.length === 0) {
        console.log(`Skipped cart reminder - empty cart for user ${userId}`)
        return
      }

      let totalValue = 0
      for (const item of cart.items) {
        const product = await productDb.findById(item.productId)
        if (product) {
          totalValue += product.price * item.quantity
        }
      }

      try {
        await emailService.sendTransactionalEmail(
          EMAIL_TEMPLATES.CART_REMINDER_BUYER,
          { email: user.email },
          {
            itemCount: cart.items.length,
            totalValue: totalValue.toFixed(2),
            cartUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`
          }
        )

        user.cartNotifiedAt = new Date().toISOString()
        await userDb.updateUser(user.email, { cartNotifiedAt: user.cartNotifiedAt })

        console.log(`Abandoned cart reminder sent to ${user.email}`)
      } catch (error) {
        console.error(`Failed to send abandoned cart reminder to ${user.email}:`, error)
      }
    } catch (error) {
      console.error('Error in sendAbandonedCartReminder:', error)
    }
  }

  async sendMarketingEmail(
    userId: string, 
    subject: string, 
    message: string, 
    htmlContent?: string
  ): Promise<void> {
    try {
      const user = await userDb.findById(userId)
      if (!user) {
        console.error(`Marketing email failed - user not found: ${userId}`)
        return
      }

      const plan = await planDb.get(userId)
      if (!await this.canSendEmail(user, plan, 'marketing')) {
        return
      }

      try {
        await emailService.sendTransactionalEmail(
          EMAIL_TEMPLATES.MARKETING_EMAIL,
          { email: user.email },
          {
            subject,
            message,
            html: htmlContent,
            title: subject
          }
        )
        console.log(`Marketing email sent to ${user.email}`)
      } catch (error) {
        console.error(`Failed to send marketing email to ${user.email}:`, error)
      }
    } catch (error) {
      console.error('Error in sendMarketingEmail:', error)
    }
  }

  async processAbandonedCarts(): Promise<void> {
    try {
      const abandonedCarts = await cartDb.getAbandonedCarts()
      console.log(`Processing ${abandonedCarts.length} abandoned carts`)

      for (const { userId } of abandonedCarts) {
        await this.sendAbandonedCartReminder(userId)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Error processing abandoned carts:', error)
    }
  }

  async testEmailConnection(): Promise<{ mailchimp: boolean; smtp: boolean }> {
    return await emailService.testConnection()
  }
}

export const notificationService = new NotificationService()
export default notificationService