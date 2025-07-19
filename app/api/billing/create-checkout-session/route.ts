import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { billingService } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planTier } = await request.json()

    if (!planTier || !['Standard', 'Premium'].includes(planTier)) {
      return NextResponse.json(
        { error: 'Valid plan tier is required (Standard or Premium)' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/seller/plan?success=true&plan=${planTier}`
    const cancelUrl = `${baseUrl}/seller/plan?canceled=true`

    const checkoutSession = await billingService.createCheckoutSession(
      session.user.id,
      planTier,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url
    })
  } catch (error: any) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}