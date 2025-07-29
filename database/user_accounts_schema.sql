-- User accounts table for non-Farcaster users
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) DEFAULT 'non_farcaster' CHECK (user_type IN ('farcaster', 'non_farcaster')),
  farcaster_fid INTEGER NULL, -- Only for Farcaster users who also create accounts
  platform VARCHAR(50) NOT NULL, -- platform where they originated (email, twitter, etc.)
  sol_age INTEGER,
  archetype VARCHAR(100),
  wallet_address VARCHAR(42),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User identifier mapping table to provide unified user identification
CREATE TABLE IF NOT EXISTS user_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID NOT NULL,
  identifier_type VARCHAR(20) NOT NULL CHECK (identifier_type IN ('farcaster_fid', 'account_id')),
  identifier_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(identifier_type, identifier_value)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_farcaster_fid ON user_accounts(farcaster_fid);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_unified_user_id ON user_identifiers(unified_user_id);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_lookup ON user_identifiers(identifier_type, identifier_value);

-- Row Level Security
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_identifiers ENABLE ROW LEVEL SECURITY;

-- Policies for user_accounts
CREATE POLICY "Users can view their own account" ON user_accounts
  FOR SELECT USING (
    id::text = auth.jwt() ->> 'sub' OR 
    farcaster_fid = (auth.jwt() ->> 'sub')::integer
  );

CREATE POLICY "Users can insert their own account" ON user_accounts
  FOR INSERT WITH CHECK (
    id::text = auth.jwt() ->> 'sub' OR 
    farcaster_fid = (auth.jwt() ->> 'sub')::integer
  );

CREATE POLICY "Users can update their own account" ON user_accounts
  FOR UPDATE USING (
    id::text = auth.jwt() ->> 'sub' OR 
    farcaster_fid = (auth.jwt() ->> 'sub')::integer
  );

-- Policies for user_identifiers
CREATE POLICY "Users can view their own identifiers" ON user_identifiers
  FOR SELECT USING (
    unified_user_id = auth.jwt() ->> 'sub'::uuid OR
    EXISTS (
      SELECT 1 FROM user_accounts ua 
      WHERE ua.id = unified_user_id 
      AND (ua.id::text = auth.jwt() ->> 'sub' OR ua.farcaster_fid = (auth.jwt() ->> 'sub')::integer)
    )
  );

-- Service role can manage all user data
CREATE POLICY "Service role can manage all user accounts" ON user_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user identifiers" ON user_identifiers
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get unified user ID from Farcaster FID
CREATE OR REPLACE FUNCTION get_unified_user_id_from_fid(farcaster_fid INTEGER)
RETURNS UUID AS $$
DECLARE
  result UUID;
BEGIN
  SELECT unified_user_id INTO result
  FROM user_identifiers
  WHERE identifier_type = 'farcaster_fid' 
  AND identifier_value = farcaster_fid::text;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get unified user ID from account ID
CREATE OR REPLACE FUNCTION get_unified_user_id_from_account(account_id UUID)
RETURNS UUID AS $$
DECLARE
  result UUID;
BEGIN
  SELECT unified_user_id INTO result
  FROM user_identifiers
  WHERE identifier_type = 'account_id' 
  AND identifier_value = account_id::text;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new user account with unified ID
CREATE OR REPLACE FUNCTION create_user_account_with_unified_id(
  p_email VARCHAR(255),
  p_platform VARCHAR(50),
  p_sol_age INTEGER DEFAULT NULL,
  p_archetype VARCHAR(100) DEFAULT NULL,
  p_farcaster_fid INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_account_id UUID;
  unified_id UUID;
BEGIN
  -- Generate a new unified user ID
  unified_id := gen_random_uuid();
  
  -- Create the user account
  INSERT INTO user_accounts (id, email, user_type, farcaster_fid, platform, sol_age, archetype)
  VALUES (
    gen_random_uuid(), 
    p_email, 
    CASE WHEN p_farcaster_fid IS NOT NULL THEN 'farcaster' ELSE 'non_farcaster' END,
    p_farcaster_fid, 
    p_platform, 
    p_sol_age, 
    p_archetype
  )
  RETURNING id INTO new_account_id;
  
  -- Create identifier mapping for account ID
  INSERT INTO user_identifiers (unified_user_id, identifier_type, identifier_value)
  VALUES (unified_id, 'account_id', new_account_id::text);
  
  -- Create identifier mapping for Farcaster FID if provided
  IF p_farcaster_fid IS NOT NULL THEN
    INSERT INTO user_identifiers (unified_user_id, identifier_type, identifier_value)
    VALUES (unified_id, 'farcaster_fid', p_farcaster_fid::text);
  END IF;
  
  RETURN unified_id;
END;
$$ LANGUAGE plpgsql;