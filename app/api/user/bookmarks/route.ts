
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userDb } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await userDb.addBookmark(session.user.id, productId)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Add bookmark error:', error)
    return NextResponse.json(
      { error: 'Failed to add bookmark' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await userDb.removeBookmark(session.user.id, productId)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Remove bookmark error:', error)
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}
