-- Affiliate Tracking Database Schema for Solara
-- This schema extends the existing database to support comprehensive affiliate tracking
-- for content sharing, revenue attribution, and SOLAR token distribution

-- ==========================================
-- 1. CONTENT AFFILIATE TRACKING
-- ==========================================

-- Main table for tracking content shares and their affiliate performance
CREATE TABLE IF NOT EXISTS content_affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  share_id UUID REFERENCES journal_shares(id) ON DELETE CASCADE,
  creator_fid INTEGER NOT NULL,
  referral_code VARCHAR(12) UNIQUE NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('journal', 'wisdom', 'guidance', 'activity', 'solage')),
  
  -- Share details
  share_url TEXT NOT NULL,
  share_title TEXT,
  share_description TEXT,
  original_content_id UUID, -- References various content tables
  
  -- Attribution metrics
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue DECIMAL(18,6) DEFAULT 0,
  
  -- Affiliate earnings
  total_affiliate_earnings DECIMAL(18,6) DEFAULT 0,
  commission_rate DECIMAL(5,4) DEFAULT 0.10, -- 10% default
  attribution_window_days INTEGER DEFAULT 30,
  
  -- Creator tier and bonuses
  creator_tier VARCHAR(20) DEFAULT 'emerging' CHECK (creator_tier IN ('emerging', 'rising', 'established', 'influential', 'legendary')),
  tier_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Status and timing
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attributed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(share_id, creator_fid)
);

-- ==========================================
-- 2. AFFILIATE ATTRIBUTION EVENTS
-- ==========================================

-- Detailed tracking of each attribution event (visits, signups, purchases)
CREATE TABLE IF NOT EXISTS affiliate_attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tracking reference
  tracking_id UUID REFERENCES content_affiliate_tracking(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('visit', 'signup', 'purchase', 'subscription', 'roll_purchase')),
  
  -- Event details
  visitor_identifier TEXT, -- Hashed IP or anonymous ID for privacy
  session_id TEXT, -- Track user sessions
  attributed_user_fid INTEGER, -- If user signs up/makes account
  purchase_id UUID, -- References roll_purchases.id or future subscription table
  
  -- Revenue and commission information
  revenue_amount DECIMAL(18,6),
  commission_earned DECIMAL(18,6),
  currency VARCHAR(10),
  solar_tokens_earned INTEGER, -- SOLAR token equivalent
  
  -- Technical tracking details
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  ip_address_hash TEXT, -- Hashed for privacy
  device_fingerprint TEXT,
  
  -- Geolocation (for fraud detection)
  country_code VARCHAR(2),
  region TEXT,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. AFFILIATE PAYOUTS
-- ==========================================

-- Track SOLAR token payouts to affiliates
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Affiliate information
  affiliate_fid INTEGER NOT NULL,
  affiliate_wallet_address VARCHAR(42), -- Ethereum wallet address
  
  -- Payout period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Earnings breakdown
  total_earnings_usd DECIMAL(18,6) NOT NULL,
  total_earnings_solar INTEGER NOT NULL, -- SOLAR tokens (18 decimals in contract)
  
  -- Revenue source breakdown
  subscription_earnings DECIMAL(18,6) DEFAULT 0,
  roll_purchase_earnings DECIMAL(18,6) DEFAULT 0,
  affiliate_product_earnings DECIMAL(18,6) DEFAULT 0,
  bonus_earnings DECIMAL(18,6) DEFAULT 0,
  
  -- Payment processing
  payout_method VARCHAR(20) NOT NULL CHECK (payout_method IN ('solar_tokens', 'stripe_transfer', 'manual', 'pending_wallet')),
  transaction_hash TEXT, -- Blockchain transaction hash
  stripe_transfer_id TEXT, -- Stripe Connect transfer ID
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Security and compliance
  security_review_required BOOLEAN DEFAULT FALSE,
  security_review_completed_at TIMESTAMP WITH TIME ZONE,
  security_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. CREATOR TIER SYSTEM
-- ==========================================

