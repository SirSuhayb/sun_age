// Shared journal utilities

import type { JournalEntry } from '~/types/journal';
import { getLatestBotPost } from './botPosts';

// Helper for sharing API call
export const shareJournalEntry = async (entryId: string, userFid: number, sdk?: any, isInFrame?: boolean) => {
  try {
    console.log('[shareJournalEntry] Starting share for entry:', entryId, 'userFid:', userFid);
    
    const response = await fetch('/api/journal/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, userFid })
    });

    if (!response.ok) {
      throw new Error(`Share API failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[shareJournalEntry] Share result:', result);

    if (!result.shareId) {
      throw new Error('No shareId returned from API');
    }

    // Use the mini app URL for the share link (this will have the fc:frame meta tag)
    const miniAppUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const shareUrl = `${miniAppUrl}/journal/shared/${result.shareId}`;
    
    const shareText = `A cosmic reflection from my journey around the sun 🌞\n\nRead it on Solara: ${shareUrl}`;

    if (isInFrame && sdk) {
      console.log('[shareJournalEntry] Sharing via Farcaster SDK with embed:', shareUrl);
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl]
      });
    } else {
      console.log('[shareJournalEntry] Sharing via Warpcast compose URL');
      window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds=${encodeURIComponent(shareUrl)}`;
    }

    return result;
  } catch (error) {
    console.error('[shareJournalEntry] Error sharing entry:', error);
    throw error;
  }
};

// Helper to trigger first entry claim notification
export async function maybeSendFirstEntryClaimNotification({ userFid, entryId, shareId }: {
  userFid: number;
  entryId: string;
  shareId: string;
}) {
  try {
    // Check if this is the user's first share
    const res = await fetch(`/api/journal/share?userFid=${userFid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      console.log("Could not check share count, skipping notification");
      return;
    }
    
    const shares = await res.json();
    
    // Only send notification for first share
    if (shares.length === 1) {
      await fetch('/api/notifications/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userFid, entryId, shareId })
      });
      console.log(`Sent first entry claim notification to user ${userFid}`);
    }
  } catch (error) {
    console.error('Error sending first entry claim notification:', error);
    // Don't throw - notification failure shouldn't break sharing
  }
}

// Helper for composing and sharing a journal entry
export async function composeAndShareEntry(entry: JournalEntry, sdk?: any, isInFrame?: boolean, userFid?: number) {
  console.log('[composeAndShareEntry] Starting compose and share for entry:', {
    entryId: entry.id,
    userFid: userFid || entry.user_fid,
    isInFrame,
    hasSdk: !!sdk,
    preservationStatus: entry.preservation_status
  });

  // Check if this is a local entry (starts with 'local_')
  if (entry.id.startsWith('local_')) {
    throw new Error('Cannot share local entries. Please migrate your entry to the database first.');
  }

  // Check if entry is synced
  if (entry.preservation_status !== 'synced') {
    throw new Error('Only synced entries can be shared. Please wait for your entry to be synced to the database.');
  }

  // Use provided userFid (for dev override) or fall back to entry.user_fid
  const finalUserFid = userFid || entry.user_fid;
  
  // First, create the share record
  const response = await fetch('/api/journal/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryId: entry.id, userFid: finalUserFid })
  });

  if (!response.ok) {
    throw new Error(`Share API failed: ${response.status}`);
  }

  const result = await response.json();
  console.log('[composeAndShareEntry] Share result:', result);

  if (!result.shareId) {
    throw new Error('No shareId returned from API');
  }
  
  // Compose the cast using the centralized sharing function
  const miniAppUrl = 'https://www.solara.fyi';
  const ogImageUrl = window.location.origin + `/journal/shared/${result.shareId}`;
  const shareText = `🌞 My Solara reflection:\n\n${entry.content.slice(0, 200)}...\n\nRead more or try Solara: ${miniAppUrl}`;
  
  // Use the centralized sharing function for consistency
  const { composeWithBotReference } = await import('./sharing');
  return await composeWithBotReference({
    text: shareText,
    embeds: [ogImageUrl, miniAppUrl],
    botPostType: 'journal_affirmation',
    sdk,
    isInFrame
  });
} 