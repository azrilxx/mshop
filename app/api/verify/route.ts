import { NextRequest, NextResponse } from 'next/server'
import { verificationDb } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (user.role === 'admin') {
      // Admin can view all verifications
      const verifications = await verificationDb.getAll()
      return NextResponse.json(verifications)
    } else {
      // Users can only view their own verification
      const verification = await verificationDb.get(user.id)
      return NextResponse.json(verification)
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verification' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['seller'])
    const { registrationNumber, companyName, logoUrl, licenseUrl } = await request.json()

    if (!registrationNumber || !companyName) {
      return NextResponse.json(
        { error: 'Registration number and company name are required' },
        { status: 400 }
      )
    }

    // Check if verification already exists
    const existingVerification = await verificationDb.get(user.id)
    if (existingVerification) {
      return NextResponse.json(
        { error: 'Verification already submitted' },
        { status: 400 }
      )
    }

    const verification = await verificationDb.create({
      userId: user.id,
      registrationNumber,
      companyName,
      logoUrl,
      licenseUrl,
      status: 'pending'
    })

    return NextResponse.json(verification, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(['admin'])
    const { userId, status, adminNotes } = await request.json()

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const verification = await verificationDb.update(userId, {
      status,
      adminNotes
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(verification)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update verification' },
      { status: 500 }
    )
  }
}