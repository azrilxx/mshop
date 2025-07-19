#!/usr/bin/env ts-node

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import Database from '@replit/database'

const db = new Database()

interface ExportManifest {
  exportedAt: string
  dbSnapshot: {
    keyCount: number
    keys: string[]
  }
  envVariables: {
    required: string[]
    optional: string[]
  }
  version: string
}

async function exportForDeployment() {
  try {
    console.log('🚀 Starting mshop deployment export...')
    
    // Create export directory
    const exportDir = path.join(process.cwd(), 'deploy-export')
    if (fs.existsSync(exportDir)) {
      fs.rmSync(exportDir, { recursive: true })
    }
    fs.mkdirSync(exportDir, { recursive: true })

    // 1. Snapshot Replit DB
    console.log('📊 Creating database snapshot...')
    const dbSnapshot = await createDatabaseSnapshot()
    
    // 2. Create .env.example from .env.local
    console.log('⚙️ Creating environment template...')
    await createEnvExample()
    
    // 3. Copy source files
    console.log('📁 Copying source files...')
    await copySourceFiles(exportDir)
    
    // 4. Create deployment manifest
    console.log('📋 Creating deployment manifest...')
    const manifest = await createManifest(dbSnapshot)
    fs.writeFileSync(
      path.join(exportDir, 'deploy-manifest.json'),
      JSON.stringify(manifest, null, 2)
    )
    
    // 5. Create ZIP archive
    console.log('📦 Creating deployment archive...')
    const zipPath = await createDeploymentZip(exportDir)
    
    console.log('✅ Export completed successfully!')
    console.log(`📦 Archive: ${zipPath}`)
    console.log(`📊 DB Keys: ${dbSnapshot.keyCount}`)
    console.log('🔗 Repository: https://github.com/azril/mshop')
    
  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

async function createDatabaseSnapshot(): Promise<{ keyCount: number; keys: string[] }> {
  try {
    const allKeys = await db.list()
    const snapshot: Record<string, any> = {}
    
    for (const key of allKeys) {
      try {
        const value = await db.get(key)
        snapshot[key] = value
      } catch (error) {
        console.warn(`Failed to export key ${key}:`, error)
      }
    }
    
    // Write snapshot to file
    const snapshotPath = path.join(process.cwd(), 'deploy-export', 'db-snapshot.json')
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2))
    
    return {
      keyCount: allKeys.length,
      keys: allKeys
    }
  } catch (error) {
    console.error('Failed to create database snapshot:', error)
    return { keyCount: 0, keys: [] }
  }
}

async function createEnvExample(): Promise<void> {
  const envLocalPath = path.join(process.cwd(), '.env.local')
  const envExamplePath = path.join(process.cwd(), 'deploy-export', '.env.example')
  
  if (!fs.existsSync(envLocalPath)) {
    console.warn('⚠️ .env.local not found, creating template...')
    const envTemplate = `# Database
REPLIT_DB_URL=your_replit_db_url_here

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_STANDARD_PRICE_ID=price_your_standard_price_id
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id

# Email Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=your_server_prefix
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Marketplace

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your_very_secure_jwt_secret_here
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# OTP Configuration
OTP_SECRET=your_otp_secret_here
`
    fs.writeFileSync(envExamplePath, envTemplate)
    return
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const envExample = envContent
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('#') || !line.includes('=')) {
        return line
      }
      const [key, ] = line.split('=')
      return `${key}=your_${key.toLowerCase()}_here`
    })
    .join('\n')
  
  fs.writeFileSync(envExamplePath, envExample)
}

async function copySourceFiles(exportDir: string): Promise<void> {
  const filesToCopy = [
    'app',
    'components', 
    'lib',
    'styles',
    'middleware.ts',
    'next.config.js',
    'package.json',
    'package-lock.json',
    'tailwind.config.js',
    'tsconfig.json',
    'postcss.config.js',
    'README.md',
    '.replit',
    'scripts'
  ]
  
  for (const item of filesToCopy) {
    const srcPath = path.join(process.cwd(), item)
    const destPath = path.join(exportDir, item)
    
    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        execSync(`cp -r "${srcPath}" "${destPath}"`)
      } else {
        execSync(`cp "${srcPath}" "${destPath}"`)
      }
    }
  }
}

async function createManifest(dbSnapshot: { keyCount: number; keys: string[] }): Promise<ExportManifest> {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  return {
    exportedAt: new Date().toISOString(),
    dbSnapshot,
    envVariables: {
      required: [
        'REPLIT_DB_URL',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'JWT_SECRET',
        'NEXT_PUBLIC_APP_URL'
      ],
      optional: [
        'MAILCHIMP_API_KEY',
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASS',
        'STRIPE_WEBHOOK_SECRET'
      ]
    },
    version: packageJson.version || '1.0.0'
  }
}

async function createDeploymentZip(exportDir: string): Promise<string> {
  const zipPath = path.join(process.cwd(), 'mshop-deploy.zip')
  
  // Remove existing zip
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath)
  }
  
  // Create new zip
  try {
    execSync(`cd "${exportDir}" && zip -r "../mshop-deploy.zip" .`, { stdio: 'inherit' })
  } catch (error) {
    // Fallback for systems without zip
    console.warn('⚠️ zip command not found, creating tar.gz instead...')
    execSync(`cd "${exportDir}" && tar -czf "../mshop-deploy.tar.gz" .`, { stdio: 'inherit' })
    return path.join(process.cwd(), 'mshop-deploy.tar.gz')
  }
  
  return zipPath
}

// Run if called directly
if (require.main === module) {
  exportForDeployment()
}

export { exportForDeployment }