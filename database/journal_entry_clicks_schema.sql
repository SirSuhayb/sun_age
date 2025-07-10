-- Migration: Add journal_entry_clicks table for reflection CTA analytics

CREATE TABLE IF NOT EXISTS journal_entry_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_entry_id UUID NOT NULL,
  share_id UUID,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entry_clicks_parent ON journal_entry_clicks(parent_entry_id);

-- Enable RLS and allow inserts for any user (public analytics)
ALTER TABLE journal_entry_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert clicks" ON journal_entry_clicks
  FOR INSERT WITH CHECK (true);