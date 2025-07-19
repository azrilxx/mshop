
import { promises as fs } from 'fs'
import path from 'path'

export async function uploadFile(file: File, type: 'certification' | 'image'): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Create filename with timestamp to avoid conflicts
  const timestamp = Date.now()
  const extension = path.extname(file.name)
  const filename = `${type}_${timestamp}${extension}`
  
  // Define upload directory
  const uploadDir = path.join(process.cwd(), 'attached_assets', type + 's')
  
  // Ensure directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
  
  // Write file
  const filePath = path.join(uploadDir, filename)
  await fs.writeFile(filePath, buffer)
  
  // Return public URL
  return `/attached_assets/${type}s/${filename}`
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => file.type.includes(type))
}

export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}