-- Track creator performance and tier progression
CREATE TABLE IF NOT EXISTS creator_tier_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Creator identification
  creator_fid INTEGER NOT NULL UNIQUE,
  
  -- Current tier status
  current_tier VARCHAR(20) NOT NULL DEFAULT 'emerging' CHECK (current_tier IN ('emerging', 'rising', 'established', 'influential', 'legendary')),
  tier_achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Performance metrics
  total_lifetime_earnings DECIMAL(18,6) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  total_content_shares INTEGER DEFAULT 0,
  total_revenue_generated DECIMAL(18,6) DEFAULT 0,
  
  -- Monthly performance (rolling 30 days)
  monthly_earnings DECIMAL(18,6) DEFAULT 0,
  monthly_referrals INTEGER DEFAULT 0,
  monthly_revenue_generated DECIMAL(18,6) DEFAULT 0,
  
  -- Quality metrics
  average_conversion_rate DECIMAL(5,4) DEFAULT 0, -- 0.0000 to 1.0000
  average_click_through_rate DECIMAL(5,4) DEFAULT 0,
  content_quality_score DECIMAL(3,2) DEFAULT 0, -- 0.00 to 1.00
  
  -- Streak and consistency
  consecutive_active_months INTEGER DEFAULT 0,
  last_active_month DATE,
  
  -- Next tier requirements
  next_tier VARCHAR(20),
  progress_to_next_tier DECIMAL(5,4) DEFAULT 0, -- 0.0000 to 1.0000
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. AFFILIATE ACHIEVEMENTS
-- ==========================================

-- Track special achievements and milestone rewards
CREATE TABLE IF NOT EXISTS affiliate_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Creator and achievement details
  creator_fid INTEGER NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT,
  
  -- Reward information
  solar_reward INTEGER DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Achievement metadata
  triggered_by_event_id UUID, -- References specific attribution event
  milestone_value INTEGER, -- The value that triggered the achievement (e.g., 10 for "10 referrals")
  
  -- Status
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. FRAUD DETECTION AND SECURITY
-- ==========================================

-- Track suspicious activities and fraud indicators
CREATE TABLE IF NOT EXISTS affiliate_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Subject of security event
  creator_fid INTEGER,
  tracking_id UUID REFERENCES content_affiliate_tracking(id),
  event_id UUID REFERENCES affiliate_attribution_events(id),
  
  -- Security event details
  event_type VARCHAR(50) NOT NULL, -- 'velocity_violation', 'click_farm_detected', 'unusual_pattern', etc.
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  
  -- Detection details
  detection_method VARCHAR(50), -- 'automated', 'manual_review', 'user_report'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Risk factors
  risk_factors JSONB, -- Store detailed risk analysis
  
  -- Resolution
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'false_positive')),
  reviewed_by TEXT, -- Admin user who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_action VARCHAR(50), -- 'no_action', 'warning', 'temporary_suspension', 'permanent_ban'
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. REVENUE DISTRIBUTION SETTINGS
-- ==========================================

-- Global settings for revenue distribution and commission rates
CREATE TABLE IF NOT EXISTS affiliate_revenue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Setting identification
  setting_name VARCHAR(100) NOT NULL UNIQUE,
  setting_category VARCHAR(50) NOT NULL, -- 'commission_rates', 'thresholds', 'security', etc.
  
  -- Setting values
  setting_value_decimal DECIMAL(18,6),
  setting_value_integer INTEGER,
  setting_value_text TEXT,
  setting_value_boolean BOOLEAN,
  
  -- Metadata
  description TEXT,
  applies_to VARCHAR(50), -- 'all', 'tier_specific', 'content_type_specific'
  tier_filter VARCHAR(20),
  content_type_filter VARCHAR(20),
  
  -- Versioning
  version INTEGER DEFAULT 1,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_until TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. PLATFORM REVENUE TRACKING
-- ==========================================

-- Track all platform revenue for affiliate attribution calculations
CREATE TABLE IF NOT EXISTS platform_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Revenue source
  user_fid INTEGER,
  revenue_type VARCHAR(30) NOT NULL CHECK (revenue_type IN ('subscription', 'roll_purchase', 'affiliate_commission', 'premium_feature')),
  source_reference_id UUID, -- References the specific purchase/subscription
  
  -- Revenue details
  gross_revenue DECIMAL(18,6) NOT NULL,
  net_revenue DECIMAL(18,6) NOT NULL, -- After payment processing fees
  currency VARCHAR(10) NOT NULL,
  
  -- Attribution eligibility
  attributable_to_affiliate BOOLEAN DEFAULT TRUE,
  attribution_window_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing status
  attributed BOOLEAN DEFAULT FALSE,
  attributed_at TIMESTAMP WITH TIME ZONE,
  total_attributed_amount DECIMAL(18,6) DEFAULT 0,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 9. INDEXES FOR PERFORMANCE
-- ==========================================

