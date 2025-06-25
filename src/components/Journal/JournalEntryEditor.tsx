"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDailyContent } from '~/hooks/useDailyContent';
import type { JournalEntry } from '~/types/journal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import React from 'react';
import { PulsingStarSpinner } from "~/components/ui/PulsingStarSpinner";

interface JournalEntryEditorProps {
  entry: JournalEntry;
  onSave: (entryToSave: { id?: string, content: string }) => Promise<void>;
  onAutoSave: (entryToSave: { id?: string, content: string }) => Promise<void>;
  onFinish: () => void;
}

interface DailyPromptDisplayProps {
    onDismiss: () => void;
}

function DailyPromptDisplay({ onDismiss }: DailyPromptDisplayProps) {
    const { content, isLoading, error } = useDailyContent();

    if (isLoading || error || !content) {
        return null; 
    }

    return (
        <div className="relative mb-4 p-4 border border-gray-200 bg-[#FFFCF2]/50 backdrop-blur-md">
            <button onClick={onDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="text-xs font-semibold tracking-widest text-yellow-700 mb-2">DAILY PROMPT</div>
            <p className="text-black font-serif text-xl tracking-[-0.04em]">{content.primary.text}</p>
        </div>
    );
}

// Helper for sharing API call
async function shareJournalEntry(entryId: string, userFid: number) {
  const res = await fetch("/api/journal/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, userFid }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to share entry");
  }
  return await res.json(); // { shareId, shareUrl }
}

export function JournalEntryEditor({ entry, onSave, onAutoSave, onFinish }: JournalEntryEditorProps) {
  const [content, setContent] = useState(entry.content);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showDailyPrompt, setShowDailyPrompt] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { sdk, isInFrame } = useFrameSDK();

  useEffect(() => {
    setContent(entry.content);
  }, [entry]);

  // Auto-save functionality with debounce
  const autoSave = useCallback(async (contentToSave: string) => {
    if (contentToSave.trim() === '') return;
    
    setIsAutoSaving(true);
    try {
      await onAutoSave({ id: entry.id, content: contentToSave });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsAutoSaving(false);
    }
  }, [entry.id, onAutoSave]);

  // Debounced version of autoSave
  const debouncedAutoSave = useCallback(
    debounce(autoSave, 2000), // 2 second debounce
    [autoSave]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (content !== entry.content) {
      debouncedAutoSave(content);
    }
  }, [content, entry.content, debouncedAutoSave]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add a small delay to show the spinner animation
      await new Promise(resolve => setTimeout(resolve, 800));
      await onSave({ id: entry.id, content });
      setLastSaved(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    setError(null);
    try {
      const userFid = entry.user_fid;
      const result = await shareJournalEntry(entry.id, userFid);
      setShareUrl(result.shareUrl);
      // Compose the cast using Farcaster Mini App SDK
      if (isInFrame && sdk) {
        await sdk.actions.composeCast({
          text: `🌞 My Solara reflection:\n\n${content.slice(0, 200)}...`,
          embeds: [window.location.origin + result.shareUrl],
        });
      } else {
        window.open(
          `https://warpcast.com/~/compose?text=Check out my Solara reflection!&embeds=${window.location.origin + result.shareUrl}`,
          "_blank"
        );
      }
    } catch (e: any) {
      setError(e.message || "Failed to share entry");
    } finally {
      setIsSharing(false);
    }
  };

  const handlePromptClick = (promptText: string | null) => {
    if (!promptText) return;
    
    const generateResponseStarter = (prompt: string): string => {
        const starters: { [key: string]: string } = {
            "How did this Sol day shape me?": "This Sol day shaped me by ",
            "What patterns am I noticing in my cosmic journey?": "In my cosmic journey, I'm noticing a pattern of ",
            "What wisdom emerged from today's orbit?": "From today's orbit, the wisdom that emerged was ",
        };
        return starters[prompt] || prompt;
    }

    setContent(prevContent => {
        const starter = generateResponseStarter(promptText);
        if (prevContent.trim() === '') {
            return starter;
        }
        return prevContent + '\\n\\n' + starter;
    });
    setShowPrompts(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
        {/* Sunrise gradient overlay */}
        <div className="absolute inset-0 bg-solara-sunrise" />
        
        {/* Modal with blur effect */}
        <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 w-full max-w-md h-[95vh] max-h-[1000px] flex flex-col animate-slide-up">
            
            {/* Scrollable Content Area */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="relative flex justify-center items-center mb-6">
                    <div className="text-center">
                        <h3 className="text-xl font-mono">SOL {entry.sol_day}</h3>
                        <p className="text-sm text-gray-500 font-mono">
                            {new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ".")}
                        </p>
                    </div>
                    <button onClick={onFinish} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {showDailyPrompt && <DailyPromptDisplay onDismiss={() => setShowDailyPrompt(false)} />}

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What has your sol revealed to you today?"
                    className="flex-grow w-full bg-transparent text-black placeholder-gray-500/80 p-2 text-2xl font-serif focus:outline-none resize-none tracking-[-0.02em] placeholder:text-2xl placeholder:italic"
                />
            </div>

            {/* Sticky Footer Area */}
            <div className="flex-shrink-0">
                <div className="px-4 pb-4">
                    <div className="text-xs text-center text-gray-600 font-mono border border-gray-300 bg-white/70 py-2 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>PRIVATE UNTIL YOU CHOOSE TO SHARE IT</span>
                        {isAutoSaving && <span className="text-blue-600">• AUTO-SAVING</span>}
                        {lastSaved && <span className="text-green-600">• SAVED {lastSaved.toLocaleTimeString()}</span>}
                    </div>
                </div>
                <div className="bg-white p-4 pb-12 sm:pb-4 border-t border-gray-200">
                    <div className="flex flex-col gap-2">
                        {!showPrompts ? (
                            <button onClick={() => setShowPrompts(true)} className="w-full border border-gray-300 text-gray-500 font-mono py-3 px-2 text-xs tracking-widest hover:bg-gray-100 transition-colors" style={{ backgroundColor: '#FEFDF8' }}>
                                NEED INSPIRATION? TAP FOR PROMPTS
                            </button>
                        ) : (
                            <div className="border border-gray-300 p-4 bg-white relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-mono tracking-widest text-sm text-black">WRITING PROMPTS</h4>
                                    <button onClick={() => setShowPrompts(false)} className="text-gray-400 hover:text-black">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        How did this Sol day shape me?
                                    </button>
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        What patterns am I noticing in my cosmic journey?
                                    </button>
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        What wisdom emerged from today&apos;s orbit?
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 border border-black bg-white text-black font-mono py-3 rounded-none hover:bg-gray-100 transition-colors text-sm" disabled={isSaving}>
                            {isSaving ? (
                                <div className="flex items-center justify-center">
                                    <PulsingStarSpinner />
                                    SAVING...
                                </div>
                            ) : "SAVE REFLECTION"}
                            </button>
                            <button
                              onClick={handleShare}
                              className="flex-1 border border-black bg-[#d4af37] text-black font-mono py-3 rounded-none hover:bg-[#e6c75a] transition-colors text-sm"
                              disabled={isSharing}
                            >
                              {isSharing ? (
                                <div className="flex items-center justify-center">
                                  <PulsingStarSpinner />
                                  SHARING...
                                </div>
                              ) : "SHARE ENTRY"}
                            </button>
                        </div>
                    </div>
                </div>
                {shareUrl && (
                  <div className="mt-2 text-center">
                    <span>Shared! </span>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="underline">View Shared Entry</a>
                  </div>
                )}
                {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
            </div>
        </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}