
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { categoryDb } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await categoryDb.getAll()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to get categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, imageUrl } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await categoryDb.create({ name, description, imageUrl })
    return NextResponse.json({ category, message: 'Category created successfully' })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, description, imageUrl } = await request.json()
    
    await categoryDb.update(id, { name, description, imageUrl })
    return NextResponse.json({ message: 'Category updated successfully' })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()
    
    await categoryDb.archive(id)
    return NextResponse.json({ message: 'Category archived successfully' })
  } catch (error) {
    console.error('Failed to archive category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
