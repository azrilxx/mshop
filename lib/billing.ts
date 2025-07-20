import Stripe from 'stripe'
import { userDb, planDb } from './db'
import { emailService, EMAIL_TEMPLATES } from './mailchimp'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export interface PlanConfig {
  name: string
  price: number
  priceId: string
  maxProducts: number
  maxAdSlots: number
  customerSupport: boolean
  features: string[]
}

export const PLAN_CONFIGS: Record<'Free' | 'Standard' | 'Premium', PlanConfig> = {
  Free: {
    name: 'Free Plan',
    price: 0,
    priceId: '',
    maxProducts: 20,
    maxAdSlots: 0,
    customerSupport: false,
    features: ['Up to 20 products', 'Basic listing', 'Email notifications']
  },
  Standard: {
    name: 'Standard Plan',
    price: 29,
    priceId: process.env.STRIPE_STANDARD_PRICE_ID || 'price_standard',
    maxProducts: 60,
    maxAdSlots: 12,
    customerSupport: true,
    features: ['Up to 60 products', '12 ad slots', 'Priority support', 'Cart reminders']
  },
  Premium: {
    name: 'Premium Plan',
    price: 99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    maxProducts: -1,
    maxAdSlots: -1,
    customerSupport: true,
    features: ['Unlimited products', 'Unlimited ads', 'Premium support', 'Marketing emails', 'Advanced analytics']
  }
}

export class BillingService {
  
  async createCheckoutSession(
    userId: string,
    planTier: 'Standard' | 'Premium',
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const user = await userDb.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const planConfig = PLAN_CONFIGS[planTier]
      if (!planConfig.priceId) {
        throw new Error(`Price ID not configured for ${planTier} plan`)
      }

      // Create or retrieve Stripe customer
      let customerId = await this.getStripeCustomerId(userId)
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId
          }
        })
        customerId = customer.id
        await this.saveStripeCustomerId(userId, customerId)
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: planConfig.priceId,
            quantity: 1
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          planTier: planTier
        }
      })

      if (!session.url) {
        throw new Error('Failed to create checkout session URL')
      }

      return {
        sessionId: session.id,
        url: session.url
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      throw error
    }
  }

  async handleWebhook(
    body: string,
    signature: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured')
      }

      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSubscriptionSuccess(event.data.object as Stripe.Checkout.Session)
          break
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
          break
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { success: true, message: 'Webhook processed successfully' }
    } catch (error) {
      console.error('Webhook processing failed:', error)
      throw error
    }
  }

  private async handleSubscriptionSuccess(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const userId = session.metadata?.userId
      const planTier = session.metadata?.planTier as 'Standard' | 'Premium'

      if (!userId || !planTier) {
        console.error('Missing metadata in checkout session:', session.id)
        return
      }

      const user = await userDb.findById(userId)
      if (!user) {
        console.error('User not found for subscription:', userId)
        return
      }

      // Update user's plan
      await planDb.update(userId, { 
        tier: planTier,
        ...PLAN_CONFIGS[planTier]
      })

      // Send confirmation email
      try {
        await emailService.sendTransactionalEmail(
          EMAIL_TEMPLATES.ORDER_NOTIFY_SELLER, // Reusing template for simplicity
          { email: user.email },
          {
            orderId: `PLAN-${planTier}`,
            buyerEmail: user.email,
            totalPrice: PLAN_CONFIGS[planTier].price,
            itemCount: 1,
            orderDate: new Date().toISOString(),
            products: `${planTier} Subscription Plan`
          }
        )
      } catch (emailError) {
        console.error('Failed to send plan upgrade confirmation email:', emailError)
      }

      console.log(`Successfully upgraded user ${userId} to ${planTier} plan`)
    } catch (error) {
      console.error('Failed to process subscription success:', error)
    }
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    try {
      const customerId = subscription.customer as string
      const userId = await this.getUserIdByCustomerId(customerId)
      
      if (userId) {
        // Downgrade to Free plan
        await planDb.update(userId, { 
          tier: 'Free',
          ...PLAN_CONFIGS.Free
        })
        console.log(`Downgraded user ${userId} to Free plan`)
      }
    } catch (error) {
      console.error('Failed to process subscription cancellation:', error)
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string
      const userId = await this.getUserIdByCustomerId(customerId)
      
      if (userId) {
        const user = await userDb.findById(userId)
        if (user) {
          // Send payment failed notification
          console.log(`Payment failed for user ${userId}, subscription may be canceled soon`)
        }
      }
    } catch (error) {
      console.error('Failed to process payment failure:', error)
    }
  }

  async getStripeCustomerId(userId: string): Promise<string | null> {
    try {
      const result = await planDb.get(userId)
      return (result as any).stripeCustomerId || null
    } catch (error) {
      console.error('Failed to get Stripe customer ID:', error)
      return null
    }
  }

  private async saveStripeCustomerId(userId: string, customerId: string): Promise<void> {
    try {
      await planDb.update(userId, { stripeCustomerId: customerId } as any)
    } catch (error) {
      console.error('Failed to save Stripe customer ID:', error)
    }
  }

  private async getUserIdByCustomerId(customerId: string): Promise<string | null> {
    try {
      // This is a simplified approach - in production you'd want a proper index
      const users = await userDb.getAll()
      for (const user of users) {
        const plan = await planDb.get(user.id)
        if ((plan as any).stripeCustomerId === customerId) {
          return user.id
        }
      }
      return null
    } catch (error) {
      console.error('Failed to find user by customer ID:', error)
      return null
    }
  }

  async getCustomerPortalUrl(userId: string, returnUrl: string): Promise<string> {
    try {
      const customerId = await this.getStripeCustomerId(userId)
      if (!customerId) {
        throw new Error('No Stripe customer found for user')
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      })

      return session.url
    } catch (error) {
      console.error('Failed to create customer portal session:', error)
      throw error
    }
  }

  async getSubscriptionStatus(userId: string): Promise<{
    status: string | null
    planTier: 'Free' | 'Standard' | 'Premium'
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: Date | null
  }> {
    try {
      const plan = await planDb.get(userId)
      const customerId = await this.getStripeCustomerId(userId)
      
      if (!customerId || plan.tier === 'Free') {
        return {
          status: null,
          planTier: plan.tier,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null
        }
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1
      })

      const subscription = subscriptions.data[0]
      if (!subscription) {
        return {
          status: null,
          planTier: plan.tier,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null
        }
      }

      return {
        status: subscription.status,
        planTier: plan.tier,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
      }
    } catch (error) {
      console.error('Failed to get subscription status:', error)
      throw error
    }
  }
}

export const billingService = new BillingService()
export default billingService