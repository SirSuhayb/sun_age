"use client";

import React from 'react';
import type { JournalEntry } from '~/types/journal';

interface JournalTimelineProps {
  entries: JournalEntry[];
  loading?: boolean;
  onStartWriting: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onShare: (entry: JournalEntry) => void;
  onRead: (entry: JournalEntry) => void;
}

export const PreservationStatus = ({ status }: { status: 'local' | 'synced' | 'preserved' | 'private' }) => {
  let color = 'text-gray-500';
  let dot = 'bg-gray-400';
  let label = status.toUpperCase();
  if (status === 'preserved') {
    color = 'text-yellow-600';
    dot = 'bg-yellow-500';
  } else if (status === 'synced') {
    color = 'text-blue-600';
    dot = 'bg-blue-500';
    label = 'SYNCED';
  }
  return (
    <div className={`flex items-center text-xs font-mono tracking-widest ${color}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${dot}`}></span>
      {label}
    </div>
  );
};

// Skeleton loading component
const EntrySkeleton = () => (
  <div className="border border-gray-300 p-6 bg-white/90 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-6 bg-gray-200 rounded w-full"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-14"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export function JournalTimeline({ entries, loading = false, onStartWriting, onEdit, onDelete, onShare, onRead }: JournalTimelineProps) {
  // Show skeleton loading when loading and no entries
  if (loading && entries.length === 0) {
    return (
      <div className="space-y-4">
        <EntrySkeleton />
        <EntrySkeleton />
        <EntrySkeleton />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border border-gray-300 p-6 bg-white/90">
        <div className="text-center font-mono text-xs tracking-widest text-gray-500 mb-6">
          🌞 NO ENTRIES YET 🌞
        </div>
        <h3 className="text-xl font-serif font-bold mb-4">Welcome to the journal.</h3>
        <div className="font-serif text-lg text-gray-800 space-y-4 leading-tight tracking-[-0.02em]">
          <p>
            Every day you visit Solara, you&apos;ll find a daily prompt, an affirmation, or a reflection from our Sol Guide, Abri Mathos. Some days you might be inspired to share something you&apos;ve learned, you felt, you questioned—all are valid here. And sometimes if you feel inclined, you can preserve these reflections so that others may find the wisdom in your journey.
          </p>
          <p>
            Together we may seek the knowledge of the sun.
          </p>
        </div>
        <div className="mt-6 font-serif text-lg text-gray-800">
          <p>Sol Seeker 🌞</p>
          <p>- Su</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="border border-gray-300 p-6 bg-white/90 cursor-pointer group"
          onClick={(e) => {
            // Prevent click if a button was clicked
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;
            onRead(entry);
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono text-xs">SOL {entry.sol_day}</h4>
            <PreservationStatus status={entry.preservation_status} />
          </div>
          <p className="text-gray-800 font-serif text-xl mb-6 leading-snug line-clamp-3">
            {entry.content}
          </p>
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest">
            <div className="flex gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                className="text-gray-500 hover:text-black underline underline-offset-2"
              >EDIT</button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="text-red-500 hover:text-red-700 underline underline-offset-2"
              >DELETE</button>
              {entry.preservation_status === 'synced' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(entry); }}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >SHARE</button>
              )}
            </div>
            <span className="text-gray-500">{entry.word_count} words</span>
          </div>
        </div>
      ))}
    </div>
  );
}