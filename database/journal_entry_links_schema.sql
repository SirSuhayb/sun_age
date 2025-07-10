-- Migration: Add journal_entry_links table and hash columns to journal_entries

-- 1. Add optional hash columns to journal_entries for Merkle tree support
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS entry_hash TEXT,
  ADD COLUMN IF NOT EXISTS merkle_root TEXT;

-- 2. Create edge table to link parent and child journal entries (inspiration graph)
CREATE TABLE IF NOT EXISTS journal_entry_links (
  parent_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  child_id  UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (parent_id, child_id)
);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_journal_entry_links_parent ON journal_entry_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_links_child  ON journal_entry_links(child_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE journal_entry_links ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can select links where they own the parent entry
CREATE POLICY "Users can select links by parent ownership" ON journal_entry_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.parent_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
  );

-- Users can select links where they own the child entry
CREATE POLICY "Users can select links by child ownership" ON journal_entry_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.child_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
  );

-- Users can insert a link only when they own both entries
CREATE POLICY "Users can insert links between their own entries" ON journal_entry_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.parent_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
    AND EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.child_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
  );

-- Users can delete a link when they own either side
CREATE POLICY "Users can delete their own links" ON journal_entry_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.parent_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
    OR EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_links.child_id
        AND je.user_fid = (auth.jwt() ->> 'sub')::integer
    )
  );