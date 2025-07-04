const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupProfilesTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Testing if profiles table exists...');
    
    // Try to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('relation "profiles" does not exist')) {
      console.log('❌ Profiles table does not exist. You need to create it manually in the Supabase dashboard.');
      console.log('📋 Here is the SQL to run in your Supabase SQL editor:');
      console.log(`
-- Add profiles table for Farcaster user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON profiles(fid);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (fid = auth.jwt() ->> 'sub'::integer);

-- Allow service role to manage all profiles (for sync-profiles API)
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
      `);
    } else if (error) {
      console.error('❌ Error testing profiles table:', error);
    } else {
      console.log('✅ Profiles table exists and is working!');
    }
    
  } catch (error) {
    console.error('❌ Error setting up profiles table:', error);
  }
}

setupProfilesTable(); 