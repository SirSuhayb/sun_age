-- Roll Purchases Table
CREATE TABLE IF NOT EXISTS roll_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('fiat', 'usdc', 'solar')),
  amount DECIMAL(18,6) NOT NULL,
  currency TEXT NOT NULL,
  rolls_purchased INTEGER NOT NULL,
  transaction_hash TEXT,
  payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Distributions Table
CREATE TABLE IF NOT EXISTS token_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_address TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  claim_id TEXT,
  platform TEXT,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solar Earnings Table (for roll earnings)
CREATE TABLE IF NOT EXISTS solar_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  roll_id TEXT NOT NULL,
  solar_earned INTEGER NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  roll_title TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roll_purchases_user_id ON roll_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_roll_purchases_status ON roll_purchases(status);
CREATE INDEX IF NOT EXISTS idx_roll_purchases_created_at ON roll_purchases(created_at);

CREATE INDEX IF NOT EXISTS idx_token_distributions_recipient ON token_distributions(recipient_address);
CREATE INDEX IF NOT EXISTS idx_token_distributions_status ON token_distributions(status);
CREATE INDEX IF NOT EXISTS idx_token_distributions_claim_id ON token_distributions(claim_id);

CREATE INDEX IF NOT EXISTS idx_solar_earnings_user_id ON solar_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_solar_earnings_status ON solar_earnings(status);
CREATE INDEX IF NOT EXISTS idx_solar_earnings_created_at ON solar_earnings(created_at);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roll_purchases_updated_at 
  BEFORE UPDATE ON roll_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_distributions_updated_at 
  BEFORE UPDATE ON token_distributions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 