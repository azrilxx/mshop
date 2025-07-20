
import { supabase } from '../lib/supabase'

async function fixInfiniteRecursion() {
  console.log('🔧 Fixing infinite recursion in RLS policies...')
  
  try {
    // First, drop the problematic policy that causes infinite recursion
    console.log('1. Dropping problematic policy...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Public profiles for active users" ON public.profiles;`
    })
    
    if (dropError) {
      console.error('Error dropping policy:', dropError)
    } else {
      console.log('✅ Dropped problematic policy')
    }
    
    // Enable RLS on all tables
    console.log('2. Enabling RLS on all tables...')
    const tables = ['profiles', 'products', 'orders', 'ads', 'ratings', 'storefronts', 'subscriptions']
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
      })
      
      if (error && !error.message.includes('already enabled')) {
        console.error(`Error enabling RLS on ${table}:`, error)
      } else {
        console.log(`✅ RLS enabled on ${table}`)
      }
    }
    
    // Create a safe profile viewing policy
    console.log('3. Creating safe profile policy...')
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Public profiles for active users" ON public.profiles
        FOR SELECT USING (status = 'active' AND role IN ('seller', 'buyer'));
      `
    })
    
    if (policyError) {
      console.error('Error creating safe policy:', policyError)
    } else {
      console.log('✅ Created safe profile policy')
    }
    
    // Test the fix
    console.log('4. Testing the fix...')
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test failed:', testError)
      return false
    } else {
      console.log('✅ Test passed - no infinite recursion!')
      return true
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    return false
  }
}

// Execute if run directly
if (require.main === module) {
  fixInfiniteRecursion()
    .then((success) => {
      if (success) {
        console.log('🎉 Infinite recursion fixed successfully!')
        process.exit(0)
      } else {
        console.log('❌ Failed to fix infinite recursion')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { fixInfiniteRecursion }
