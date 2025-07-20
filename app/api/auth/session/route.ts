
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (session) {
      return Response.json({ user: session.user })
    } else {
      return Response.json({ user: null }, { status: 401 })
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
