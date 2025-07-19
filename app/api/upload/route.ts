
import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, validateFileType, validateFileSize } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = type === 'certification' 
      ? ['pdf', 'jpg', 'jpeg', 'png']
      : ['jpg', 'jpeg', 'png', 'webp']
    
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    // Validate file size (5MB max)
    if (!validateFileSize(file, 5)) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }
    
    const url = await uploadFile(file, type as 'certification' | 'image')
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
