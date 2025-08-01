const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function addGuidanceColumns() {
  console.log('🔧 Adding guidance columns to journal_entries table...\n');

  try {
    // Add guidance columns
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE journal_entries 
        ADD COLUMN IF NOT EXISTS guidance_id TEXT,
        ADD COLUMN IF NOT EXISTS guidance_title TEXT,
        ADD COLUMN IF NOT EXISTS guidance_prompt TEXT;
      `
    });

    if (alterError) {
      console.error('❌ Error adding guidance columns:', alterError);
      return;
    }

    // Add index for guidance_id
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_journal_entries_guidance_id ON journal_entries(guidance_id);
      `
    });

    if (indexError) {
      console.error('❌ Error creating index:', indexError);
      return;
    }

    console.log('✅ Guidance columns added successfully!');
    console.log('   - guidance_id (TEXT)');
    console.log('   - guidance_title (TEXT)');
    console.log('   - guidance_prompt (TEXT)');
    console.log('   - Index on guidance_id created');

  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

addGuidanceColumns(); 