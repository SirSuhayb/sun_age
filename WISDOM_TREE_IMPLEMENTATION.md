# Wisdom Tree Implementation Guide

## Overview

The Wisdom Tree is a feature that tracks how journal entries influence and inspire other entries, creating a "merkle tree of wisdom" that visualizes the flow of inspiration through the Solara community.

## Core Concepts

### 1. Entry Relationships
- **Parent-Child Relationships**: When a user clicks "Add a reflection" after viewing a shared journal entry, their new entry becomes a "child" of the viewed entry
- **Relationship Types**: 
  - `inspired_by`: Default relationship when someone creates a reflection after viewing an entry
  - `response_to`: Direct response to specific content
  - `continuation_of`: Continuing a thought or theme

### 2. Influence Metrics
Each journal entry tracks:
- **Direct Children Count**: Number of entries directly inspired by this one
- **Total Descendants Count**: Total number of entries in the influence tree
- **Reflection Conversion Rate**: Percentage of viewers who added reflections
- **Tree Depth**: How many levels deep the influence extends
- **Influence Score**: Calculated metric combining all factors

### 3. View Sessions
Track user interactions with shared entries:
- Session start/end times
- Interaction types (viewed, clicked_add_reflection, shared, bookmarked)
- Conversion tracking (did viewing lead to a reflection?)
- Device and referrer information

## Implementation Details

### Database Schema

#### New Tables

1. **journal_entry_relationships**
   - Tracks parent-child relationships between entries
   - Stores metadata about the inspiration source
   - Time to reflection tracking

2. **journal_entry_influence_metrics**
   - Aggregated metrics for each entry's influence
   - Automatically updated via triggers
   - Used for sorting and displaying influential content

3. **journal_entry_view_sessions**
   - Tracks individual viewing sessions
   - Conversion funnel analytics
   - User behavior insights

4. **wisdom_tree_paths** (Materialized View)
   - Pre-computed tree paths for efficient traversal
   - Enables fast tree visualization
   - Automatically refreshed on relationship changes

### API Endpoints

#### 1. Track Interaction
**POST** `/api/journal/track-interaction`
```json
{
  "entry_id": "uuid",
  "share_id": "uuid",
  "interaction_type": "clicked_add_reflection"
}
```
Tracks user interactions with shared entries and updates viewing sessions.

#### 2. Get Wisdom Tree
**GET** `/api/journal/wisdom-tree`
Query parameters:
- `entry_id`: Get tree for specific entry
- `user_fid`: Get trees for user's entries
- `root_only=true`: Only return root entries with children

Returns hierarchical tree structure with metrics.

### Frontend Integration

#### 1. Shared Entry Viewing
```typescript
// When viewing a shared entry
<EntryPreviewModalClient
  entry={share.entry}
  shareId={share.id}
  onAddReflection={(parentEntryId, parentShareId) => {
    // Navigate with parent info
  }}
/>
```

#### 2. Creating Inspired Entries
```typescript
// Journal component tracks parent entry
const handleAddReflection = (parentEntryId?: string, parentShareId?: string) => {
  setEditingEntry({
    // ... entry fields
    parent_entry_id: parentEntryId,
    parent_share_id: parentShareId
  });
};
```

#### 3. Saving with Relationships
The journal entries API automatically creates parent-child relationships when saving entries with `parent_entry_id`.

## User Flow

1. **User A** shares their journal entry
2. **User B** views the shared entry (view session created)
3. **User B** clicks "Add a reflection" (interaction tracked)
4. **User B** writes and saves their reflection
5. System creates parent-child relationship
6. Influence metrics update automatically
7. **User A** can see their entry inspired others

## Analytics & Insights

### Metrics Available
- **Influence Score**: Which entries have the most impact?
- **Conversion Rate**: Which entries inspire the most reflections?
- **Tree Visualization**: See the full cascade of inspiration
- **Time to Reflection**: How quickly do entries inspire others?

### Use Cases
1. **Highlight Influential Content**: Surface entries that spark conversations
2. **Reward Contributors**: Recognize users whose wisdom spreads
3. **Content Discovery**: Find entry chains on similar themes
4. **Community Health**: Track engagement and inspiration flow

## Future Enhancements

### 1. Wisdom Tree Visualization
Create interactive visualizations showing:
- Tree structure with expandable nodes
- Influence flow animations
- Metrics overlays
- Time-based playback

### 2. Notification System
- Notify users when their entries inspire reflections
- Weekly influence reports
- Milestone celebrations

### 3. Discovery Features
- "Most Influential This Week" feed
- Topic-based wisdom chains
- Recommended entries based on influence patterns

### 4. Gamification
- Wisdom tree badges
- Influence milestones
- Community challenges

## Technical Considerations

### Performance
- Materialized view for tree paths enables fast traversal
- Influence metrics cached and updated via triggers
- Pagination for large trees
- Depth limits prevent infinite recursion

### Privacy
- Only synced (public) entries participate in trees
- Users control sharing of their entries
- Anonymous viewing data (no PII stored)

### Scalability
- Efficient recursive CTEs for tree queries
- Indexed foreign keys for fast lookups
- Metrics aggregation reduces computation
- Background jobs for heavy processing

## Migration Guide

To enable wisdom tree tracking:

1. Run the database schema migration:
```sql
-- Apply journal_entry_relationships_schema.sql
```

2. Deploy API endpoints

3. Update frontend components with tracking

4. Backfill existing relationships (optional):
```sql
-- Script to analyze existing entries and infer relationships
```

## Monitoring

Track system health via:
- Conversion rate trends
- Tree depth distribution
- API response times
- User engagement metrics

## Security Considerations

- RLS policies ensure users only see permitted content
- Service role required for metrics updates
- Rate limiting on interaction tracking
- Input validation on all endpoints