import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';
import type { WisdomTreeNode } from '~/types/journal';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entry_id');
    const userFid = searchParams.get('user_fid');
    const rootOnly = searchParams.get('root_only') === 'true';
    
    const supabase = createServiceRoleClient();
    
    if (entryId) {
      // Get tree for a specific entry
      const tree = await getWisdomTreeForEntry(supabase, entryId);
      return NextResponse.json(tree);
    } else if (userFid) {
      // Get all root entries for a user
      const roots = await getRootEntriesForUser(supabase, parseInt(userFid), rootOnly);
      return NextResponse.json(roots);
    } else {
      // Get top influential entries across the platform
      const topEntries = await getTopInfluentialEntries(supabase);
      return NextResponse.json(topEntries);
    }
  } catch (error) {
    console.error('Error fetching wisdom tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wisdom tree data' },
      { status: 500 }
    );
  }
}

async function getWisdomTreeForEntry(
  supabase: any, 
  entryId: string
): Promise<WisdomTreeNode> {
  // Get the entry and its metrics
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select(`
      *,
      profiles!journal_entries_user_fid_fkey(
        fid,
        username,
        display_name
      )
    `)
    .eq('id', entryId)
    .single();
    
  if (entryError || !entry) {
    throw new Error('Entry not found');
  }
  
  // Get influence metrics
  const { data: metrics } = await supabase
    .from('journal_entry_influence_metrics')
    .select('*')
    .eq('entry_id', entryId)
    .single();
  
  // Build the tree recursively
  const tree = await buildWisdomTree(supabase, entry, metrics, 0, [entryId]);
  
  return tree;
}

async function buildWisdomTree(
  supabase: any,
  entry: any,
  metrics: any,
  depth: number,
  path: string[]
): Promise<WisdomTreeNode> {
  // Get all children of this entry
  const { data: relationships } = await supabase
    .from('journal_entry_relationships')
    .select(`
      *,
      journal_entries!journal_entry_relationships_child_entry_id_fkey(
        *,
        profiles!journal_entries_user_fid_fkey(
          fid,
          username,
          display_name
        )
      )
    `)
    .eq('parent_entry_id', entry.id)
    .order('created_at', { ascending: true });
  
  const children: WisdomTreeNode[] = [];
  
  // Recursively build children (limit depth to prevent infinite loops)
  if (relationships && depth < 10) {
    for (const rel of relationships) {
      const childEntry = rel.journal_entries;
      if (childEntry && !path.includes(childEntry.id)) {
        const { data: childMetrics } = await supabase
          .from('journal_entry_influence_metrics')
          .select('*')
          .eq('entry_id', childEntry.id)
          .single();
          
        const childNode = await buildWisdomTree(
          supabase,
          childEntry,
          childMetrics,
          depth + 1,
          [...path, childEntry.id]
        );
        
        children.push(childNode);
      }
    }
  }
  
  return {
    entry,
    author: entry.profiles ? {
      fid: entry.profiles.fid,
      username: entry.profiles.username,
      display_name: entry.profiles.display_name
    } : undefined,
    metrics,
    children,
    depth,
    path
  };
}

async function getRootEntriesForUser(
  supabase: any,
  userFid: number,
  rootOnly: boolean
): Promise<WisdomTreeNode[]> {
  let query = supabase
    .from('journal_entries')
    .select(`
      *,
      profiles!journal_entries_user_fid_fkey(
        fid,
        username,
        display_name
      ),
      journal_entry_influence_metrics(*)
    `)
    .eq('user_fid', userFid)
    .eq('preservation_status', 'synced');
  
  if (rootOnly) {
    // Only get entries that have children but no parents
    const { data: entries } = await query;
    
    if (!entries) return [];
    
    // Filter to only root nodes (no parent relationships)
    const rootEntries = [];
    for (const entry of entries) {
      const { data: parentRel } = await supabase
        .from('journal_entry_relationships')
        .select('id')
        .eq('child_entry_id', entry.id)
        .limit(1)
        .single();
        
      if (!parentRel) {
        // This is a root node, check if it has children
        const { data: childRel } = await supabase
          .from('journal_entry_relationships')
          .select('id')
          .eq('parent_entry_id', entry.id)
          .limit(1)
          .single();
          
        if (childRel) {
          const tree = await buildWisdomTree(
            supabase,
            entry,
            entry.journal_entry_influence_metrics?.[0],
            0,
            [entry.id]
          );
          rootEntries.push(tree);
        }
      }
    }
    
    return rootEntries;
  } else {
    // Get all entries with influence metrics
    const { data: entries } = await query
      .not('journal_entry_influence_metrics', 'is', null)
      .order('journal_entry_influence_metrics(influence_score)', { ascending: false });
      
    if (!entries) return [];
    
    return entries.map(entry => ({
      entry,
      author: entry.profiles ? {
        fid: entry.profiles.fid,
        username: entry.profiles.username,
        display_name: entry.profiles.display_name
      } : undefined,
      metrics: entry.journal_entry_influence_metrics?.[0],
      children: [],
      depth: 0,
      path: [entry.id]
    }));
  }
}

async function getTopInfluentialEntries(
  supabase: any,
  limit: number = 10
): Promise<WisdomTreeNode[]> {
  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      *,
      profiles!journal_entries_user_fid_fkey(
        fid,
        username,
        display_name
      ),
      journal_entry_influence_metrics!inner(*)
    `)
    .eq('preservation_status', 'synced')
    .order('journal_entry_influence_metrics.influence_score', { ascending: false })
    .limit(limit);
    
  if (!entries) return [];
  
  return entries.map(entry => ({
    entry,
    author: entry.profiles ? {
      fid: entry.profiles.fid,
      username: entry.profiles.username,
      display_name: entry.profiles.display_name
    } : undefined,
    metrics: entry.journal_entry_influence_metrics?.[0],
    children: [],
    depth: 0,
    path: [entry.id]
  }));
}