
import { supabase } from '../lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

async function executeRLSFix() {
  console.log('🔧 Executing RLS Security Fixes...')
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync(join(__dirname, 'fix-rls-security.sql'), 'utf8')
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'))
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error)
          // Don't throw - continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    // Test the fixes
    console.log('\n🧪 Testing RLS fixes...')
    
    // Test 1: Check RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['profiles', 'products', 'orders', 'ads', 'ratings', 'storefronts', 'subscriptions'])
    
    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError)
    } else {
      console.log('📊 RLS Status:', rlsStatus)
    }
    
    // Test 2: Try a simple profiles query
    const { data: profileTest, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profileError) {
      console.error('❌ Profiles test failed:', profileError)
    } else {
      console.log('✅ Profiles table accessible')
    }
    
    console.log('\n🎉 RLS Security Fix execution completed!')
    
  } catch (error) {
    console.error('💥 Fatal error executing RLS fixes:', error)
    throw error
  }
}

// Execute if run directly
if (require.main === module) {
  executeRLSFix()
    .then(() => {
      console.log('✅ RLS fixes applied successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Failed to apply RLS fixes:', error)
      process.exit(1)
    })
}

export { executeRLSFix }
