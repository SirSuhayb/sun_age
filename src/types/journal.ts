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
  // Wisdom tree tracking
  parent_entry_id?: string;
  parent_share_id?: string;
}

// User identification types for unified user system
export interface UserIdentifier {
  type: 'farcaster_fid' | 'account_id';
  value: string | number;
}

export interface UserAccount {
  id: string;
  email: string;
  user_type: 'farcaster' | 'non_farcaster';
  farcaster_fid?: number;
  platform: string;
  sol_age?: number;
  archetype?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserAccountRequest {
  email: string;
  platform: string;
  sol_age?: number;
  archetype?: string;
  farcaster_fid?: number;
  anon_id?: string;
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
  parent_entry_id?: string;
  parent_share_id?: string;
  // User identification - can be either Farcaster FID or account ID
  userFid?: number; // For backward compatibility with Farcaster users
  userAccountId?: string; // For non-Farcaster users
  userIdentifier?: UserIdentifier; // Unified approach
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
}

// Wisdom Tree Types
export interface JournalEntryRelationship {
  id: string;
  parent_entry_id: string;
  child_entry_id: string;
  parent_share_id?: string;
  relationship_type: 'inspired_by' | 'response_to' | 'continuation_of';
  interaction_source: 'shared_entry_cta' | 'direct_link' | 'discovery_feed';
  time_to_reflection_minutes?: number;
  parent_view_count?: number;
  created_at: string;
}

export interface JournalEntryInfluenceMetrics {
  entry_id: string;
  direct_children_count: number;
  total_descendants_count: number;
  share_count: number;
  view_count: number;
  reflection_conversion_rate: number;
  tree_depth: number;
  tree_breadth: number;
  influence_score: number;
  first_child_created_at?: string;
  last_child_created_at?: string;
  updated_at: string;
}

export interface WisdomTreeNode {
  entry: JournalEntry;
  author?: {
    fid: number;
    username?: string;
    display_name?: string;
  };
  metrics?: JournalEntryInfluenceMetrics;
  children: WisdomTreeNode[];
  depth: number;
  path: string[];
}

export interface JournalViewSession {
  id: string;
  entry_id: string;
  viewer_fid: number;
  share_id?: string;
  session_start: string;
  session_end?: string;
  interaction_type?: 'viewed' | 'clicked_add_reflection' | 'shared' | 'bookmarked';
  resulted_in_reflection: boolean;
  resulting_entry_id?: string;
  referrer_source?: string;
  device_type?: string;
  created_at: string;
} 