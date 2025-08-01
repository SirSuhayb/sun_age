"use client";

import Link from 'next/link';
import EntryPreviewModalClient from '~/components/Journal/EntryPreviewModalClient';
import { useEffect, useState } from 'react';

export default function SharedJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const [share, setShare] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSolAge, setUserSolAge] = useState<number | null>(null);
  const [userEntryCount, setUserEntryCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/journal/shared/${id}`);
        if (!response.ok) {
          throw new Error('Entry not found');
        }
        const data = await response.json();
        setShare(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    // Get user's sol age from localStorage
    try {
      const bookmark = localStorage.getItem('sunCycleBookmark');
      if (bookmark) {
        const parsed = JSON.parse(bookmark);
        setUserSolAge(parsed.days || null);
      }
    } catch (e) {
      console.error('Error parsing bookmark:', e);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal entry...</p>
        </div>
      </div>
    );
  }

  if (error || !share || !share.entry) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-4">This journal entry may have been deleted or is no longer available.</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
          >
            GO TO SOLARA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <EntryPreviewModalClient
        entry={share.entry}
        isOpen={true}
        onClose={() => window.history.back()}
        isOwnEntry={false}
        isOnboarded={!!userSolAge}
        userSolAge={userSolAge}
        userEntryCount={userEntryCount}
        authorUsername={share.authorUsername}
        authorDisplayName={share.authorDisplayName}
        shareId={share.id}
      />
    </div>
  );
} 