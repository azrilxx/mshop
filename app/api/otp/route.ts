import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/otp'
import { userDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { action, userId, userEmail, otp } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'generate':
        if (!userId || !userEmail) {
          return NextResponse.json(
            { error: 'User ID and email are required' },
            { status: 400 }
          )
        }

        const user = await userDb.findById(userId)
        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        const generateResult = await otpService.generateOtp(userId, userEmail)
        return NextResponse.json(generateResult)

      case 'verify':
        if (!userId || !otp) {
          return NextResponse.json(
            { error: 'User ID and OTP are required' },
            { status: 400 }
          )
        }

        const verifyResult = await otpService.verifyOtp(userId, otp)
        return NextResponse.json(verifyResult)

      case 'resend':
        if (!userId || !userEmail) {
          return NextResponse.json(
            { error: 'User ID and email are required' },
            { status: 400 }
          )
        }

        const resendResult = await otpService.resendOtp(userId, userEmail)
        return NextResponse.json(resendResult)

      case 'status':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }

        const status = await otpService.getOtpStatus(userId)
        return NextResponse.json({ status })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: generate, verify, resend, status' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error in OTP API:', error)
    return NextResponse.json(
      { error: error.message || 'OTP operation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const status = await otpService.getOtpStatus(userId)
    return NextResponse.json({ status })
  } catch (error: any) {
    console.error('Error fetching OTP status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch OTP status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await otpService.deleteOtp(userId)
    return NextResponse.json({ message: 'OTP deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete OTP' },
      { status: 500 }
    )
  }
}