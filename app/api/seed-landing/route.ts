
import { NextRequest, NextResponse } from 'next/server'
import { seedLandingData } from '@/scripts/seed-landing-data'
import { landingDb } from '@/lib/landingDb'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual seeding triggered via API...')
    const result = await seedLandingData()
    
    return NextResponse.json({
      success: true,
      message: 'Landing data seeded successfully',
      data: result
    })
  } catch (error) {
    console.error('❌ API seeding failed:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const [heroSection, ctaSection, categories, products] = await Promise.all([
      landingDb.getHeroSection(),
      landingDb.getCTASection(), 
      landingDb.getCategories(),
      landingDb.getFeaturedProducts()
    ])

    return NextResponse.json({
      success: true,
      data: {
        heroSection,
        ctaSection,
        categoriesCount: categories.length,
        productsCount: products.length,
        sampleCategories: categories.slice(0, 3),
        sampleProducts: products.slice(0, 3)
      }
    })
  } catch (error) {
    console.error('❌ Failed to get landing data:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
