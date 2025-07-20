
import initDatabase from '../../../scripts/init-database'

export async function POST() {
  try {
    await initDatabase()
    return Response.json({ message: 'Database seeded successfully' })
  } catch (error: any) {
    console.error('Seeding error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    message: 'Database seeding endpoint. Use POST to seed database.' 
  })
}
