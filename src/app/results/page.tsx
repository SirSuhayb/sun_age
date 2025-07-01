"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import Image from 'next/image';
import { useConvergenceStats } from '~/hooks/useConvergenceStats';
import { SpinnerButton } from "~/components/ui/SpinnerButton";
// import { showScreenshotPrompt } from '~/lib/screenshot';
import Link from 'next/link';
import { getSolarArchetype, solarArchetypeCoreQuotes, solarArchetypeRadiatesWith } from '~/lib/solarIdentity';

export default function ResultsPage() {
  console.log("DEBUG: ResultsPage rendered");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { context, isInFrame, sdk } = useFrameSDK();

  // Dev toggle for showing commit button
  const [devShowCommit, setDevShowCommit] = useState(false);
  const [showDevPopover, setShowDevPopover] = useState(false);
  const shouldShowCommit = Boolean(context?.user?.fid) || devShowCommit;

  // Modal state
  const [showCeremonyModal, setShowCeremonyModal] = useState(false);

  // Add state for ceremony flow
  const [showCeremonyFlow, setShowCeremonyFlow] = useState(false);

  // Add state to track if user has shared/bookmarked
  const [shared, setShared] = useState(false);

  // Add state for bookmark modal
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Get data from URL parameters with null checks
  const daysParam = searchParams?.get('days');
  const approxYearsParam = searchParams?.get('approxYears');
  const birthDateParam = searchParams?.get('birthDate');
  
  const days = daysParam ? Number(daysParam) : null;
  const approxYears = approxYearsParam ? Number(approxYearsParam) : null;
  const birthDate = birthDateParam || null;

  // Get convergence stats
  const { daysRemaining } = useConvergenceStats();

  // Solar identity logic
  const solarIdentity = birthDate ? getSolarArchetype(birthDate) : null;
  const solarQuote = solarIdentity ? solarArchetypeCoreQuotes[solarIdentity] : null;
  const solarRadiates = solarIdentity ? solarArchetypeRadiatesWith[solarIdentity] : null;

  // New combined handler for save and share
  const MINI_APP_LINK = "https://www.solara.fyi";
  const handleShare = async () => {
    handleBookmark();
    await handleShareInternal();
    setShared(true);
  };

  // Separate handler for just sharing (no bookmark)
  const handleShareInternal = async () => {
    if (!days || !birthDate || !approxYears) return;
    const userName = context?.user?.displayName || 'TRAVELLER';
    const profilePicUrl = context?.user?.pfp?.url;
    
    try {
      const { shareSolAge } = await import('~/lib/sharing');
      await shareSolAge(
        days,
        approxYears,
        birthDate,
        userName,
        profilePicUrl,
        solarIdentity || undefined,
        solarQuote || undefined,
        sdk,
        isInFrame
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for bookmark modal confirm
  const handleBookmarkConfirm = () => {
    handleBookmark();
    setShowBookmarkModal(false);
  };

  const handleRecalculate = () => router.push('/');
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
      // Show success message or handle UI feedback
    }
  };

  useEffect(() => {
    // Only auto-redirect if not already on interstitial with all params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasAllParams = params.get('days') && params.get('approxYears') && params.get('birthDate');
      if (!hasAllParams) {
        const saved = localStorage.getItem('sunCycleBookmark');
        if (saved) {
          try {
            const bookmark = JSON.parse(saved);
            if (bookmark.days && bookmark.approxYears && bookmark.birthDate) {
              router.replace(`/interstitial?days=${bookmark.days}&approxYears=${bookmark.approxYears}&birthDate=${bookmark.birthDate}`);
            }
          } catch {}
        }
      }
    }
  }, [router]);

  if (!days || !birthDate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white z-20">
        <div className="max-w-md w-full px-6 py-16 border border-gray-200 bg-white/90 rounded-none shadow text-center">
          <div className="text-2xl font-serif font-bold mb-4 text-black">No Calculation Data</div>
          <div className="text-base font-mono text-gray-600 mb-8">
            We couldn&apos;t find your Sol Age calculation. Please calculate your age to continue.
          </div>
          <SpinnerButton
            onClick={() => router.push('/')}
            className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
          >
            Calculate Age
          </SpinnerButton>
        </div>
      </div>
    );
  }

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, ".");

  // --- NEW RESULTS PAGE DESIGN ---
  return (
    <>
      {/* Results background and content section */}
      <div className="w-full relative overflow-hidden results-bg-section">
        {/* --- BACKGROUND LAYERS --- */}
        {/* Bottom Layer: #FFFCF2 at 50% opacity */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: '#FFFCF2', opacity: 0.5 }}
          aria-hidden="true"
        />
        {/* Middle Layer: sol_constellation.png */}
        <div className="fixed inset-0 w-full h-full z-10 pointer-events-none" style={{ background: 'url(/sol_constellation.png) center/cover no-repeat' }} aria-hidden="true" />
        {/* Top Layer: #FFFCF2 at 10% opacity with more pronounced blur */}
        <div
          className="absolute inset-0 z-20 backdrop-blur"
          style={{ background: '#FFFCF2', opacity: 0.1, backdropFilter: 'blur(10px)' }}
          aria-hidden="true"
        />

        {/* --- FADE-IN ANIMATION FOR CONTENT --- */}
        <div
          className="w-full flex flex-col items-center relative z-30 animate-fadein"
          style={{ animation: 'fadein 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        >
          <div className="w-full flex flex-col items-center justify-center" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
            <div className="max-w-md mx-auto w-full px-6 pt-8 pb-6 min-h-[60vh]">
              {/* Sol Age Stats Section */}
              <div className="relative flex flex-col items-center mb-8 mt-24">
                {/* Pulsating blur */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="pulsing-blur" />
                </div>
                {/* Sun image */}
                <Image src="/sunsun.png" alt="Sun" width={120} height={120} className="w-28 h-28 object-contain mb-4 z-10" style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }} />
              </div>
              <div className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">DEAR TRAVELER, YOU HAVE MADE</div>
              <div className="text-7xl font-serif font-light tracking-tight text-black text-center mb-0 leading-none">{days.toLocaleString()}</div>
              <div className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 mt-2">SOLAR ROTATIONS SINCE {birthDate.replace(/-/g, ".")}</div>
              <div className="text-lg font-serif italic text-gray-700 text-center mb-0 mt-1">~ {approxYears} years old</div>

              {/* Solar Identity Card and Affirmation */}
              <div className="w-full flex flex-col items-center border border-[#e6d8b4] bg-[#fcf7e8] rounded-none p-6 mt-8 mb-8 mx-0" style={{ marginLeft: 0, marginRight: 0, borderTopWidth: 5 }}>
                <div className="text-center text-base font-mono text-[#bfa12e] uppercase tracking-widest mb-2 font-semibold">your solar identity is</div>
                <div className="text-2xl font-serif font-bold text-black text-center mb-3 flex items-center justify-center gap-2">
                  <Image src="/sun-face.png" alt="Sun" width={32} height={32} className="w-8 h-8 object-contain" />
                  {solarIdentity}
                  <Image src="/sun-face.png" alt="Sun" width={32} height={32} className="w-8 h-8 object-contain" />
                </div>
                <div className="w-full border border-gray-400 bg-white rounded-none p-4 my-2 text-center">
                  <div
                    className="font-serif italic text-black mb-0"
                    style={{ fontSize: '23px', lineHeight: '23px', letterSpacing: '-0.02em' }}
                  >
                    {solarQuote}
                  </div>
                </div>
                {solarRadiates && (
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-4 text-center w-full">{solarRadiates.replace(/^Their /, 'Your ')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* --- FADE-IN KEYFRAMES --- */}
        <style jsx global>{`
          @keyframes fadein {
            0% { opacity: 0; transform: translateY(32px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadein {
            animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
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
      {/* Footer/CTA section below main content, on white */}
      <div className="w-full bg-white flex flex-col items-center pt-6 pb-4 z-40">
        <div className="max-w-md mx-auto w-full px-6 flex flex-row items-center gap-4">
          <button
            onClick={() => router.push(`/interstitial?days=${days}&approxYears=${approxYears}&birthDate=${birthDate}`)}
            className="flex-1 h-16 py-2 px-2 bg-[#d4af37] text-black font-mono text-base tracking-tight uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors flex items-center justify-center"
            style={{ minWidth: 0 }}
          >
            EXPLORE YOUR INNER SOL
          </button>
          <button
            onClick={handleShareInternal}
            className="flex-1 h-16 py-0 px-0 bg-white text-black font-mono text-base tracking-tight uppercase border border-black rounded-none hover:bg-[#f5e7b2] transition-colors flex items-center justify-center"
            style={{ minWidth: 0 }}
          >
            SHARE SOL AGE
          </button>
        </div>
        <div className="flex w-full justify-center items-center mt-6 mb-2">
          <button onClick={handleRecalculate} className="font-mono text-base underline underline-offset-2 tracking-wide">CALCULATE AGAIN ↗</button>
        </div>
      </div>
      {/* Ceremony Modal */}
      {showCeremonyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Sunrise gradient overlay, matching tooltip modal */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          {/* Modal with blur, border, and offwhite background */}
          <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto flex flex-col items-center animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
              aria-label="Close"
              onClick={() => setShowCeremonyModal(false)}
            >
              ×
            </button>
            <Image src="/cosmicConverge_large.svg" alt="Cosmic Convergence" width={120} height={60} className="mb-4" />
            <div className="text-2xl font-serif font-bold text-center mb-2">The Cosmic Convergence</div>
            <div className="text-xs font-mono text-center text-gray-600 mb-4 tracking-normal uppercase">THE BEGINNING TO YOUR BRIGHTEST SELF.<br />A PLEDGE TO BECOME BETTER, TOGETHER.</div>
            <div className="text-base text-gray-800 font-sans text-left mb-6">
              The Cosmic Convergence is a ceremony where accumulated rotations around our star crystallize into $SOLAR tokens. Only committed cosmic travelers who inscribe a Solar Vow will receive stellar essence based on their journey&apos;s length.<br /><br />
              Or you can simply bookmark and keep tabs on your Sol Age as you reach new milestones in your own cosmic journey.
            </div>
            <button
              className="w-full py-4 mt-2 mb-2 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border-none rounded-none hover:bg-[#e6c75a] transition-colors"
              onClick={() => {
                setShowCeremonyModal(false);
                // Try to get from URL params first
                let targetDays = days;
                let targetBirthDate = birthDate;
                let targetApproxYears = approxYears;
                console.log('[Ceremony Modal] Initial:', { days, birthDate, approxYears });
                if ((!targetDays || !targetBirthDate || !targetApproxYears) && typeof window !== 'undefined') {
                  const saved = localStorage.getItem('sunCycleBookmark');
                  if (saved) {
                    try {
                      const bookmark = JSON.parse(saved);
                      if (bookmark.days && bookmark.birthDate && bookmark.approxYears) {
                        targetDays = bookmark.days;
                        targetBirthDate = bookmark.birthDate;
                        targetApproxYears = bookmark.approxYears;
                        console.log('[Ceremony Modal] Fallback to bookmark:', { days: bookmark.days, birthDate: bookmark.birthDate, approxYears: bookmark.approxYears });
                      }
                    } catch (e) {
                      console.error('[Ceremony Modal] Error parsing bookmark:', e);
                    }
                  }
                }
                if (targetDays && targetBirthDate && targetApproxYears) {
                  console.log('[Ceremony Modal] Navigating to /ceremony with:', { days: targetDays, birthDate: targetBirthDate, approxYears: targetApproxYears });
                  router.push(`/ceremony?days=${targetDays}&birthDate=${targetBirthDate}&approxYears=${targetApproxYears}`);
                } else {
                  alert('No calculation data found. Please calculate your Sol Age first.');
                  router.push('/');
                }
              }}
            >
              I WANT TO TAKE A VOW
            </button>
            <button
              className="w-full py-2 mb-2 bg-transparent text-black font-mono text-base underline underline-offset-2 border-none rounded-none hover:text-[#d4af37] transition-colors"
              onClick={() => {
                handleBookmark();
                setShowCeremonyModal(false);
                router.push('/soldash?tab=sol%20age');
              }}
            >
              BOOKMARK MY SOL AGE
            </button>
          </div>
        </div>
      )}
      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Sunrise gradient overlay, matching tooltip modal */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          {/* Modal with blur, border, and offwhite background */}
          <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto flex flex-col items-center animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
              aria-label="Close"
              onClick={() => setShowBookmarkModal(false)}
            >
              ×
            </button>
            <div className="text-2xl font-serif font-bold text-center mb-2">Bookmark Your Sol Age</div>
            <div className="text-xs font-mono text-center text-gray-600 mb-4 tracking-normal uppercase">TRACK MILESTONES, COSMIC EVENTS, AND REFLECT ON YOUR JOURNEY</div>
            <div className="text-base text-gray-800 font-sans text-left mb-6">
              Bookmarking your Sol Age allows you to:
              <ul className="list-disc ml-6 mt-2 mb-2">
                <li>Track your progress toward new milestones</li>
                <li>Be notified of upcoming cosmic events</li>
                <li>Reflect on your journey with affirmations and insights</li>
              </ul>
              Stay connected to your cosmic journey and never miss a moment of growth.
            </div>
            <button
              className="w-full py-4 mt-2 mb-2 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border-none rounded-none hover:bg-[#e6c75a] transition-colors"
              onClick={handleBookmarkConfirm}
            >
              Confirm and Bookmark
            </button>
            <button
              className="w-full py-2 mb-2 bg-transparent text-black font-mono text-base underline underline-offset-2 border-none rounded-none hover:text-[#d4af37] transition-colors"
              onClick={() => setShowBookmarkModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Floating Dev Toggle Button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
        {process.env.NODE_ENV === 'development' && (
          <>
            <button
              aria-label="Show Dev Toggle"
              onClick={() => setShowDevPopover((v) => !v)}
              className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: 24 }}
            >
              <span>⚙️</span>
            </button>
            {showDevPopover && (
              <div className="absolute bottom-14 right-0 bg-white border border-gray-300 rounded shadow-lg p-4 min-w-[220px] flex flex-col items-start" style={{ zIndex: 1200 }}>
                <label className="font-mono text-xs mb-2">Show Farcaster Commit Button (dev):</label>
                <input
                  type="checkbox"
                  checked={devShowCommit}
                  onChange={e => setDevShowCommit(e.target.checked)}
                  className="mr-2"
                />
                <button
                  className="mt-2 text-xs text-gray-500 underline"
                  onClick={() => setShowDevPopover(false)}
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Local Footer (copied from main page) */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12 z-40">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>
    </>
  );
} 