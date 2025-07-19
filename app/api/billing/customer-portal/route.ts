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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/seller/plan`

    const portalUrl = await billingService.getCustomerPortalUrl(
      session.user.id,
      returnUrl
    )

    return NextResponse.json({ url: portalUrl })
  } catch (error: any) {
    console.error('Failed to create customer portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}