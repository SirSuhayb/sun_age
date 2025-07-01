"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import type { FrameContext } from "@farcaster/frame-core/context";
import Image from "next/image";
import Header from "./SunCycleAge/Header";
import SolarSystemGraphic from "./SunCycleAge/SolarSystemGraphic";
import ResultCard from "./SunCycleAge/ResultCard";
import FormSection from "./SunCycleAge/FormSection";
import MilestoneOrbit from "./SunCycleAge/MilestoneOrbit";
import { getNextMilestone, getProgressToNextMilestone, getNextNumericalMilestones, getNextMilestoneByType } from "~/lib/milestones";
import MilestoneCard from "./SunCycleAge/MilestoneCard";
import sdk from "@farcaster/frame-sdk";
import { useRouter } from "next/navigation";
import { SpinnerButton } from "~/components/ui/SpinnerButton";
import { useConvergenceStats } from '~/hooks/useConvergenceStats';
import type { Pledge } from '~/hooks/useSolarPledge';
import { Journal } from './Journal/Journal';
import { PulsingStarSpinner } from "~/components/ui/PulsingStarSpinner";
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { createClient } from '~/utils/supabase/client';
import { getSolarArchetype, solarArchetypeCoreQuotes } from '~/lib/solarIdentity';
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

function BookmarkCard({ bookmark, milestone, milestoneDate, daysToMilestone, onRecalculate, onClear, isRecalculating, sinceLastVisit, milestoneCard, showMilestoneModal, setShowMilestoneModal, nextNumericalMilestones, onShare, isSharing, initialTab, hasPledged, vow, onSolVowsTab, isLoading, onChainPledge }: {
  bookmark: any;
  milestone: any;
  milestoneDate: any;
  daysToMilestone: any;
  onRecalculate: any;
  onClear: any;
  isRecalculating: any;
  sinceLastVisit: any;
  milestoneCard: any;
  showMilestoneModal: any;
  setShowMilestoneModal: any;
  nextNumericalMilestones: any;
  onShare: any;
  isSharing: any;
  initialTab: any;
  hasPledged: any;
  vow: any;
  onSolVowsTab?: any;
  isLoading?: boolean;
  onChainPledge?: Pledge;
}) {
  const { context, isInFrame, sdk } = useFrameSDK();
  const [tab, setTab] = useState<'sol age' | 'sol vows' | 'journal' | 'sol sign'>(initialTab || 'sol age');
  const { daysRemaining, totalPooled } = useConvergenceStats();
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<Error | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Add touch feedback state
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  // Constants for mini app
  const MINI_APP_URL = 'https://revealcam.fun/reveal/0x2f5d64baefcf66e0218b8d086b08f72619ca895a';
  const MINI_APP_DEEPLINK = 'https://farcaster.xyz/~/mini-apps/launch?url=' + encodeURIComponent(MINI_APP_URL);

  // Check if we're in a mini app
  useEffect(() => {
    const checkMiniApp = async () => {
      if (sdk) {
        try {
          const result = await sdk.isInMiniApp();
          setIsMiniApp(result);
        } catch (error) {
          console.error('Error checking mini app status:', error);
          setIsMiniApp(false);
        }
      }
    };
    checkMiniApp();
  }, [sdk]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleSign = async () => {
    setSignError(null);
    setIsSigning(true);
    setTimeout(() => {
      if (Math.random() < 0.25) {
        setIsSigning(false);
        setSignError(new Error('Failed to sign. Please try again.'));
        return;
      }
      setIsSigning(false);
      setSignSuccess(true);
    }, 1600);
  };

  const handleSignModalClose = () => {
    setIsSigning(false);
    setSignError(null);
    setSignSuccess(false);
  };

  useEffect(() => {
    if (tab === 'sol vows' && typeof onSolVowsTab === 'function') {
      onSolVowsTab();
    }
  }, [tab, onSolVowsTab]);

  const { address } = useAccount();
  const SUNDIAL_ADDRESS = '0x2f5d64baefcf66e0218b8d086b08f72619ca895a';
  const SUNDIAL_IMAGE = '/sundial_sm.jpg';
  const { data: sundialBalanceRaw } = useReadContract({
    address: SUNDIAL_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: 8453,
    query: { enabled: !!address },
  });
  const sundialBalance = sundialBalanceRaw ? Number(sundialBalanceRaw) / 1e18 : 0;

  return (
    <div className="max-w-md w-full flex flex-col items-center sm:space-y-6 relative mt-24 px-0 sm:px-0 h-full">
      <div
        className={`transition-all duration-300 w-full flex flex-col items-center ${
          isScrolled ? 'space-y-1 py-2' : 'space-y-4 py-4'
        }`}
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Pulsating blur */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="pulsing-blur" />
          </div>
          {/* Sun image */}
          <Image
            src="/sunsun.png"
            alt="Sun"
            width={72}
            height={72}
            className={`object-contain mx-auto transition-all duration-300 z-10 ${
              isScrolled ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'
            }`}
            style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
            priority
          />
        </div>
        <div className={`text-center transition-all duration-300 ${isScrolled ? 'opacity-0 h-0' : 'opacity-100'}`}>
          <div className="text-xs font-mono tracking-widest text-gray-600 uppercase mb-2">WELCOME BACK TRAVELER...</div>
          <div className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-black mb-1">{bookmark.days} <span className="font-serif">Sol Age</span></div>
          <div className="text-xs font-mono text-gray-600 mb-2">+{sinceLastVisit} since your last visit</div>
        </div>
      </div>
      
      {/* Enhanced Tabs with better mobile support */}
      <div className="flex w-full border-b border-gray-300 overflow-x-auto sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        {['sol age', 'sol vows', 'journal', 'sol sign'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName as any)}
            className={`flex-1 min-w-[100px] py-3 px-2 text-xs font-mono uppercase tracking-widest transition-colors duration-200 ${
              tab === tabName 
                ? 'border-b-2 border-black font-bold' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tabName.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content with improved mobile spacing */}
      <div className="w-full overflow-y-auto flex-grow p-4" onScroll={handleScroll}>
        {tab === 'sol age' && (
          <div className="w-full text-sm font-mono space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-600">FROM BIRTH</span>
              <span className="font-bold text-right">{bookmark.days.toLocaleString()} DAYS</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-600">BIRTH DATE</span>
              <span className="font-bold text-right">{bookmark.birthDate.replace(/-/g, ".")}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
              <span className="text-gray-600">NEXT MILESTONE</span>
              <span className="font-bold text-right">{milestone.emoji} {milestone.label} <span className="font-normal">(in {daysToMilestone} days)</span></span>
            </div>
            
            {/* Enhanced Milestone Card Section */}
            {milestoneCard && (
              <div className="w-full flex flex-col items-center my-4">
                {milestoneCard}
                <button
                  className="mt-3 text-sm underline text-black hover:text-gray-800 font-mono font-semibold transition-colors duration-200"
                  onClick={() => setShowMilestoneModal(true)}
                >
                  View More Milestones ↗
                </button>
                
                {/* Enhanced Modal */}
                {showMilestoneModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Sunrise gradient overlay */}
                    <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
                    {/* Modal with blur effect */}
                    <div className="relative z-10 w-full">
                      <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-2xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>Upcoming Milestones</div>
                          <button onClick={() => setShowMilestoneModal(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
                        </div>
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
                                <div key={type} className="hover:bg-gray-50 p-2 rounded transition-colors">
                                  <div className="font-mono text-xs uppercase tracking-widest text-gray-600 mb-1">{label}</div>
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
                          <button className="px-6 py-2 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-gray-200 transition-colors" onClick={() => setShowMilestoneModal(false)}>CLOSE</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Enhanced Divider and Quote */}
            <div className="border-t border-gray-300 my-4" />
            <div className="text-xs font-sans text-gray-600 italic text-left p-2 bg-gray-50 rounded">
              Your journey began {bookmark.days.toLocaleString()} days ago. Each rotation represents both repetition and change.
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <div className="flex gap-2">
                <SpinnerButton
                  onClick={onShare}
                  disabled={isSharing}
                  className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? "SHARING..." : "SHARE SOL AGE"}
                </SpinnerButton>
                <SpinnerButton
                  onClick={onRecalculate}
                  disabled={isRecalculating}
                  isSubmitting={isRecalculating}
                  className="flex-1 border border-black bg-transparent text-black uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-gray-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isRecalculating ? "RECALCULATING..." : "RECALCULATE"}
                </SpinnerButton>
              </div>
              <SpinnerButton
                onClick={onClear}
                className="w-full border border-red-800 bg-red-600 text-white uppercase tracking-widest font-mono py-3 px-2 text-sm transition-all duration-200 hover:bg-red-700 rounded-none"
              >
                CLEAR BOOKMARK
              </SpinnerButton>
            </div>
          </div>
        )}

        {tab === 'sol vows' && (
          isLoading ? (
            <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center text-center">
              <PulsingStarSpinner />
              <span className="font-mono text-xs text-gray-500">Fetching your Solar Vow...</span>
            </div>
          ) : (typeof vow === 'string' && vow.trim().length > 0) ? (
            <div className="w-full text-sm font-mono space-y-3">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-2">🌞</div>
                <div className="text-lg font-bold mb-1">Your Solar Vow</div>
                <div className="italic text-gray-700 border border-gray-200 rounded p-3 bg-white mb-4">{vow}</div>
                {/* Green callout card below the vow text */}
                <PledgeDetailsCard days={onChainPledge ? Number(onChainPledge.solarAge) : bookmark?.days} pledge={onChainPledge ? Number(onChainPledge.usdcPaid) / 1_000_000 : undefined} daysRemaining={daysRemaining} totalPooled={totalPooled} />
              </div>
            </div>
          ) : (
            <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center text-center">
              <div className="text-3xl mb-2">✍️</div>
              <div className="text-lg font-bold mb-1">No Vow Yet</div>
              <div className="text-gray-600 mb-4">You haven&apos;t made your Solar Vow. Make your pledge to join the convergence.</div>
              <button
                className="w-full py-3 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded hover:bg-[#e6c75a] transition-colors"
                onClick={() => window.location.href = '/ceremony'}
              >
                Make Your Solar Vow
              </button>
            </div>
          )
        )}

        {tab === 'journal' && (
          <div className="w-full text-sm font-mono space-y-3">
            <Journal solAge={bookmark.days} />
          </div>
        )}

        {tab === 'sol sign' && (
          <div className="w-full text-sm font-mono space-y-3 flex flex-col items-center text-center">
            {/* SUNDIAL Title */}
            <div className="text-4xl font-serif font-bold mb-2">SUNDIAL</div>
            {/* SUNDIAL Token Image and Label (always show) */}
            <Image
              src="/sundial_sm.jpg"
              alt="$SUNDIAL"
              width={300}
              height={300}
              style={{ margin: '0 auto', filter: sundialBalance > 0 && sundialBalance < 10000000 ? 'blur(8px)' : 'none' }}
              priority
            />
            <div className="text-lg font-bold mt-2 mb-1">$SUNDIAL Token</div>
            <div className="text-2xl font-mono mb-1">{sundialBalance > 0 ? sundialBalance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}</div>
            <div className="text-xs text-gray-500 mb-2">Token: $SUNDIAL</div>
            {/* Callout if balance < 10M */}
            {sundialBalance > 0 && sundialBalance < 10000000 && (
              <div className="mt-2 p-2 bg-yellow-200 border border-yellow-400 text-yellow-900 font-mono text-xs rounded-none">
                You must have at least 10m $SUNDIAL to reveal this image
              </div>
            )}
            {/* Purchase $SUNDIAL Button (mini app aware) */}
            {isMiniApp ? (
              <button
                onClick={() => sdk.actions.openUrl(MINI_APP_DEEPLINK)}
                className="mt-4 inline-block px-6 py-3 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
              >
                Purchase More $SUNDIAL
              </button>
            ) : (
              <a
                href={MINI_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-6 py-3 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
              >
                Purchase More $SUNDIAL
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

BookmarkCard.defaultProps = {
  onSolVowsTab: undefined,
  isLoading: false,
};

// PledgeDetailsCard component
function PledgeDetailsCard({ days, pledge, daysRemaining, totalPooled }) {
  return (
    <div className="w-full border border-green-200 rounded-none p-4 mb-4" style={{ background: '#EFFDF4', color: '#15803D' }}>
      <div className="text-xs font-mono font-bold uppercase mb-2 w-full text-center" style={{ color: '#15803D' }}>
        SOLAR VOW INSCRIBED
      </div>
      <div className="flex flex-col items-center mb-2">
        <div className="text-3xl font-serif font-bold mb-1 flex items-center gap-2" style={{ color: '#15803D' }}>
          <span>⭐</span>
          <span>{days?.toLocaleString?.() ?? ''}</span>
          <span>⭐</span>
        </div>
        <div className="text-xs font-mono uppercase mb-2 text-center" style={{ color: '#15803D', letterSpacing: '0.08em' }}>
          ROTATIONS SEALED IN THE COSMIC LEDGER
        </div>
      </div>
      <div className="w-full h-px bg-green-300 my-2" />
      <div className="grid grid-cols-2 gap-y-1 text-xs font-mono" style={{ color: '#15803D' }}>
        <div className="text-left">VOW ENERGY:</div>
        <div className="text-right font-bold">{pledge !== undefined ? `$${pledge}` : '—'}</div>
        <div className="text-left">SPONSORED CEREMONIES:</div>
        <div className="text-right font-bold">2</div>
        <div className="text-left">COMMUNITY CONSTELLATION:</div>
        <div className="text-right font-bold">{totalPooled !== undefined ? `$${totalPooled.toLocaleString(undefined, { maximumFractionDigits: 2 })} POOLED` : '—'}</div>
        <div className="text-left">COSMIC CONVERGENCE:</div>
        <div className="text-right font-bold">{daysRemaining !== undefined ? `${daysRemaining} DAYS LEFT` : '...'}</div>
      </div>
    </div>
  );
}

export default function SunCycleAge() {
  const { 
    isSDKLoaded, 
    pinFrame, 
    isFramePinned, 
    context, 
    isInFrame,
    loading,
    isConnected,
    address,
    sdk
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
    const userName = context?.user?.displayName || 'TRAVELLER';
    const profilePicUrl = context?.user?.pfp?.url;
    
    try {
      const { shareSolAge } = await import('~/lib/sharing');
      const archetype = birthDate ? getSolarArchetype(birthDate) : undefined;
      const quote = archetype ? solarArchetypeCoreQuotes[archetype] : undefined;
      await shareSolAge(
        days,
        approxYears || 0,
        birthDate,
        userName,
        profilePicUrl,
        archetype,
        quote,
        sdk,
        isInFrame
      );
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
  const [devShowCommit, setDevShowCommit] = useState(false);

  // Effect to sync devShowCommit with window.__showCommitButton
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__showCommitButton = devShowCommit;
    }
  }, [devShowCommit]);

  // Helper to determine if commit button should show
  const shouldShowCommit = (context?.user?.fid || devShowCommit);

  // Go to bookmark page with convergence tab
  const handleCommit = () => {
    setShowBookmark(true);
    setShowConvergenceTab(true);
  };

  // State to control showing convergence tab after commit
  const [showConvergenceTab, setShowConvergenceTab] = useState(false);

  // Tooltip modal state
  const [showTooltip, setShowTooltip] = useState(false);

  const [userConsent, setUserConsent] = useState<any[] | null>(null);
  const [consentLoading, setConsentLoading] = useState(true);

  // Fetch user consent data on the client side
  useEffect(() => {
    const fetchUserConsent = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_notification_details')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching user consent:", error);
        } else {
          console.log("User consent data:", data);
          setUserConsent(data);
        }
      } catch (err) {
        console.error("Error in fetchUserConsent:", err);
      } finally {
        setConsentLoading(false);
      }
    };

    fetchUserConsent();
  }, []);

  // Log initial consent data for debugging
  useEffect(() => {
    if (userConsent) {
      console.log("Initial consent data:", userConsent);
    }
  }, [userConsent]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <PulsingStarSpinner />
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
      {/* Clear bookmark confirmation modal */}
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
                  onClick={() => { handleClearBookmark(); setShowConfirmClear(false); }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .pulsing-blur {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #ffe066;
          filter: blur(32px);
          opacity: 0.7;
          animation: pulse-blur 2.2s infinite cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes pulse-blur {
          0% { transform: scale(1); opacity: 0.7; filter: blur(32px);}
          50% { transform: scale(1.18); opacity: 1; filter: blur(48px);}
          100% { transform: scale(1); opacity: 0.7; filter: blur(32px);}
        }
      `}</style>
    </div>
  );
}

export { BookmarkCard };