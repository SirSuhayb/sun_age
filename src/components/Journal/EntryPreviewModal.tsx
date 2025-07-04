"use client";

import React, { useState } from 'react';
import type { JournalEntry } from '~/types/journal';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryPreviewModalProps {
  entry: JournalEntry;
  isOpen: boolean;
  onClose: () => void;
  isOwnEntry: boolean;
  isOnboarded?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  userSolAge?: number | null;
  userEntryCount?: number;
  authorUsername?: string | null;
  authorDisplayName?: string | null;
}

export const EntryPreviewModal: React.FC<EntryPreviewModalProps> = ({
  entry,
  isOpen,
  onClose,
  isOwnEntry,
  isOnboarded = true,
  onEdit,
  onShare,
  userSolAge,
  userEntryCount,
  authorUsername,
  authorDisplayName,
}) => {
  const [showFull, setShowFull] = useState(false);

  if (!isOpen) return null;

  // Helper: Truncate to 6 lines (more accurate line counting)
  const maxLines = 6;
  const lines = entry.content.split(/\r?\n/);
  const needsReadMore = lines.length > maxLines;
  const previewText = needsReadMore && !showFull
    ? lines.slice(0, maxLines).join('\n') + '...'
    : entry.content;

  // Determine author display name
  let displayName: string = 'Solara User';
  if (isOwnEntry) {
    displayName = authorDisplayName ?? authorUsername ?? 'You';
  } else if (authorDisplayName || authorUsername) {
    displayName = authorDisplayName ?? authorUsername ?? 'Solara User';
  }

  const handleAddReflection = () => {
    window.location.href = '/soldash?tab=journal';
  };
  const handleViewJourney = () => {
    window.location.href = '/soldash';
  };
  const handleCalculateSolAge = () => {
    window.location.href = '/';
  };
  const handleLearnMore = () => {
    window.location.href = '/about';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Sunrise gradient overlay */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ zIndex: 0 }} />
          {/* Modal card with animation */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md h-[75vh] flex flex-col shadow-xl"
            style={{ borderRadius: 0 }}
          >
            <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 w-full h-full flex flex-col rounded-none" style={{ borderRadius: 0 }}>
              {/* Title row with close */}
              <div className="flex items-center pt-8 pl-8 pr-4 pb-0">
                <h3 className="font-serif text-[26px] font-light text-gray-900 tracking-tight flex-1" style={{ letterSpacing: '-0.04em', textAlign: 'left' }}>
                  Reflections from the Sol
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-black ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200 w-full mt-2" />
              {/* Meta row */}
              <div className="flex flex-row items-center gap-2 font-mono text-[16px] text-gray-700 tracking-tight pl-8 pt-4 pb-4" style={{ letterSpacing: '-0.04em', fontWeight: 400, textAlign: 'left' }}>
                <span>SOL {entry.sol_day}</span>
                <span className="text-gray-400">•</span>
                <span>{new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ".")}</span>
                <span className="text-gray-400">•</span>
                <span>{displayName} <span className="ml-1">🌞</span></span>
                <span className="text-gray-400">•</span>
                <span className="font-mono text-xs px-2 py-0.5 border rounded-none bg-yellow-50 border-yellow-300 text-yellow-700" style={{ fontWeight: 500, fontSize: '0.75rem' }}>{entry.preservation_status.toUpperCase()}</span>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-200 w-full mb-2" />
              {/* Content area (scrollable if needed) */}
              <div className="flex-1 overflow-y-auto pb-2 px-8" style={{ color: '#222222' }}>
                <div className="font-serif text-[18px] font-normal leading-[26px] tracking-tight whitespace-pre-line" style={{ letterSpacing: '-0.03em', color: '#222222', paddingTop: 8, paddingBottom: 8 }}>
                  {previewText}
                </div>
                {/* READ FULL REFLECTION button - show for all truncated content */}
                {needsReadMore && !showFull && (
                  <button
                    className="block mx-auto mt-4 mb-4 text-xs font-mono underline underline-offset-2 text-gray-700 hover:text-black"
                    onClick={() => setShowFull(true)}
                  >
                    READ FULL REFLECTION
                  </button>
                )}
                {showFull && (
                  <button
                    className="block mx-auto mt-2 mb-4 text-xs font-mono underline underline-offset-2 text-gray-700 hover:text-black"
                    onClick={() => setShowFull(false)}
                  >
                    {'< BACK TO PREVIEW'}
                  </button>
                )}
                {/* Onboarding Callout for other entry, not onboarded */}
                {!isOwnEntry && !isOnboarded && (
                  <div className="mt-6 border border-gray-200 bg-white/80 rounded-none p-6 flex flex-col items-center">
                    <div className="text-xl mb-2">✨</div>
                    <div className="font-serif text-xl font-normal mb-2 text-center">Start your cosmic journey</div>
                    <div className="font-mono text-xs text-gray-700 mb-4 text-center tracking-widest" style={{ letterSpacing: '0.08em' }}>
                      DISCOVER HOW MANY DAYS YOU&apos;VE ORBITED THE SUN AND BEGIN TRACKING YOUR REFLECTIONS
                    </div>
                    <div className="w-full mb-4">
                      <div className="bg-[#fff4aa] border border-yellow-200 text-center font-mono text-base py-2" style={{ color: '#bfa12a' }}>
                        THIS TRAVELLER&apos;S JOURNEY <br />
                        <span className="font-serif text-[20px] text-[#bfa12a]">Sol {entry.sol_day}</span> <span className="font-mono text-xs text-[#bfa12a]">and counting</span>
                      </div>
                    </div>
                    <button
                      className="w-full bg-[#d4af37] text-black font-mono text-base py-3 border border-black rounded-none hover:bg-[#e6c75a] transition-colors mb-2 tracking-widest uppercase"
                      onClick={handleCalculateSolAge}
                    >
                      CALCULATE YOUR SOL AGE
                    </button>
                    <button
                      className="w-full border border-black text-black font-mono text-base py-3 rounded-none hover:bg-gray-100 transition-colors tracking-widest uppercase"
                      onClick={handleLearnMore}
                    >
                      LEARN MORE ABOUT SOLARA
                    </button>
                  </div>
                )}
                {/* Follow-up Callout for onboarded users viewing another's entry */}
                {!isOwnEntry && isOnboarded && (
                  <div className="mt-6 border border-gray-200 bg-white/80 rounded-none p-6 flex flex-col items-center">
                    <div className="text-2xl mb-2">📓</div>
                    <div className="font-serif text-xl font-normal mb-2 text-center">Inspired by this reflection?</div>
                    <div className="font-mono text-xs text-gray-700 mb-4 text-center tracking-widest" style={{ letterSpacing: '0.08em' }}>
                      CONTINUE YOUR OWN COSMIC JOURNEY WITH A NEW REFLECTION
                    </div>
                    <div className="w-full mb-4">
                      <div className="bg-[#fff4aa] border border-yellow-200 text-center font-mono text-base py-2" style={{ color: '#bfa12a' }}>
                        YOUR JOURNEY<br />
                        <span className="font-serif text-[20px] text-[#bfa12a]">Sol {userSolAge?.toLocaleString() ?? '--'}</span> <span className="font-mono text-xs text-[#bfa12a]">and counting</span><br />
                        {typeof userEntryCount === 'number' && (
                          <span className="font-mono text-xs text-[#bfa12a]">{userEntryCount} entr{userEntryCount === 1 ? 'y' : 'ies'} preserved so far</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="w-full bg-[#d4af37] text-black font-mono text-base py-3 border border-black rounded-none hover:bg-[#e6c75a] transition-colors mb-2 tracking-widest uppercase"
                      onClick={handleAddReflection}
                    >
                      ADD A REFLECTION
                    </button>
                    <button
                      className="w-full border border-black text-black font-mono text-base py-3 rounded-none hover:bg-gray-100 transition-colors tracking-widest uppercase"
                      onClick={handleViewJourney}
                    >
                      VIEW YOUR JOURNEY
                    </button>
                  </div>
                )}
              </div>
              {/* Actions Section (only for own entry) */}
              {isOwnEntry && (
                <div className="flex gap-2 px-8 pb-6 pt-2 justify-center">
                  <button
                    className="font-mono text-[16px] tracking-tight py-3 rounded-none text-sm w-1/2 border border-black bg-white text-black hover:bg-gray-100 transition-colors"
                    style={{ letterSpacing: '-0.04em', fontWeight: 400 }}
                    onClick={onEdit}
                  >
                    EDIT REFLECTION
                  </button>
                  {entry.preservation_status === 'synced' && (
                    <button
                      className="font-mono text-[16px] tracking-tight py-3 rounded-none text-sm w-1/2 border border-black bg-[#d4af37] text-black hover:bg-[#e6c75a] transition-colors"
                      style={{ letterSpacing: '-0.04em', fontWeight: 400 }}
                      onClick={onShare}
                    >
                      SHARE REFLECTION
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 