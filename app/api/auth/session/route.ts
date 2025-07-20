
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const session = await getSession(token)

    return NextResponse.json({
      success: true,
      user: session.user,
      authenticated: !!session.user
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        authenticated: false,
        user: null
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    const session = await getSession(token)

    return NextResponse.json({
      success: true,
      user: session.user,
      authenticated: !!session.user
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        authenticated: false,
        user: null
      },
      { status: 500 }
    )
  }
}
