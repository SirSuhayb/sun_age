-- Add guidance columns to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS guidance_id TEXT,
ADD COLUMN IF NOT EXISTS guidance_title TEXT,
ADD COLUMN IF NOT EXISTS guidance_prompt TEXT;

-- Add index for guidance_id for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_guidance_id ON journal_entries(guidance_id); 