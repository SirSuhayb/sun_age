"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkCard } from "../../components/SunCycleAge";
import { getNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "../../lib/milestones";
import MilestoneCard from "../../components/SunCycleAge/MilestoneCard";
import { useSolarPledge } from "../../hooks/useSolarPledge";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { SpinnerButton } from "~/components/ui/SpinnerButton";
import { useAccount } from 'wagmi';
import Image from "next/image";
import { PulsingStarSpinner } from "~/components/ui/PulsingStarSpinner";
import { getSolarArchetype, solarArchetypeCoreQuotes } from '~/lib/solarIdentity';

// Bookmark type
interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
  userName?: string;
}

export default function SolDashPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInFrame, sdk } = useFrameSDK();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const { hasPledged: onChainHasPledged, onChainVow, refetchOnChainPledge, isLoading, onChainPledge } = useSolarPledge();
  const [ceremony, setCeremony] = useState({ hasPledged: false, vow: "" });
  const { address } = useAccount();

  // Get the tab from URL query parameter and normalize it
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return 'sol age'; // Default to sol age if no tab specified
    
    // Normalize the tab parameter
    const normalizedTab = tabParam.toLowerCase().trim();
    
    // Map URL values to tab names
    if (normalizedTab === 'sol%20age' || normalizedTab === 'sol age' || normalizedTab === 'solage') {
      return 'sol age';
    }
    if (normalizedTab === 'sol%20vows' || normalizedTab === 'sol vows' || normalizedTab === 'solvows') {
      return 'sol vows';
    }
    if (normalizedTab === 'journal') {
      return 'journal';
    }
    if (normalizedTab === 'sol%20sign' || normalizedTab === 'sol sign' || normalizedTab === 'solsign') {
      return 'sol sign';
    }
    
    // Default fallback
    return 'sol age';
  };

  const initialTab = getInitialTab();

  console.log('[SolDashPage] Render with:', {
    address,
    onChainHasPledged,
    onChainVow,
    isLoading,
    initialTab,
    tabParam: searchParams.get('tab')
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
      <div className="w-full min-h-screen flex flex-col bg-white relative">
        <div className="w-full flex flex-col items-center flex-grow" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
          <div className="max-w-md mx-auto w-full px-6 pt-16 pb-8 min-h-[60vh] flex flex-col items-center justify-center">
            {/* Cosmic-themed error state */}
            <div className="text-center space-y-6">
              {/* Sun icon */}
              <div className="relative">
                <Image
                  src="/sunsun.png"
                  alt="Sun"
                  width={80}
                  height={80}
                  className="object-contain mx-auto opacity-60"
                  style={{ filter: 'drop-shadow(0 0 20px #FFD700cc)' }}
                  priority
                />
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                  No Cosmic Journey Found
                </h1>
                <p className="text-sm font-mono text-gray-600 tracking-wide">
                  YOU HAVEN&apos;T CALCULATED YOUR SOL AGE YET
                </p>
              </div>
              
              {/* Description */}
              <div className="text-sm text-gray-700 leading-relaxed max-w-sm">
                <p>
                  To access your Solara dashboard, you need to first calculate your Sol Age and create a bookmark. 
                  This will unlock your cosmic journey tracking, milestone notifications, and reflection tools.
                </p>
              </div>
              
              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                >
                  CALCULATE YOUR SOL AGE
                </button>
              </div>
              
              {/* Additional info */}
              <div className="text-xs font-mono text-gray-500 tracking-widest uppercase pt-4">
                <p>YOUR COSMIC JOURNEY AWAITS</p>
              </div>
            </div>
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
      <PulsingStarSpinner />
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
    <div className="w-full min-h-screen flex flex-col bg-white relative">
      <div className="w-full flex flex-col items-center flex-grow" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
        <div className="max-w-md mx-auto w-full px-2 pt-8 pb-8 min-h-[60vh]">
          <BookmarkCard
            bookmark={bookmark}
            milestone={milestone}
            milestoneDate={milestoneDate}
            daysToMilestone={daysToMilestone}
            onRecalculate={handleRecalculate}
            onClear={() => setShowConfirmClear(true)}
            isRecalculating={isRecalculating}
            sinceLastVisit={bookmark.lastVisitDays ? bookmark.days - bookmark.lastVisitDays : 0}
            milestoneCard={milestoneCard}
            showMilestoneModal={showMilestoneModal}
            setShowMilestoneModal={setShowMilestoneModal}
            nextNumericalMilestones={nextNumericalMilestones}
            onShare={async () => {
              setIsSharing(true);
              try {
                const { shareSolAge } = await import('~/lib/sharing');
                const archetype = bookmark.birthDate ? getSolarArchetype(bookmark.birthDate) : undefined;
                const quote = archetype ? solarArchetypeCoreQuotes[archetype] : undefined;
                await shareSolAge(
                  bookmark.days,
                  bookmark.approxYears,
                  bookmark.birthDate,
                  bookmark.userName || 'TRAVELLER',
                  undefined, // No profile pic in bookmark
                  archetype,
                  quote,
                  sdk,
                  isInFrame
                );
              } catch (err) {
                console.error(err);
              } finally {
                setTimeout(() => setIsSharing(false), 1000);
              }
            }}
            isSharing={isSharing}
            initialTab={initialTab}
            hasPledged={hasPledged}
            vow={vow}
            onSolVowsTab={handleSolVowsTab}
            isLoading={isLoading}
            onChainPledge={onChainPledge}
          />
        </div>
      </div>
      {/* The buttons below are being moved into the BookmarkCard component */}

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