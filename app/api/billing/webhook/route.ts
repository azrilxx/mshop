import { NextRequest, NextResponse } from 'next/server'
import { billingService } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    const result = await billingService.handleWebhook(body, signature)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Webhook processing failed:', error)
    
    // Return 400 for webhook signature verification failures
    if (error.message?.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Return 500 for other processing errors
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Next.js 14 App Router - body parsing is disabled by default for POST routes