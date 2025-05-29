"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import type { FrameContext } from "~/types/frame";
import Image from "next/image";
import Header from "./SunCycleAge/Header";
import SolarSystemGraphic from "./SunCycleAge/SolarSystemGraphic";
import ResultCard from "./SunCycleAge/ResultCard";
import FormSection from "./SunCycleAge/FormSection";
import MilestoneOrbit from "./SunCycleAge/MilestoneOrbit";
import { getNextMilestone, getProgressToNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "~/lib/milestones";
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogOverlay,
} from "../components/ui/dialog";
import MilestoneCard from "./SunCycleAge/MilestoneCard";
import sdk from "@farcaster/frame-sdk";
import { useRouter } from "next/navigation";
import { useSolarPledge } from '~/hooks/useSolarPledge';
import SolarPledgeABI from '~/lib/abis/SolarPledge.json';
import { SOLAR_PLEDGE_ADDRESS } from '~/lib/constants';
import { useReadContract } from 'wagmi';
import { SignInButton } from '@farcaster/auth-kit';
// import { revokeUserConsent } from "~/lib/consent";

function WarpcastEmbed({ url }: { url: string }) {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/warpcast-oembed?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => setEmbedHtml(data.html));
  }, [url]);
  if (!embedHtml) return <div className="text-xs text-gray-400 font-mono text-center my-4">Loading cast…</div>;
  return (
    <div className="flex justify-center my-4" dangerouslySetInnerHTML={{ __html: embedHtml }} />
  );
}

interface SunCycleAgeProps {
  initialConsentData?: any[] | null;
}

