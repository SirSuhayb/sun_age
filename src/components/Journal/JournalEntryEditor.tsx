"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDailyContent } from '~/hooks/useDailyContent';
import type { JournalEntry } from '~/types/journal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import React from 'react';
import { PulsingStarSpinner } from "~/components/ui/PulsingStarSpinner";
import { shareJournalEntry, composeAndShareEntry } from '~/lib/journal';
import { createPortal } from 'react-dom';
import { useUnifiedShare } from '~/components/UnifiedShareFlow';

interface JournalEntryEditorProps {
  entry: JournalEntry;
  onSave: (entryToSave: { id?: string, content: string, parent_entry_id?: string, parent_share_id?: string }) => Promise<void>;
  onAutoSave: (entryToSave: { id?: string, content: string }) => Promise<void>;
  onFinish: () => void;
  onEdit?: () => void;
  mode?: 'edit' | 'read';
  onShare?: () => Promise<void>;
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

function GuidanceContextDisplay({ entry }: { entry: JournalEntry }) {
    if (!entry.guidance_title || !entry.guidance_prompt) {
        return null;
    }

    return (
        <div className="relative mb-4 p-4 border border-[#d4af37] bg-[#FFFCF2]/50 backdrop-blur-md">
            <div className="text-xs font-semibold tracking-widest text-[#d4af37] mb-2">GUIDANCE REFLECTION</div>
            <div className="mb-3">
                <div className="text-sm font-mono text-[#d4af37] mb-1">{entry.guidance_title}</div>
            </div>
            <p className="text-black font-serif text-lg tracking-[-0.02em]">{entry.guidance_prompt}</p>
        </div>
    );
}

// Utility to decode HTML entities (minimal for apostrophe, can expand as needed)
function decodeHtmlEntities(str: string) {
  if (!str) return str;
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function JournalEntryEditor({ entry, onSave, onAutoSave, onFinish, onEdit, onShare, mode = 'edit' }: JournalEntryEditorProps) {
  const [content, setContent] = useState(entry.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showDailyPrompt, setShowDailyPrompt] = useState(true);
  const { sdk, isInFrame } = useFrameSDK();
  const { content: dailyContent, isLoading: dailyContentLoading } = useDailyContent();
  const { triggerShare, ShareFlowComponent } = useUnifiedShare();

  // Auto-save functionality
  const debouncedAutoSave = useMemo(
    () => debounce(async (contentToSave: string) => {
      if (contentToSave.trim() && contentToSave !== entry.content) {
        try {
          await onAutoSave({ id: entry.id, content: contentToSave });
          setLastSaved(new Date());
        } catch (e: any) {
          console.error('Auto-save failed:', e);
        }
      }
    }, 2000),
    [onAutoSave, entry.id, entry.content]
  );

  useEffect(() => {
    debouncedAutoSave(content);
  }, [content, debouncedAutoSave]);

  const isReadMode = mode === 'read';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add a small delay to show the spinner animation
      await new Promise(resolve => setTimeout(resolve, 800));
      await onSave({ 
        id: entry.id, 
        content,
        parent_entry_id: entry.parent_entry_id,
        parent_share_id: entry.parent_share_id
      });
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
      if (onShare) {
        // Use custom share handler if provided (for guidance entries)
        await onShare();
      } else {
        // For guidance entries, ensure they're saved first
        if (entry.guidance_title && entry.preservation_status === 'local') {
          console.log('Saving guidance entry before sharing...');
          // Save the entry first
          await onSave({ id: entry.id, content });
          // Wait a moment for the save to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // For Farcaster users, use the existing share flow
        if (isInFrame) {
          await composeAndShareEntry(entry, sdk, isInFrame, entry.user_fid);
          console.log('Entry shared successfully via Farcaster');
        } else {
          // For non-Farcaster users, use the unified share flow
          const preview = content.slice(0, 200);
          const shareUrl = window.location.origin + `/journal/shared?preview=${encodeURIComponent(preview)}`;
          
          triggerShare({
            content: {
              type: 'journal_entry',
              title: 'My Cosmic Reflection',
              description: 'A moment of inner wisdom from my solar journey',
              data: {
                preview,
                shareUrl,
                entryId: entry.id
              }
            },
            onShareComplete: (platform, shareId) => {
              console.log(`Journal entry shared on ${platform} with ID: ${shareId}`);
            }
          });
        }
      }
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
        // Decode and clean prompt and starter
        const starterRaw = generateResponseStarter(promptText);
        const starter = decodeHtmlEntities(starterRaw)
          .replace(/\\n/g, '\n') // Replace literal \n with real newline
          .replace(/\n/g, '\n')   // Replace literal \n with real newline (if any)
          .trim();
        let prev = decodeHtmlEntities(prevContent)
          .replace(/\\n/g, '\n')
          .replace(/\n/g, '\n')
          .trimEnd();
        if (prev === '') {
            return starter;
        }
        return prev + '\n\n' + starter;
    });
    setShowPrompts(false);
  };