-- Content Affiliate Tracking indexes
CREATE INDEX IF NOT EXISTS idx_content_affiliate_tracking_creator_fid ON content_affiliate_tracking(creator_fid);
CREATE INDEX IF NOT EXISTS idx_content_affiliate_tracking_referral_code ON content_affiliate_tracking(referral_code);
CREATE INDEX IF NOT EXISTS idx_content_affiliate_tracking_share_id ON content_affiliate_tracking(share_id);
CREATE INDEX IF NOT EXISTS idx_content_affiliate_tracking_status ON content_affiliate_tracking(status);
CREATE INDEX IF NOT EXISTS idx_content_affiliate_tracking_created_at ON content_affiliate_tracking(created_at);

-- Attribution Events indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_attribution_events_tracking_id ON affiliate_attribution_events(tracking_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_attribution_events_event_type ON affiliate_attribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_attribution_events_attributed_user_fid ON affiliate_attribution_events(attributed_user_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_attribution_events_created_at ON affiliate_attribution_events(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_attribution_events_visitor_identifier ON affiliate_attribution_events(visitor_identifier);

-- Affiliate Payouts indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_fid ON affiliate_payouts(affiliate_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_period ON affiliate_payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_transaction_hash ON affiliate_payouts(transaction_hash);

-- Creator Tier Progression indexes
CREATE INDEX IF NOT EXISTS idx_creator_tier_progression_creator_fid ON creator_tier_progression(creator_fid);
CREATE INDEX IF NOT EXISTS idx_creator_tier_progression_current_tier ON creator_tier_progression(current_tier);
CREATE INDEX IF NOT EXISTS idx_creator_tier_progression_earnings ON creator_tier_progression(total_lifetime_earnings);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_achievements_creator_fid ON affiliate_achievements(creator_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_achievements_type ON affiliate_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_achievements_claimed ON affiliate_achievements(claimed);

-- Security Events indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_security_events_creator_fid ON affiliate_security_events(creator_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_security_events_severity ON affiliate_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_affiliate_security_events_status ON affiliate_security_events(status);

-- Revenue Settings indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_revenue_settings_name ON affiliate_revenue_settings(setting_name);
CREATE INDEX IF NOT EXISTS idx_affiliate_revenue_settings_category ON affiliate_revenue_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_affiliate_revenue_settings_effective ON affiliate_revenue_settings(effective_from, effective_until);

-- Platform Revenue Events indexes
CREATE INDEX IF NOT EXISTS idx_platform_revenue_events_user_fid ON platform_revenue_events(user_fid);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_events_type ON platform_revenue_events(revenue_type);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_events_attributed ON platform_revenue_events(attributed);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_events_created_at ON platform_revenue_events(created_at);

-- ==========================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all affiliate tables
ALTER TABLE content_affiliate_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_attribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tier_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue_events ENABLE ROW LEVEL SECURITY;

-- Content Affiliate Tracking policies
CREATE POLICY "Users can view their own affiliate tracking" ON content_affiliate_tracking
  FOR SELECT USING (creator_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own affiliate tracking" ON content_affiliate_tracking
  FOR INSERT WITH CHECK (creator_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own affiliate tracking" ON content_affiliate_tracking
  FOR UPDATE USING (creator_fid = auth.jwt() ->> 'sub'::integer);

-- Attribution Events policies (read-only for users)
CREATE POLICY "Users can view their attribution events" ON affiliate_attribution_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_affiliate_tracking cat
      WHERE cat.id = affiliate_attribution_events.tracking_id
      AND cat.creator_fid = auth.jwt() ->> 'sub'::integer
    )
  );

-- Payout policies
CREATE POLICY "Users can view their own payouts" ON affiliate_payouts
  FOR SELECT USING (affiliate_fid = auth.jwt() ->> 'sub'::integer);

-- Creator tier progression policies
CREATE POLICY "Users can view their own tier progression" ON creator_tier_progression
  FOR SELECT USING (creator_fid = auth.jwt() ->> 'sub'::integer);

-- Achievement policies
CREATE POLICY "Users can view their own achievements" ON affiliate_achievements
  FOR SELECT USING (creator_fid = auth.jwt() ->> 'sub'::integer);

-- Service role can manage all affiliate data
CREATE POLICY "Service role can manage all affiliate data" ON content_affiliate_tracking
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage attribution events" ON affiliate_attribution_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage payouts" ON affiliate_payouts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tier progression" ON creator_tier_progression
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage achievements" ON affiliate_achievements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage security events" ON affiliate_security_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage revenue events" ON platform_revenue_events
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 11. TRIGGERS FOR AUTOMATION
-- ==========================================

-- Update timestamps trigger function (reuse existing)
CREATE TRIGGER update_content_affiliate_tracking_updated_at 
  BEFORE UPDATE ON content_affiliate_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_payouts_updated_at 
  BEFORE UPDATE ON affiliate_payouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_tier_progression_updated_at 
  BEFORE UPDATE ON creator_tier_progression 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 12. INITIAL CONFIGURATION DATA
-- ==========================================

-- Insert default revenue settings
INSERT INTO affiliate_revenue_settings (setting_name, setting_category, setting_value_decimal, description) VALUES
  ('subscription_commission_rate', 'commission_rates', 0.10, 'Base commission rate for subscription referrals'),
  ('roll_purchase_commission_rate', 'commission_rates', 0.05, 'Base commission rate for roll purchase referrals'),
  ('affiliate_product_commission_rate', 'commission_rates', 0.20, 'Commission rate for external affiliate product sales'),
  ('minimum_payout_threshold_solar', 'thresholds', 1000, 'Minimum SOLAR tokens required for payout'),
  ('maximum_monthly_payout_solar', 'thresholds', 100000, 'Maximum SOLAR tokens paid per creator per month'),
  ('attribution_window_days', 'attribution', 30, 'Default attribution window in days'),
  ('fraud_detection_threshold_solar', 'security', 10000, 'SOLAR amount requiring manual review');

-- Insert tier multipliers
INSERT INTO affiliate_revenue_settings (setting_name, setting_category, setting_value_decimal, description, tier_filter) VALUES
  ('tier_multiplier_emerging', 'tier_multipliers', 1.0, 'Commission multiplier for emerging creators', 'emerging'),
  ('tier_multiplier_rising', 'tier_multipliers', 1.2, 'Commission multiplier for rising creators', 'rising'),
  ('tier_multiplier_established', 'tier_multipliers', 1.5, 'Commission multiplier for established creators', 'established'),
  ('tier_multiplier_influential', 'tier_multipliers', 1.8, 'Commission multiplier for influential creators', 'influential'),
  ('tier_multiplier_legendary', 'tier_multipliers', 2.0, 'Commission multiplier for legendary creators', 'legendary');

-- ==========================================
-- 13. USEFUL VIEWS FOR ANALYTICS
-- ==========================================

-- Creator performance summary view
CREATE OR REPLACE VIEW creator_performance_summary AS
SELECT 
  cat.creator_fid,
  ctp.current_tier,
  COUNT(DISTINCT cat.id) as total_shares,
  SUM(cat.total_visits) as total_visits,
  SUM(cat.total_signups) as total_signups,
  SUM(cat.total_purchases) as total_purchases,
  SUM(cat.total_revenue) as total_revenue_generated,
  SUM(cat.total_affiliate_earnings) as total_affiliate_earnings,
  COALESCE(AVG(CASE WHEN cat.total_visits > 0 THEN cat.total_signups::DECIMAL / cat.total_visits ELSE 0 END), 0) as avg_conversion_rate,
  COUNT(DISTINCT DATE_TRUNC('month', cat.created_at)) as active_months
FROM content_affiliate_tracking cat
LEFT JOIN creator_tier_progression ctp ON cat.creator_fid = ctp.creator_fid
WHERE cat.status = 'active'
GROUP BY cat.creator_fid, ctp.current_tier;

-- Monthly affiliate revenue summary
CREATE OR REPLACE VIEW monthly_affiliate_revenue AS
SELECT 
  DATE_TRUNC('month', aae.created_at) as revenue_month,
  COUNT(DISTINCT aae.tracking_id) as active_affiliates,
  SUM(aae.revenue_amount) as total_revenue,
  SUM(aae.commission_earned) as total_commissions,
  SUM(aae.solar_tokens_earned) as total_solar_distributed,
  COUNT(*) as total_attribution_events
FROM affiliate_attribution_events aae
WHERE aae.event_type IN ('purchase', 'subscription')
GROUP BY DATE_TRUNC('month', aae.created_at)
ORDER BY revenue_month DESC;

-- Top performing content view
CREATE OR REPLACE VIEW top_performing_content AS
SELECT 
  cat.id,
  cat.creator_fid,
  cat.content_type,
  cat.share_title,
  cat.total_visits,
  cat.total_signups,
  cat.total_purchases,
  cat.total_revenue,
  cat.total_affiliate_earnings,
  CASE WHEN cat.total_visits > 0 THEN cat.total_signups::DECIMAL / cat.total_visits ELSE 0 END as conversion_rate,
  cat.created_at
FROM content_affiliate_tracking cat
WHERE cat.status = 'active'
ORDER BY cat.total_affiliate_earnings DESC
LIMIT 100;