function BookmarkCard({ bookmark, milestone, milestoneDate, daysToMilestone, onRecalculate, onClear, isRecalculating, sinceLastVisit, milestoneCard, showMilestoneModal, setShowMilestoneModal, nextNumericalMilestones, onShare, isSharing, initialTab }) {
  const [tab, setTab] = useState<'sol age' | 'sol vows' | 'journal' | 'sol sign'>(initialTab || 'sol age');
  const { context } = useFrameSDK();
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<Error | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);
  const { createPledge, isLoading: isPledgeLoading, error: pledgeError, hasPledged, approveUSDC, isApproved } = useSolarPledge();
  const router = useRouter();

  // Add touch feedback state
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  // Live contract stats for cosmic convergence callout
  const { data: totalPledges } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'totalPledges',
  });
  const { data: communityPool } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'communityPool',
  });
  const { data: convergenceEnd } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'convergenceEnd',
  });
  const now = Math.floor(Date.now() / 1000);
  const daysRemaining = convergenceEnd ? Math.max(0, Math.floor((Number(convergenceEnd) - now) / 86400)) : null;

  const handleSign = async () => {
    setSignError(null);
    setIsSigning(true);
    try {
      const commitment = `I pledge to honor my ${bookmark.days} solar rotations`;
      const farcasterHandle = context?.user?.username || '';
      const pledgeAmount = 1; // 1 USDC
      await createPledge(commitment, farcasterHandle, pledgeAmount);
      setSignSuccess(true);
    } catch (err) {
      setSignError(err instanceof Error ? err : new Error('Failed to sign. Please try again.'));
    } finally {
      setIsSigning(false);
    }
  };

  const handleSignModalClose = () => {
    setIsSigning(false);
    setSignError(null);
    setSignSuccess(false);
  };

  return (
    <div className="max-w-md w-full flex flex-col items-center space-y-4 sm:space-y-6 relative mt-24 px-0 sm:px-0">
      <Image
        src="/sunsun.png"
        alt="Sun"
        width={72}
        height={72}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
        style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
        priority
      />
      <div className="text-xs font-mono tracking-widest text-gray-500 dark:text-gray-300 text-center uppercase mb-2">WELCOME BACK TRAVELER...</div>
      <div className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-gray-800 dark:text-white text-center mb-1">{bookmark.days} <span className="font-serif">Sol Age</span></div>
      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 text-center mb-2">+{sinceLastVisit} since your last visit</div>
      
      {/* Enhanced Tabs with better mobile support */}
      <div className="flex w-full border-b border-gray-300 dark:border-gray-700 mb-4 overflow-x-auto">
        {['sol age', 'sol vows', 'journal', 'sol sign'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName as any)}
            className={`flex-1 min-w-[100px] py-3 px-2 text-xs font-mono uppercase tracking-widest transition-colors duration-200 ${
              tab === tabName 
                ? 'border-b-2 border-black dark:border-white font-bold' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {tabName.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content with improved mobile spacing */}
      {tab === 'sol age' && (
        <div className="w-full text-sm font-mono space-y-3">
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors">
            <span className="text-gray-500">FROM BIRTH</span>
            <span className="font-bold text-right">{bookmark.days.toLocaleString()} DAYS</span>
          </div>
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors">
            <span className="text-gray-500">BIRTH DATE</span>
            <span className="font-bold text-right">{bookmark.birthDate.replace(/-/g, ".")}</span>
          </div>
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors">
            <span className="text-gray-500">NEXT MILESTONE</span>
            <span className="font-bold text-right">{milestone} <span className="font-normal">(in {daysToMilestone} days)</span></span>
          </div>
          
          {/* Enhanced Milestone Card Section */}
          {milestoneCard && (
            <div className="w-full flex flex-col items-center my-4">
              {milestoneCard}
              <button
                className="mt-3 text-sm underline text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200 font-mono font-semibold transition-colors duration-200"
                onClick={() => setShowMilestoneModal(true)}
              >
                View More Milestones ↗
              </button>
              
              {/* Enhanced Modal */}
              {showMilestoneModal && (
                <RadixDialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
                  <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
                  <DialogContent className="w-[95vw] sm:w-4/5 max-w-lg border border-gray-400 bg-[rgba(255,252,242,0.95)] dark:bg-[rgba(24,24,28,0.95)] p-4 sm:p-6 rounded-none shadow-md backdrop-blur-lg">
                    <DialogTitle className="text-2xl font-serif font-bold mb-4">Upcoming Milestones</DialogTitle>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {(() => {
                        const milestoneTypes = [
                          { type: 'interval', label: 'Numerical Milestone' },
                          { type: 'palindrome', label: 'Palindrome Day' },
                          { type: 'interesting', label: 'Interesting Number' },
                          { type: 'cosmic', label: 'Cosmic (Solar Return or Special)' },
                          { type: 'angel', label: 'Angel Number' },
                        ];
                        const milestoneByType = getNextMilestoneByType(bookmark.days, new Date(bookmark.birthDate));
                        return milestoneTypes.map(({ type, label }) => {
                          const m = milestoneByType[type];
                          if (!m) return null;
                          return (
                            <div key={type} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded transition-colors">
                              <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</div>
                              <MilestoneCard
                                number={m.cycles}
                                label={m.label}
                                emoji={m.emoji}
                                description={m.description}
                                daysToMilestone={m.daysToMilestone}
                                milestoneDate={m.milestoneDate}
                                variant="bookmark"
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex justify-end mt-6">
                      <DialogClose asChild>
                        <button className="px-6 py-2 border border-gray-400 dark:border-gray-700 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">CLOSE</button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </RadixDialog>
              )}
            </div>
          )}
          
          {/* Enhanced Divider and Quote */}
          <div className="border-t border-gray-300 dark:border-gray-700 my-4" />
          <div className="text-xs font-sans text-gray-400 italic text-left p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            Your journey began {bookmark.days.toLocaleString()} days ago. Each rotation represents both repetition and change.
          </div>
        </div>
      )}

      {tab === 'sol vows' && (
        <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-3xl mb-2">🌞</div>
          <div className="text-lg font-bold mb-1">Nothing here yet</div>
          <div className="text-gray-500">Your future vows and commitments will appear here.</div>
        </div>
      )}

      {tab === 'journal' && (
        <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-3xl mb-2">📓</div>
          <div className="text-lg font-bold mb-1">Nothing here yet</div>
          <div className="text-gray-500">Your journal entries and reflections will appear here.</div>
        </div>
      )}

      {tab === 'sol sign' && (
        <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center justify-center p-8 text-center">
          {/* Cosmic Convergence Callout with live stats */}
          <div className="w-full border border-blue-200 bg-[#F2F7FF] rounded-none p-3 font-mono text-sm text-left mb-4" style={{ color: '#2563eb', fontFamily: 'Geist Mono, monospace' }}>
            <span className="font-bold uppercase tracking-widest">COSMIC CONVERGENCE | EPOCH 0</span><br />
            <span className="text-xs font-mono" style={{ color: '#2563eb' }}>
              {totalPledges !== undefined ? `${totalPledges} vows committed` : '...'} •
              ${communityPool !== undefined ? (Number(communityPool) / 1_000_000).toLocaleString() : '...'} pooled •
              {daysRemaining !== null ? `${daysRemaining} days remaining` : '...'}
            </span>
          </div>
          {hasPledged ? (
            <>
              <div className="text-3xl mb-2">✅</div>
              <div className="text-lg font-bold mb-1">Pledge Signed</div>
              <div className="text-gray-500">You have already signed the solar pledge.</div>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">✍️</div>
              <div className="text-lg font-bold mb-1">Sign the Solar Pledge</div>
              <div className="text-gray-500 mb-4">Commit to your solar journey with a pledge of 1 USDC.</div>
              <SignInButton />
              {pledgeError && (
                <div className="text-red-500 text-sm mt-2">{pledgeError.message}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SunCycleAge({ initialConsentData }: SunCycleAgeProps) {
  const { 
    isSDKLoaded, 
    pinFrame, 
    isFramePinned, 
    context, 
    isInFrame,
    loading,
    isConnected,
    address
  } = useFrameSDK();
  const router = useRouter();
  const [birthDate, setBirthDate] = useState<string>("");
  const [days, setDays] = useState<number | null>(null);
  const [approxYears, setApproxYears] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Quotes for the result card
  const quotes = useMemo(() => [
    "Sun cycle age measures your existence through rotations around our star. One day = one rotation.",
    "You are a child of the cosmos, a way for the universe to know itself.",
    "Every day is a new journey around the sun.",
    "The sun watches over all your rotations.",
    "Your orbit is uniquely yours—shine on."
  ], []);
  const [quote, setQuote] = useState(quotes[0]);

  // Header date (client only)
  const [formattedDate, setFormattedDate] = useState("");
  useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, ".")
    );
  }, []);

  // Solar milestone calculation (client only)
  const milestoneStep = 1000;
  const [nextMilestone, setNextMilestone] = useState<number | null>(null);
  const [daysToMilestone, setDaysToMilestone] = useState<number | null>(null);
  const [milestoneDate, setMilestoneDate] = useState<string | null>(null);
  const [lastMilestoneNotified, setLastMilestoneNotified] = useState<number | null>(null);

  // Log initial consent data for debugging
  useEffect(() => {
    if (initialConsentData) {
      console.log("Initial consent data:", initialConsentData);
    }
  }, [initialConsentData]);

  useEffect(() => {
    if (days !== null) {
      // Randomize quote on result
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      // Calculate next milestone using our new system
      const nextMilestone = getNextMilestone(days, new Date(birthDate));
      if (nextMilestone) {
        setNextMilestone(nextMilestone.cycles);
        const toNext = nextMilestone.cycles - days;
        setDaysToMilestone(toNext);
        const d = new Date();
        d.setDate(d.getDate() + toNext);
        setMilestoneDate(
          d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")
        );
      }

      // Check if we've reached a milestone and should send notification
      if (isFramePinned && context?.user?.fid) {
        // Send notification for every 1000 days milestone
        if (days % 1000 === 0 && days !== lastMilestoneNotified) {
          fetch('/api/milestone-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fid: context.user.fid,
              type: 'milestone',
              message: `Congratulations! You've completed ${days} rotations around the sun!`,
              timestamp: new Date().toISOString()
            }),
          }).then(() => {
            setLastMilestoneNotified(days);
          }).catch(console.error);
        }
      }
    } else {
      setNextMilestone(null);
      setDaysToMilestone(null);
      setMilestoneDate(null);
      setQuote(quotes[0]);
    }
  }, [days, quotes, isFramePinned, context?.user?.fid, lastMilestoneNotified, birthDate]);

  // Animation state: only animate after calculation
  const isAnimated = days !== null;

  // Save to phone (placeholder)
  const onSaveToPhone = () => {
    alert('Save to phone functionality coming soon!');
  };

  const calculateAge = () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365.25);
    
    // Navigate to results page with query parameters
    router.push(`/results?days=${totalDays}&approxYears=${years}&birthDate=${birthDate}`);
  };

  const onShare = async () => {
    if (days === null) return;
    setIsSharing(true);
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const message = `Forget birthdays—I've completed ${days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
    try {
      // Use window.location.href for sharing
      window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  // Progressive disclosure state
  const [showDetails, setShowDetails] = useState(false);

  // Example astronomy facts
  const facts = [
    "The Earth travels about 940 million kilometers in one orbit around the Sun.",
    "A year on Mercury is just 88 Earth days.",
    "The Sun makes up 99.8% of the mass in our solar system.",
    "It takes sunlight about 8 minutes and 20 seconds to reach Earth.",
    "The Earth's axis is tilted 23.5 degrees, giving us seasons."
  ];
  const randomFact = facts[Math.floor(days !== null ? days % facts.length : 0)];

  // Bookmark state
  const [bookmark, setBookmark] = useState<{
    days: number;
    approxYears: number;
    birthDate: string;
    lastVisitDays?: number;
    lastVisitDate?: string;
  } | null>(null);

  // Add a state to control showing the bookmark card or calculation page
  const [showBookmark, setShowBookmark] = useState(true);

  // Main content (header, orbits, form) container
  const showMain = !showBookmark && days === null;

  // Update useEffect to only show bookmark if it exists
  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookmark(parsed);
        setShowBookmark(true);
      } catch {}
    } else {
      setShowBookmark(false);
    }
  }, []);

  // Add state for bookmark success modal
  const [showBookmarkSuccess, setShowBookmarkSuccess] = useState(false);

  // Update handleBookmark to show success modal
  const handleBookmark = () => {
    if (days !== null && approxYears !== null && birthDate) {
      const now = new Date();
      const data = {
        days,
        approxYears,
        birthDate,
        lastVisitDays: days,
        lastVisitDate: now.toISOString(),
      };
      localStorage.setItem("sunCycleBookmark", JSON.stringify(data));
      setBookmark(data);
      setShowBookmarkSuccess(true); // Show success modal

      // Log Farcaster context state
      console.log("Farcaster context state:", {
        hasContext: !!context,
        hasUser: !!context?.user,
        fid: context?.user?.fid,
        isFramePinned,
        isInFrame,
        contextDetails: context,
        frameState: {
          isPinned: isFramePinned,
          isInFrame,
          hasUser: !!context?.user,
          hasFid: !!context?.user?.fid
        }
      });

      // Farcaster user
      if (isInFrame && context?.user?.fid) {
        console.log("Storing bookmark for Farcaster user:", {
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          isFramePinned,
          frameState: {
            isPinned: isFramePinned,
            isInFrame,
            hasUser: !!context?.user,
            hasFid: !!context?.user?.fid
          }
        });
        fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fid: context.user.fid, 
            user_type: 'farcaster',
            is_frame_pinned: isFramePinned,
            has_pinned: isFramePinned,
            notifications_enabled: isFramePinned
          }),
        }).then(response => {
          console.log("Bookmark API response:", response);
          return response.json();
        }).then(data => {
          console.log("Bookmark API data:", data);
        }).catch(error => {
          console.error("Error storing Farcaster bookmark:", error);
        });
      } else {
        // Browser user: generate/store anon_id
        let anon_id = localStorage.getItem('sunCycleAnonId');
        if (!anon_id) {
          anon_id = crypto.randomUUID();
          localStorage.setItem('sunCycleAnonId', anon_id);
        }
        console.log("Storing bookmark for browser user:", anon_id);
        fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            anon_id, 
            user_type: 'browser',
            is_frame_pinned: false
          }),
        }).catch(error => {
          console.error("Error storing browser bookmark:", error);
        });
      }
    }
  };

  // Clear bookmark
  const handleClearBookmark = () => {
    localStorage.removeItem("sunCycleBookmark");
    setBookmark(null);
  };

  // Calculate milestone for bookmark
  type MilestoneObj = { nextMilestone: number; daysToMilestone: number; milestoneDate: string; type?: string };
  let bookmarkMilestone: MilestoneObj | null = null;
  if (bookmark) {
    const bDays = bookmark.days;
    const bBirthDate = bookmark.birthDate;
    // Use getNextMilestone to get all possible milestones
    const allMilestones = [] as MilestoneObj[];
    // 1. Next 1000-day interval
    const nextInterval = Math.ceil((bDays + 1) / milestoneStep) * milestoneStep;
    const toNextInterval = nextInterval - bDays;
    const dInterval = new Date(bBirthDate);
    dInterval.setDate(dInterval.getDate() + bDays + toNextInterval);
    allMilestones.push({
      type: 'interval',
      nextMilestone: nextInterval,
      daysToMilestone: toNextInterval,
      milestoneDate: dInterval.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")
    });
    // 2. Next birthday (solar return)
    const today = new Date();
    const nextBirthday = new Date(bBirthDate);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const cyclesAtBirthday = bDays + daysToBirthday;
    allMilestones.push({
      type: 'solar_return',
      nextMilestone: cyclesAtBirthday,
      daysToMilestone: daysToBirthday,
      milestoneDate: nextBirthday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")
    });
    // 3. Find the soonest milestone
    const soonest: MilestoneObj = allMilestones.reduce((a, b) => (a.daysToMilestone < b.daysToMilestone ? a : b));
    bookmarkMilestone = soonest;
  }

  // Add state for recalc and clear confirmation:
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Add state for modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // Compute next numerical milestones (after birth date is entered)
  const nextNumericalMilestones = (bookmark && showBookmark)
    ? getNextNumericalMilestones(bookmark.days, new Date(bookmark.birthDate), 10)
    : (days !== null && birthDate)
      ? getNextNumericalMilestones(days, new Date(birthDate), 10)
      : [];
  const nextMilestoneObj = nextNumericalMilestones.length > 0 ? nextNumericalMilestones[0] : null;

  // Helper for Farcaster-aware link
  function OccultureLink() {
    const { isInFrame } = useFrameSDK();
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isInFrame) {
        e.preventDefault();
        import("@farcaster/frame-sdk").then(({ sdk }) => {
          sdk.actions.openUrl("https://warpcast.com/~/channel/occulture");
        });
      }
    };
    return (
      <a
        href="https://warpcast.com/~/channel/occulture"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-blue-600 transition-colors"
        onClick={handleClick}
      >
        /occulture
      </a>
    );
  }

  // Add state for error handling
  const [error, setError] = useState<Error | null>(null);

  // Add state for commit modal and flow
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Add state for dev commit button toggle
  const [devShowCommit, setDevShowCommit] = useState(true);

  // Effect to sync devShowCommit with window.__showCommitButton
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__showCommitButton = devShowCommit;
    }
  }, [devShowCommit]);

  // Helper to determine if commit button should show
  const shouldShowCommit = (context?.user?.fid || devShowCommit);

  // Debug logging
  useEffect(() => {
    console.log('SunCycleAge debug:', {
      devShowCommit,
      hasFid: !!context?.user?.fid,
      shouldShowCommit,
      onCommit: devShowCommit ? handleCommit : undefined,
      days,
      showResultCard: days !== null
    });
  }, [devShowCommit, context?.user?.fid, shouldShowCommit, days]);

  // Go to bookmark page with convergence tab
  const handleCommit = () => {
    setShowBookmark(true);
    setShowConvergenceTab(true);
  };

  // State to control showing convergence tab after commit
  const [showConvergenceTab, setShowConvergenceTab] = useState(false);

  // Tooltip modal state
  const [showTooltip, setShowTooltip] = useState(false);

  // TOP-LEVEL CONDITIONAL: If not in a Farcaster frame, only show bookmarks/calculate UI
  if (!isInFrame) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="max-w-md w-full flex flex-col items-center space-y-6 mt-24 px-4">
          <Image src="/sunsun.png" alt="Sun" width={72} height={72} className="w-16 h-16 object-contain mx-auto mb-2" priority />
          <div className="text-2xl font-serif font-bold mb-2 text-center">Solara</div>
          <div className="text-sm font-mono text-gray-500 text-center mb-4">Farcaster features are only available in Warpcast.<br />You can still calculate and bookmark your Sol Age below.</div>
          <FormSection birthDate={birthDate} setBirthDate={setBirthDate} calculateAge={() => {
            if (!birthDate) return;
            const birth = new Date(birthDate);
            const now = new Date();
            const diffMs = now.getTime() - birth.getTime();
            const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const years = Math.floor(totalDays / 365.25);
            setDays(totalDays);
            setApproxYears(years);
          }} />
          {days !== null && (
            <ResultCard
              days={days}
              approxYears={approxYears ?? 0}
              nextMilestone={null}
              daysToMilestone={null}
              milestoneDate={null}
              quote={"Sun cycle age measures your existence through rotations around our star. One day = one rotation."}
              showDetails={false}
              setShowDetails={() => {}}
              onShare={() => {}}
              isSharing={false}
              onRecalculate={() => setDays(null)}
              bookmark={null}
              handleBookmark={() => {}}
              formattedDate={""}
              milestoneCard={null}
              onCommit={undefined}
              isCommitting={false}
              birthDate={birthDate}
            />
          )}
        </div>
      </div>
    );
  }

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Sun Cycle Age...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center bg-white">
      {/* Top Section: Solar System + Tagline with off-white background */}
      <div className="w-full flex flex-col items-center" style={{ background: 'rgba(255,252,242,0.5)' }}>
        <div className="w-full flex justify-center mb-8 mt-28">
          <div className="mx-auto" style={{ maxWidth: 360, width: '100%' }}>
            <SolarSystemGraphic />
          </div>
        </div>
        {/* Tagline and Tooltip Trigger as 3-column layout */}
        <div className="w-full flex flex-row items-center justify-between px-4 mb-10 max-w-md mx-auto" style={{ minHeight: 56 }}>
          <div className="flex-1" />
          <div className="flex-[4] flex items-center justify-center">
            <span
              className="block text-center"
              style={{
                fontFamily: 'GT Alpina, serif',
                fontWeight: 100,
                fontSize: '26pt',
                lineHeight: '24pt',
                letterSpacing: '-0.06em',
                color: '#222'
              }}
            >
              measure your age in<br />solar rotations*
            </span>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              aria-label="Solara explained"
              onClick={() => setShowTooltip(true)}
              className="w-10 h-10 flex items-center justify-center bg-white focus:outline-none transition-colors ml-4"
              style={{ border: 'none', borderRadius: 0, padding: 0, fontFamily: 'Geist Mono, monospace', fontWeight: 400 }}
            >
              <Image src="/asterisk_icon.svg" alt="*" width={32} height={32} style={{ display: 'block', width: 32, height: 32 }} />
            </button>
          </div>
        </div>
      </div>
      {/* Divider line between sections */}
      <div className="w-full h-px bg-gray-200" style={{ margin: 0 }} />
      {/* Add more space between divider and form */}
      <div style={{ height: 24 }} />
      
      {/* Show the form */}
      <div className="w-full flex flex-col items-center pb-0 px-2 max-w-[390px] mx-auto bg-white mb-0">
        <FormSection birthDate={birthDate} setBirthDate={setBirthDate} calculateAge={calculateAge} />
      </div>

      {/* Show ResultCard after calculation */}
      {days !== null && (
        <ResultCard
          days={days}
          approxYears={approxYears ?? 0}
          nextMilestone={nextMilestone}
          daysToMilestone={daysToMilestone}
          milestoneDate={milestoneDate}
          quote={quote}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onShare={onShare}
          isSharing={isSharing}
          onRecalculate={calculateAge}
          bookmark={bookmark}
          handleBookmark={handleBookmark}
          formattedDate={formattedDate}
          milestoneCard={null}
          onCommit={devShowCommit ? handleCommit : undefined}
          isCommitting={isCommitting}
          birthDate={birthDate}
        />
      )}
      
      {/* Tooltip Modal and Gradient Overlay */}
      {showTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Restore the colorful sunrise gradient overlay (no blur) */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          {/* Modal with blur effect */}
          <div className="relative z-10">
            <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-2xl" style={{ fontFamily: 'GT Alpina, serif', fontWeight: 300, letterSpacing: '-0.06em' }}>Solara, explained</div>
                <button onClick={() => setShowTooltip(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
              </div>
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase">MEASURE YOUR SOL AGE AND BECOME ONE WITH YOUR INNER SELF</div>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⭐️</span>
                  <div>
                    <div className="text-lg mb-1" style={{ fontFamily: 'GT Alpina, serif', fontWeight: 300, letterSpacing: '-0.06em' }}>Find your solar age</div>
                    <div className="text-sm" style={{ fontFamily: 'Geist, Geist Mono, monospace', fontWeight: 400 }}>
                      One day = one rotation. Enter your birth date to see how many rotations you&apos;ve completed.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🌌</span>
                  <div>
                    <div className="text-lg mb-1" style={{ fontFamily: 'GT Alpina, serif', fontWeight: 300, letterSpacing: '-0.06em' }}>Align yourself with the cosmos</div>
                    <div className="text-sm" style={{ fontFamily: 'Geist, Geist Mono, monospace', fontWeight: 400 }}>
                      Track meaningful numbers in your orbit and use those milestones to reflect and celebrate.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔋</span>
                  <div>
                    <div className="text-lg mb-1" style={{ fontFamily: 'GT Alpina, serif', fontWeight: 300, letterSpacing: '-0.06em' }}>Pledge a commitment to yourself</div>
                    <div className="text-sm" style={{ fontFamily: 'Geist, Geist Mono, monospace', fontWeight: 400 }}>
                      Bank $SOLAR energy behind promises to yourself. Get rewarded for follow-through.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Footer - close to form, not at bottom */}
      <footer className="w-full border-t border-gray-200 bg-transparent pt-2 pb-2">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-gray-500 text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { BookmarkCard };