
import { NextRequest, NextResponse } from 'next/server'
import { quoteDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { productId, name, email, message } = await request.json()
    
    const user = await getUser()
    
    const quote = await quoteDb.create({
      productId,
      buyerId: user?.id,
      name,
      email,
      message
    })
    
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
