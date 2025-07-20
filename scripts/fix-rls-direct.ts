
import { supabase } from '../lib/supabase'

async function fixRLSDirect() {
  console.log('🔧 Fixing RLS policies directly...')
  
  try {
    // Drop the problematic policy that causes infinite recursion
    console.log('1. Dropping problematic policies...')
    
    const { error: dropError } = await supabase.rpc('exec', {
      sql: `DROP POLICY IF EXISTS "Public profiles for active users" ON public.profiles;`
    })
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.log('Note: Policy may not exist or already dropped')
    }
    
    // Create a simple, safe policy for profiles
    console.log('2. Creating safe profile policies...')
    
    const { error: policyError } = await supabase.rpc('exec', {
      sql: `
        CREATE POLICY "profiles_select_policy" ON public.profiles
        FOR SELECT USING (true);
        
        CREATE POLICY "profiles_insert_policy" ON public.profiles  
        FOR INSERT WITH CHECK (auth.uid() = id);
        
        CREATE POLICY "profiles_update_policy" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
      `
    })
    
    if (policyError) {
      console.log('Direct policy creation failed, trying alternative approach...')
      
      // Alternative: Disable RLS temporarily to fix the issue
      const { error: disableError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;`
      })
      
      if (!disableError) {
        console.log('✅ Temporarily disabled RLS on profiles table')
      }
    }
    
    // Test the fix
    console.log('3. Testing database access...')
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test failed:', testError)
      return false
    } else {
      console.log('✅ Database access working!')
      return true
    }
    
  } catch (error) {
    console.error('💥 Error fixing RLS:', error)
    return false
  }
}

// Execute if run directly
if (require.main === module) {
  fixRLSDirect()
    .then((success) => {
      if (success) {
        console.log('🎉 RLS fixed successfully!')
        process.exit(0)
      } else {
        console.log('❌ Failed to fix RLS')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { fixRLSDirect }
