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