  // Only render portal on client
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-center items-end w-screen h-screen top-0 left-0">
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

              {showDailyPrompt && !isReadMode && !entry.guidance_title && <DailyPromptDisplay onDismiss={() => setShowDailyPrompt(false)} />}
              <GuidanceContextDisplay entry={entry} />

              {isReadMode ? (
                <div className="flex-grow w-full bg-transparent text-black p-2 text-2xl font-serif tracking-[-0.02em] whitespace-pre-wrap">
                  {content}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={entry.guidance_title ? "Share your reflection on this guidance..." : "What has your sol revealed to you today?"}
                  className="flex-grow w-full bg-transparent text-black placeholder-gray-500/80 p-2 text-2xl font-serif focus:outline-none resize-none tracking-[-0.02em] placeholder:text-2xl placeholder:italic"
                />
              )}
          </div>

          {/* Sticky Footer Area */}
          <div className="flex-shrink-0">
              <div className="px-4 pb-4">
                  <div className="text-xs text-center text-gray-600 font-mono border border-gray-300 bg-white/70 py-2 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {isReadMode ? (
                        <span>{entry.preservation_status.toUpperCase()}</span>
                      ) : (
                        <>
                          <span>PRIVATE UNTIL YOU CHOOSE TO SHARE IT</span>
                          {lastSaved && <span className="text-green-600">• SAVED {lastSaved.toLocaleTimeString()}</span>}
                        </>
                      )}
                  </div>
              </div>
              <div className="bg-white p-4 pb-12 sm:pb-4 border-t border-gray-200">
                  {isReadMode ? (
                    // Read mode: Edit and Share buttons
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Switch to edit mode by calling onEdit
                          onEdit?.();
                        }}
                        className="flex-1 border border-black bg-white text-black font-mono py-3 rounded-none hover:bg-gray-100 transition-colors text-sm"
                      >
                        EDIT
                      </button>
                      {entry.preservation_status === 'synced' && (
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
                          ) : "SHARE"}
                        </button>
                      )}
                    </div>
                  ) : (
                    // Edit mode: Prompts and Save/Share buttons
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
                          
                          {/* Daily Content Section */}
                          {dailyContent && !dailyContentLoading && (
                            <>
                              {/* Primary Affirmation */}
                              <div className="mb-4">
                                <div className="text-xs font-semibold tracking-widest text-yellow-700 mb-2">TODAY&apos;S AFFIRMATION</div>
                                <button 
                                  onClick={(e) => handlePromptClick(dailyContent.primary.text)} 
                                  className="w-full text-left p-3 border border-yellow-200 font-serif text-black hover:bg-yellow-50" 
                                  style={{ backgroundColor: '#FFFCF2' }}
                                >
                                  {dailyContent.primary.text}
                                </button>
                              </div>
                              
                              {/* Secondary Prompts */}
                              {dailyContent.secondary && dailyContent.secondary.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs font-semibold tracking-widest text-gray-700 mb-2">DAILY REFLECTION PROMPTS</div>
                                  <div className="space-y-2">
                                    {dailyContent.secondary.map((prompt, index) => (
                                      <button 
                                        key={prompt.id}
                                        onClick={(e) => handlePromptClick(prompt.text)} 
                                        className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" 
                                        style={{ backgroundColor: '#FEFDF8' }}
                                      >
                                        {prompt.text}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="border-t border-gray-200 my-4"></div>
                            </>
                          )}
                          
                          {/* Generic Prompts */}
                          <div>
                            <div className="text-xs font-semibold tracking-widest text-gray-700 mb-2">COSMIC REFLECTION STARTERS</div>
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
                        </div>
                      )}
                      <div className="flex gap-2">
                        {entry.guidance_title ? (
                          // For guidance entries: Show SAVE + SHARE button
                          <button 
                            onClick={async () => {
                              await handleSave();
                              await handleShare();
                            }} 
                            className="flex-1 border border-black bg-[#d4af37] text-black font-mono py-3 rounded-none hover:bg-[#e6c75a] transition-colors text-sm" 
                            disabled={isSaving || isSharing}
                          >
                            {isSaving || isSharing ? (
                              <div className="flex items-center justify-center">
                                <PulsingStarSpinner />
                                {isSaving ? "SAVING..." : "SHARING..."}
                              </div>
                            ) : "SAVE + SHARE"}
                          </button>
                        ) : (
                          // For regular entries: Show separate SAVE and SHARE buttons
                          <>
                            <button onClick={handleSave} className="flex-1 border border-black bg-white text-black font-mono py-3 rounded-none hover:bg-gray-100 transition-colors text-sm" disabled={isSaving}>
                              {isSaving ? (
                                <div className="flex items-center justify-center">
                                  <PulsingStarSpinner />
                                  SAVING...
                                </div>
                              ) : "SAVE REFLECTION"}
                            </button>
                            {entry.preservation_status === 'synced' && (
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
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
      
      {/* Unified Share Flow Component */}
      <ShareFlowComponent />
    </div>,
    document.body
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