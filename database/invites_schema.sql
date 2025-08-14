-- Invites and Friend Connection System Schema

-- Table to store invite codes and their usage
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  inviter_unified_user_id UUID NOT NULL,
  invitee_email VARCHAR(255),
  invitee_farcaster_fid INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP,
  accepted_by_unified_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table to store friend connections between users
CREATE TABLE IF NOT EXISTS friend_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_unified_id UUID NOT NULL,
  user2_unified_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  connected_via_invite_id UUID REFERENCES invites(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_unified_id, user2_unified_id)
);

-- Table to store user privacy settings
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID NOT NULL UNIQUE,
  share_sol_age_with_friends BOOLEAN DEFAULT true,
  share_archetype_with_friends BOOLEAN DEFAULT true,
  share_journal_entries_with_friends BOOLEAN DEFAULT false,
  share_milestones_with_friends BOOLEAN DEFAULT true,
  allow_friend_invites BOOLEAN DEFAULT true,
  discoverable_by_email BOOLEAN DEFAULT true,
  discoverable_by_farcaster BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invites_invite_code ON invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_invites_inviter ON invites(inviter_unified_user_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_friend_connections_user1 ON friend_connections(user1_unified_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_user2 ON friend_connections(user2_unified_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_status ON friend_connections(status);

CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(unified_user_id);

-- Row Level Security
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invites table
CREATE POLICY "Users can view their own invites" ON invites
  FOR SELECT USING (
    inviter_unified_user_id = auth.jwt() ->> 'sub'::uuid OR
    accepted_by_unified_user_id = auth.jwt() ->> 'sub'::uuid
  );

CREATE POLICY "Users can create invites" ON invites
  FOR INSERT WITH CHECK (
    inviter_unified_user_id = auth.jwt() ->> 'sub'::uuid
  );

CREATE POLICY "Users can update their own invites" ON invites
  FOR UPDATE USING (
    inviter_unified_user_id = auth.jwt() ->> 'sub'::uuid OR
    accepted_by_unified_user_id = auth.jwt() ->> 'sub'::uuid
  );

-- RLS Policies for friend_connections table
CREATE POLICY "Users can view their own friend connections" ON friend_connections
  FOR SELECT USING (
    user1_unified_id = auth.jwt() ->> 'sub'::uuid OR
    user2_unified_id = auth.jwt() ->> 'sub'::uuid
  );

CREATE POLICY "Users can create friend connections" ON friend_connections
  FOR INSERT WITH CHECK (
    user1_unified_id = auth.jwt() ->> 'sub'::uuid OR
    user2_unified_id = auth.jwt() ->> 'sub'::uuid
  );

CREATE POLICY "Users can update their own friend connections" ON friend_connections
  FOR UPDATE USING (
    user1_unified_id = auth.jwt() ->> 'sub'::uuid OR
    user2_unified_id = auth.jwt() ->> 'sub'::uuid
  );

-- RLS Policies for user_privacy_settings table
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
  FOR SELECT USING (
    unified_user_id = auth.jwt() ->> 'sub'::uuid
  );

CREATE POLICY "Users can manage their own privacy settings" ON user_privacy_settings
  FOR ALL USING (
    unified_user_id = auth.jwt() ->> 'sub'::uuid
  );

-- Service role can manage all invite data
CREATE POLICY "Service role can manage all invites" ON invites
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all friend connections" ON friend_connections
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all privacy settings" ON user_privacy_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM invites WHERE invite_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new invite
CREATE OR REPLACE FUNCTION create_invite(
  p_inviter_unified_user_id UUID,
  p_invitee_email VARCHAR(255) DEFAULT NULL,
  p_invitee_farcaster_fid INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  new_invite_code TEXT;
BEGIN
  -- Generate unique invite code
  new_invite_code := generate_invite_code();
  
  -- Create the invite
  INSERT INTO invites (
    invite_code, 
    inviter_unified_user_id, 
    invitee_email, 
    invitee_farcaster_fid
  )
  VALUES (
    new_invite_code, 
    p_inviter_unified_user_id, 
    p_invitee_email, 
    p_invitee_farcaster_fid
  );
  
  RETURN new_invite_code;
END;
$$ LANGUAGE plpgsql;

-- Function to accept an invite and create friend connection
CREATE OR REPLACE FUNCTION accept_invite(
  p_invite_code TEXT,
  p_accepting_unified_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
  connection_exists BOOLEAN;
BEGIN
  -- Get the invite record
  SELECT * INTO invite_record
  FROM invites
  WHERE invite_code = p_invite_code
    AND status = 'pending'
    AND expires_at > NOW();
  
  -- Check if invite exists and is valid
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if connection already exists
  SELECT EXISTS(
    SELECT 1 FROM friend_connections 
    WHERE (user1_unified_id = invite_record.inviter_unified_user_id AND user2_unified_id = p_accepting_unified_user_id)
       OR (user1_unified_id = p_accepting_unified_user_id AND user2_unified_id = invite_record.inviter_unified_user_id)
  ) INTO connection_exists;
  
  IF connection_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update invite status
  UPDATE invites 
  SET status = 'accepted', 
      accepted_at = NOW(), 
      accepted_by_unified_user_id = p_accepting_unified_user_id,
      updated_at = NOW()
  WHERE invite_code = p_invite_code;
  
  -- Create friend connection (always put smaller UUID first for consistency)
  INSERT INTO friend_connections (user1_unified_id, user2_unified_id, connected_via_invite_id)
  VALUES (
    LEAST(invite_record.inviter_unified_user_id, p_accepting_unified_user_id),
    GREATEST(invite_record.inviter_unified_user_id, p_accepting_unified_user_id),
    invite_record.id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get friends list for a user
CREATE OR REPLACE FUNCTION get_user_friends(p_unified_user_id UUID)
RETURNS TABLE(
  friend_unified_id UUID,
  email VARCHAR(255),
  farcaster_fid INTEGER,
  sol_age INTEGER,
  archetype VARCHAR(100),
  connected_at TIMESTAMP,
  can_see_sol_age BOOLEAN,
  can_see_archetype BOOLEAN,
  can_see_journal_entries BOOLEAN,
  can_see_milestones BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN fc.user1_unified_id = p_unified_user_id THEN fc.user2_unified_id
      ELSE fc.user1_unified_id
    END as friend_unified_id,
    ua.email,
    ua.farcaster_fid,
    CASE WHEN ups.share_sol_age_with_friends THEN ua.sol_age ELSE NULL END as sol_age,
    CASE WHEN ups.share_archetype_with_friends THEN ua.archetype ELSE NULL END as archetype,
    fc.created_at as connected_at,
    COALESCE(ups.share_sol_age_with_friends, true) as can_see_sol_age,
    COALESCE(ups.share_archetype_with_friends, true) as can_see_archetype,
    COALESCE(ups.share_journal_entries_with_friends, false) as can_see_journal_entries,
    COALESCE(ups.share_milestones_with_friends, true) as can_see_milestones
  FROM friend_connections fc
  JOIN user_identifiers ui ON (
    (fc.user1_unified_id = p_unified_user_id AND ui.unified_user_id = fc.user2_unified_id) OR
    (fc.user2_unified_id = p_unified_user_id AND ui.unified_user_id = fc.user1_unified_id)
  )
  JOIN user_accounts ua ON ui.identifier_value = ua.id::text AND ui.identifier_type = 'account_id'
  LEFT JOIN user_privacy_settings ups ON ups.unified_user_id = ui.unified_user_id
  WHERE fc.status = 'active'
    AND (fc.user1_unified_id = p_unified_user_id OR fc.user2_unified_id = p_unified_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to initialize default privacy settings for new users
CREATE OR REPLACE FUNCTION create_default_privacy_settings(p_unified_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_privacy_settings (unified_user_id)
  VALUES (p_unified_user_id)
  ON CONFLICT (unified_user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create privacy settings for new users
CREATE OR REPLACE FUNCTION trigger_create_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_privacy_settings(NEW.unified_user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_privacy_settings_on_user_identifier
  AFTER INSERT ON user_identifiers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_privacy_settings();