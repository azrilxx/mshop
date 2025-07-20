
import { deleteSession } from '@/lib/auth'

export async function POST() {
  try {
    await deleteSession()
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
