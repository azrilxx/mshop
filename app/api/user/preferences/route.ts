import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { userDb } from '@/lib/db'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      notifyOrder: user.notifyOrder ?? true,
      notifyStatus: user.notifyStatus ?? true,
      notifyMarketing: user.notifyMarketing ?? false,
      whatsappNumber: user.whatsappNumber ?? ''
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notifyOrder, notifyStatus, notifyMarketing, whatsappNumber } = await request.json()

    const updatedUser = await userDb.updateUser(user.email, {
      notifyOrder,
      notifyStatus,
      notifyMarketing,
      whatsappNumber
    })

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({ 
      notifyOrder: updatedUser.notifyOrder,
      notifyStatus: updatedUser.notifyStatus,
      notifyMarketing: updatedUser.notifyMarketing,
      whatsappNumber: updatedUser.whatsappNumber
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}