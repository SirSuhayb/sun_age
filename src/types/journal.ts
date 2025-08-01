export interface JournalEntry {
  id: string;
  user_fid: number;
  sol_day: number;
  content: string;
  preservation_status: 'local' | 'synced' | 'preserved';
  preservation_tx_hash?: string;
  word_count: number;
  created_at: string;
  preserved_at?: string;
  // Guidance metadata
  guidance_id?: string;
  guidance_title?: string;
  guidance_prompt?: string;
}

export interface WisdomExtract {
  id: string;
  journal_entry_id: string;
  user_fid: number;
  sol_day: number;
  wisdom_text: string;
  extraction_method: 'ai' | 'user' | 'collaborative';
  ai_confidence?: number;
  preservation_status: 'local' | 'preserved';
  share_status: 'private' | 'shared';
  preservation_tx_hash?: string;
  created_at: string;
  preserved_at?: string;
  shared_at?: string;
}

export interface UserWisdomProgress {
  user_fid: number;
  current_phase: number;
  total_extractions: number;
  successful_ai_matches: number;
  wisdom_streak: number;
  last_extraction_date?: string;
  phase_updated_at: string;
}

export interface WisdomSuggestion {
  text: string;
  reasoning: string;
  confidence_score: number;
}

export interface CreateJournalEntryRequest {
  content: string;
  sol_day: number;
  guidance_id?: string;
  guidance_title?: string;
  guidance_prompt?: string;
}

export interface UpdateJournalEntryRequest {
  content: string;
}

export interface ExtractWisdomRequest {
  journal_entry_id: string;
  selected_text?: string;
  user_phase: number;
}

export interface PreserveEntryRequest {
  journal_entry_id: string;
  payment_method: 'farcaster_wallet';
}

export interface PreserveWisdomRequest {
  wisdom_id: string;
  payment_method: 'farcaster_wallet';
}

export interface ShareWisdomRequest {
  wisdom_id: string;
}

export type JournalTabState = 'timeline' | 'create' | 'edit' | 'view';

export interface JournalFilters {
  preservation_status?: 'all' | 'local' | 'preserved';
  search?: string;
  guidance_only?: boolean;
} 