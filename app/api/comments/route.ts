import { NextRequest, NextResponse } from 'next/server'
import { commentDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const comments = await commentDb.getByProduct(productId)
    return NextResponse.json(comments)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { productId, content, parentId, isReply } = await request.json()

    if (!productId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Product ID and content are required' },
        { status: 400 }
      )
    }

    const comment = await commentDb.create({
      productId,
      userId: user.id,
      parentId: parentId || undefined,
      content: content.trim(),
      isReply: Boolean(isReply)
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { commentId, content } = await request.json()

    if (!commentId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment ID and content are required' },
        { status: 400 }
      )
    }

    // TODO: Add ownership check - only comment author should be able to edit
    const updatedComment = await commentDb.update(commentId, {
      content: content.trim()
    })

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedComment)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // TODO: Add ownership check - only comment author or admin should be able to delete
    const deleted = await commentDb.delete(commentId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}