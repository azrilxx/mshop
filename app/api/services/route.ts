
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { serviceDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const services = await serviceDb.getAll()
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  
  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { serviceType, description, region, contact, tags } = body

    if (!serviceType || !description || !region || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const service = await serviceDb.create({
      title: serviceType,
      serviceType,
      description,
      region,
      contact,
      contactEmail: session.user.email,
      tags: tags || [],
      providerId: session.user.id,
      status: 'active'
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
