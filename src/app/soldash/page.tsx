"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCard } from "../../components/SunCycleAge";
import { getNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "../../lib/milestones";
import MilestoneCard from "../../components/SunCycleAge/MilestoneCard";
import { useSolarPledge } from "../../hooks/useSolarPledge";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { SpinnerButton } from "~/components/ui/SpinnerButton";
import { useAccount } from 'wagmi';
import Image from "next/image";

// Bookmark type
interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
  userName?: string;
}

// Pulsing Star Spinner Component
function PulsingStarSpinner() {
  const frames = ["⋅", "˖", "+", "⟡", "✧", "⟡", "+", "˖"];
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 120);
    return () => clearInterval(interval);
  }, [frames.length]);
  return <span style={{ fontSize: '1.2em', marginRight: 6 }}>{frames[frame]}</span>;
}

export default function SolDashPage() {
  const router = useRouter();
  const { isInFrame, sdk } = useFrameSDK();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const { hasPledged: onChainHasPledged, onChainVow, refetchOnChainPledge, isLoading, onChainPledge } = useSolarPledge();
  const [ceremony, setCeremony] = useState({ hasPledged: false, vow: "" });
  const { address } = useAccount();

  console.log('[SolDashPage] Render with:', {
    address,
    onChainHasPledged,
    onChainVow,
    isLoading
  });

  // Add function to refresh pledge data
  const refreshPledgeData = async () => {
    try {
      // Refresh on-chain pledge data
      const saved = localStorage.getItem("sunCycleCeremony");
      if (saved) {
        try {
          setCeremony(JSON.parse(saved));
        } catch {}
      }
    } catch (error) {
      console.error("Error refreshing pledge data:", error);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    refreshPledgeData();
  }, []);

  useEffect(() => {
    if (address && typeof refetchOnChainPledge === 'function') {
      refetchOnChainPledge();
    }
  }, [address, refetchOnChainPledge]);

  if (!bookmark) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No bookmark found. Calculate your Sol Age first!</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Calculator
          </button>
        </div>
      </div>
    );
  }

  // Calculate milestones and other props
  const milestone = getNextMilestone(bookmark.days, new Date(bookmark.birthDate));
  const daysToMilestone = milestone ? milestone.daysToMilestone : 0;
  const milestoneDate = milestone ? milestone.milestoneDate : "";
  const nextNumericalMilestones = getNextNumericalMilestones(bookmark.days, new Date(bookmark.birthDate), 10);

  const hasPledged = ceremony.hasPledged || onChainHasPledged;
  const vow = isLoading ? (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Spinning SunSun image if available, otherwise fallback to ASCII spinner */}
      <Image src="/sunsun.png" alt="Loading..." width={48} height={48} className="animate-spin mb-2" />
      <span className="font-mono text-xs text-gray-500">Fetching your Solar Vow...</span>
    </div>
  ) : (onChainVow || ceremony.vow);

  // Construct the milestoneCard element for the next milestone
  const milestoneCard = milestone ? (
    <MilestoneCard
      number={milestone.cycles}
      label={milestone.label}
      emoji={milestone.emoji}
      description={milestone.description}
      daysToMilestone={milestone.daysToMilestone}
      milestoneDate={milestone.milestoneDate}
      variant="bookmark"
    />
  ) : null;

  const handleRecalculate = async () => {
    console.log('[SolDashPage] Recalculate triggered');
    setIsRecalculating(true);
    try {
      const saved = localStorage.getItem("sunCycleBookmark");
      if (saved) {
        console.log('[SolDashPage] Updating bookmark data');
        const bookmarkData = JSON.parse(saved);
        const birth = new Date(bookmarkData.birthDate);
        const now = new Date();
        const diffMs = now.getTime() - birth.getTime();
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const years = Math.floor(totalDays / 365.25);
        
        // Update the bookmark with new calculations
        const updatedBookmark = {
          ...bookmarkData,
          days: totalDays,
          approxYears: years,
          lastVisitDays: bookmarkData.days,
          lastVisitDate: now.toISOString()
        };
        
        // Save the updated bookmark
        localStorage.setItem("sunCycleBookmark", JSON.stringify(updatedBookmark));
        
        // Refresh the page data
        setBookmark(updatedBookmark);
        console.log('Updated bookmark:', updatedBookmark);
        
        // Refresh pledge data
        await refreshPledgeData();
        
        console.log('[SolDashPage] Bookmark updated, triggering refetch');
        await refetchOnChainPledge();
      }
    } catch (error) {
      console.error('[SolDashPage] Recalculation error:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSolVowsTab = () => {
    console.log('[SolDashPage] Sol Vows tab activated');
    refetchOnChainPledge();
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative">
      <div className="w-full flex flex-col items-center justify-center" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
        <div className="max-w-md mx-auto w-full px-6 pt-8 pb-8 min-h-[60vh]">
          <BookmarkCard
            bookmark={bookmark}
            milestone={milestone}
            milestoneDate={milestoneDate}
            daysToMilestone={daysToMilestone}
            onRecalculate={handleRecalculate}
            onClear={() => {
              localStorage.removeItem("sunCycleBookmark");
              setBookmark(null);
            }}
            isRecalculating={isRecalculating}
            sinceLastVisit={bookmark.lastVisitDays ? bookmark.days - bookmark.lastVisitDays : 0}
            milestoneCard={milestoneCard}
            showMilestoneModal={showMilestoneModal}
            setShowMilestoneModal={setShowMilestoneModal}
            nextNumericalMilestones={nextNumericalMilestones}
            onShare={async () => {
              setIsSharing(true);
              const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
              const userName = bookmark.userName || 'TRAVELLER';
              const ogImageUrl = `${url}/api/og/solage?userName=${encodeURIComponent(userName)}&solAge=${bookmark.days}&birthDate=${encodeURIComponent(bookmark.birthDate)}&age=${bookmark.approxYears}`;
              const message = `Forget birthdays—I've completed ${bookmark.days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
              if (isInFrame && sdk) {
                await sdk.actions.composeCast({
                  text: message,
                  embeds: [ogImageUrl]
                });
              } else {
                window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message + '\n\n[My Sol Age Card](' + ogImageUrl + ')')}`;
              }
              setTimeout(() => setIsSharing(false), 1000);
            }}
            isSharing={isSharing}
            initialTab="sol vows"
            hasPledged={hasPledged}
            vow={vow}
            onSolVowsTab={handleSolVowsTab}
            isLoading={isLoading}
            onChainPledge={onChainPledge}
          />
        </div>
      </div>
      {/* Actions Section - outside main container, full width */}
      <div className="w-full flex flex-col items-center mt-6 mb-2 px-0">
        <div className="max-w-md w-full px-6">
          <div className="flex w-full gap-2">
            <SpinnerButton
              onClick={() => {
                setIsSharing(true);
                const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
                const userName = bookmark.userName || 'TRAVELLER';
                const ogImageUrl = `${url}/api/og/solage?userName=${encodeURIComponent(userName)}&solAge=${bookmark.days}&birthDate=${encodeURIComponent(bookmark.birthDate)}&age=${bookmark.approxYears}`;
                const message = `Forget birthdays—I've completed ${bookmark.days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}\n\n[My Sol Age Card](${ogImageUrl})`;
                if (isInFrame) {
                  window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`, '_blank');
                } else {
                  window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
                }
                setTimeout(() => setIsSharing(false), 1000);
              }}
              disabled={isSharing}
              className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? "SHARING..." : "SHARE SOL AGE"}
            </SpinnerButton>
            <SpinnerButton
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isRecalculating ? (
                (() => { console.log('Rendering spinner:', isRecalculating); return null; })() || <><PulsingStarSpinner />RECALCULATING...</>
              ) : (
                "RECALCULATE"
              )}
            </SpinnerButton>
          </div>
          <SpinnerButton
            onClick={() => setShowConfirmClear(true)}
            className="w-full border border-red-800 bg-red-600 text-white uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-red-700 rounded-none mt-4 mb-6"
          >
            CLEAR BOOKMARK
          </SpinnerButton>
        </div>
      </div>
      {/* Footer - same as main page */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Sunrise gradient overlay */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          {/* Modal with blur effect */}
          <div className="relative z-10 w-full">
            <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>Clear Bookmark</div>
                <button onClick={() => setShowConfirmClear(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
              </div>
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase">Are you sure you want to clear your bookmark?</div>
              <div className="flex justify-between gap-4 mt-6">
                <button
                  className="flex-1 px-6 py-3 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-base hover:bg-gray-200 transition-colors"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 border border-red-500 bg-red-100 text-red-700 rounded-none uppercase tracking-widest font-mono text-base hover:bg-red-200 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("sunCycleBookmark");
                    setBookmark(null);
                    setShowConfirmClear(false);
                    router.push("/");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 