
import { NextResponse } from 'next/server'
import { initDatabase } from '@/scripts/init-database'

export async function POST() {
  try {
    console.log('🌱 Starting database seeding...')
    const result = await initDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Seeding error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to seed database',
        details: error
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database seeding endpoint. Use POST to seed the database.',
    usage: 'POST /api/seed-database'
  })
}
