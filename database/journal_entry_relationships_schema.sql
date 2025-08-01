-- Journal Entry Relationships Schema
-- Creates a merkle tree-like structure to track how journal entries influence each other

-- Table to track parent-child relationships between journal entries
CREATE TABLE IF NOT EXISTS journal_entry_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  child_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  parent_share_id UUID REFERENCES journal_shares(id) ON DELETE SET NULL,
  
  -- Tracking metadata
  relationship_type TEXT NOT NULL DEFAULT 'inspired_by', -- inspired_by, response_to, continuation_of
  interaction_source TEXT NOT NULL DEFAULT 'shared_entry_cta', -- shared_entry_cta, direct_link, discovery_feed
  
  -- Analytics data
  time_to_reflection_minutes INTEGER, -- Time between viewing parent and creating child
  parent_view_count INTEGER DEFAULT 1, -- How many times parent was viewed before reflection
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure no duplicate relationships
  UNIQUE(parent_entry_id, child_entry_id)
);

-- Table to track influence metrics for each journal entry
CREATE TABLE IF NOT EXISTS journal_entry_influence_metrics (
  entry_id UUID PRIMARY KEY REFERENCES journal_entries(id) ON DELETE CASCADE,
  
  -- Direct influence metrics
  direct_children_count INTEGER DEFAULT 0,
  total_descendants_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  reflection_conversion_rate DECIMAL(5,2) DEFAULT 0, -- % of viewers who added reflections
  
  -- Wisdom tree metrics
  tree_depth INTEGER DEFAULT 0, -- How deep is this entry's influence tree
  tree_breadth INTEGER DEFAULT 0, -- Max number of children at any level
  influence_score DECIMAL(10,2) DEFAULT 0, -- Calculated influence score
  
  -- Temporal metrics
  first_child_created_at TIMESTAMP,
  last_child_created_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table to track viewing sessions for conversion analytics
CREATE TABLE IF NOT EXISTS journal_entry_view_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  viewer_fid INTEGER NOT NULL,
  share_id UUID REFERENCES journal_shares(id) ON DELETE SET NULL,
  
  -- Session data
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  interaction_type TEXT, -- viewed, clicked_add_reflection, shared, bookmarked
  resulted_in_reflection BOOLEAN DEFAULT FALSE,
  resulting_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  
  -- Context data
  referrer_source TEXT, -- farcaster_frame, direct_link, soldash, web
  device_type TEXT, -- mobile, desktop, frame
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Materialized view for wisdom tree paths (for efficient tree traversal)
CREATE MATERIALIZED VIEW IF NOT EXISTS wisdom_tree_paths AS
WITH RECURSIVE tree_paths AS (
  -- Base case: entries with no parents (root nodes)
  SELECT 
    e.id as entry_id,
    e.id as root_entry_id,
    0 as depth,
    ARRAY[e.id] as path,
    e.user_fid as author_fid
  FROM journal_entries e
  WHERE NOT EXISTS (
    SELECT 1 FROM journal_entry_relationships r 
    WHERE r.child_entry_id = e.id
  )
  
  UNION ALL
  
  -- Recursive case: follow parent-child relationships
  SELECT 
    r.child_entry_id as entry_id,
    tp.root_entry_id,
    tp.depth + 1 as depth,
    tp.path || r.child_entry_id as path,
    e.user_fid as author_fid
  FROM tree_paths tp
  JOIN journal_entry_relationships r ON r.parent_entry_id = tp.entry_id
  JOIN journal_entries e ON e.id = r.child_entry_id
  WHERE tp.depth < 50 -- Prevent infinite recursion
)
SELECT * FROM tree_paths;

-- Create indexes for performance
CREATE INDEX idx_relationships_parent ON journal_entry_relationships(parent_entry_id);
CREATE INDEX idx_relationships_child ON journal_entry_relationships(child_entry_id);
CREATE INDEX idx_relationships_share ON journal_entry_relationships(parent_share_id);
CREATE INDEX idx_influence_metrics_score ON journal_entry_influence_metrics(influence_score DESC);
CREATE INDEX idx_view_sessions_entry ON journal_entry_view_sessions(entry_id);
CREATE INDEX idx_view_sessions_viewer ON journal_entry_view_sessions(viewer_fid);
CREATE INDEX idx_view_sessions_reflection ON journal_entry_view_sessions(resulted_in_reflection);

-- Create index on materialized view
CREATE INDEX idx_wisdom_paths_entry ON wisdom_tree_paths(entry_id);
CREATE INDEX idx_wisdom_paths_root ON wisdom_tree_paths(root_entry_id);
CREATE INDEX idx_wisdom_paths_depth ON wisdom_tree_paths(depth);

-- Function to calculate influence score for an entry
CREATE OR REPLACE FUNCTION calculate_influence_score(p_entry_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL := 0;
  v_direct_children INTEGER;
  v_total_descendants INTEGER;
  v_conversion_rate DECIMAL;
  v_tree_depth INTEGER;
BEGIN
  SELECT 
    COALESCE(direct_children_count, 0),
    COALESCE(total_descendants_count, 0),
    COALESCE(reflection_conversion_rate, 0),
    COALESCE(tree_depth, 0)
  INTO 
    v_direct_children,
    v_total_descendants,
    v_conversion_rate,
    v_tree_depth
  FROM journal_entry_influence_metrics
  WHERE entry_id = p_entry_id;
  
  -- Calculate weighted score
  -- Direct children worth 10 points each
  -- Descendants worth 2 points each
  -- Conversion rate multiplier (0-1)
  -- Tree depth bonus (5 points per level)
  v_score := (v_direct_children * 10) + 
             (v_total_descendants * 2) + 
             (v_conversion_rate * 50) +
             (v_tree_depth * 5);
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update influence metrics for an entry
CREATE OR REPLACE FUNCTION update_influence_metrics(p_entry_id UUID)
RETURNS VOID AS $$
DECLARE
  v_direct_children INTEGER;
  v_total_descendants INTEGER;
  v_tree_depth INTEGER;
  v_view_count INTEGER;
  v_reflection_count INTEGER;
  v_conversion_rate DECIMAL;
BEGIN
  -- Count direct children
  SELECT COUNT(*) INTO v_direct_children
  FROM journal_entry_relationships
  WHERE parent_entry_id = p_entry_id;
  
  -- Count total descendants using recursive CTE
  WITH RECURSIVE descendants AS (
    SELECT child_entry_id, 1 as level
    FROM journal_entry_relationships
    WHERE parent_entry_id = p_entry_id
    
    UNION ALL
    
    SELECT r.child_entry_id, d.level + 1
    FROM descendants d
    JOIN journal_entry_relationships r ON r.parent_entry_id = d.child_entry_id
    WHERE d.level < 50
  )
  SELECT COUNT(*), COALESCE(MAX(level), 0)
  INTO v_total_descendants, v_tree_depth
  FROM descendants;
  
  -- Calculate conversion rate
  SELECT 
    COUNT(DISTINCT viewer_fid),
    COUNT(DISTINCT viewer_fid) FILTER (WHERE resulted_in_reflection = true)
  INTO v_view_count, v_reflection_count
  FROM journal_entry_view_sessions
  WHERE entry_id = p_entry_id;
  
  IF v_view_count > 0 THEN
    v_conversion_rate := (v_reflection_count::DECIMAL / v_view_count) * 100;
  ELSE
    v_conversion_rate := 0;
  END IF;
  
  -- Update or insert metrics
  INSERT INTO journal_entry_influence_metrics (
    entry_id, 
    direct_children_count, 
    total_descendants_count,
    tree_depth,
    view_count,
    reflection_conversion_rate,
    influence_score,
    updated_at
  ) VALUES (
    p_entry_id,
    v_direct_children,
    v_total_descendants,
    v_tree_depth,
    v_view_count,
    v_conversion_rate,
    calculate_influence_score(p_entry_id),
    NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    direct_children_count = EXCLUDED.direct_children_count,
    total_descendants_count = EXCLUDED.total_descendants_count,
    tree_depth = EXCLUDED.tree_depth,
    view_count = EXCLUDED.view_count,
    reflection_conversion_rate = EXCLUDED.reflection_conversion_rate,
    influence_score = EXCLUDED.influence_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics when relationships change
CREATE OR REPLACE FUNCTION trigger_update_influence_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update parent entry metrics
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_influence_metrics(NEW.parent_entry_id);
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    PERFORM update_influence_metrics(OLD.parent_entry_id);
  END IF;
  
  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY wisdom_tree_paths;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_influence_on_relationship_change
AFTER INSERT OR UPDATE OR DELETE ON journal_entry_relationships
FOR EACH ROW EXECUTE FUNCTION trigger_update_influence_metrics();

-- RLS Policies
ALTER TABLE journal_entry_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_influence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_view_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view relationships for their own entries or public entries
CREATE POLICY "View relationships for own or shared entries" ON journal_entry_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM journal_entries je 
      WHERE (je.id = parent_entry_id OR je.id = child_entry_id)
      AND (je.user_fid = auth.jwt() ->> 'sub'::integer OR je.preservation_status = 'synced')
    )
  );

-- Users can create relationships when they create a child entry
CREATE POLICY "Create relationships for own child entries" ON journal_entry_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries je 
      WHERE je.id = child_entry_id 
      AND je.user_fid = auth.jwt() ->> 'sub'::integer
    )
  );

-- Anyone can view influence metrics for synced entries
CREATE POLICY "View influence metrics for synced entries" ON journal_entry_influence_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM journal_entries je 
      WHERE je.id = entry_id 
      AND (je.user_fid = auth.jwt() ->> 'sub'::integer OR je.preservation_status = 'synced')
    )
  );

-- Users can track their own viewing sessions
CREATE POLICY "Track own viewing sessions" ON journal_entry_view_sessions
  FOR ALL USING (viewer_fid = auth.jwt() ->> 'sub'::integer);