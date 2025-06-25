"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import Image from 'next/image';
import { useConvergenceStats } from '~/hooks/useConvergenceStats';
import { SpinnerButton } from "~/components/ui/SpinnerButton";

export default function ResultsPage() {
  console.log("DEBUG: ResultsPage rendered");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { context, isInFrame, sdk } = useFrameSDK();

  // Check if user is on desktop (not in Farcaster frame)
  const isDesktop = !isInFrame;

  // Dev toggle for showing commit button
  const [devShowCommit, setDevShowCommit] = useState(false);
  const [showDevPopover, setShowDevPopover] = useState(false);
  const shouldShowCommit = Boolean(context?.user?.fid) || devShowCommit;

  // Modal state
  const [showCeremonyModal, setShowCeremonyModal] = useState(false);

  // Add state for ceremony flow
  const [showCeremonyFlow, setShowCeremonyFlow] = useState(false);

  // Get data from URL parameters with null checks
  const daysParam = searchParams?.get('days');
  const approxYearsParam = searchParams?.get('approxYears');
  const birthDateParam = searchParams?.get('birthDate');
  
  const days = daysParam ? Number(daysParam) : null;
  const approxYears = approxYearsParam ? Number(approxYearsParam) : null;
  const birthDate = birthDateParam || null;

  // Get convergence stats
  const { daysRemaining } = useConvergenceStats();

  // Handlers
  const handleShare = async () => {
    if (!days || !birthDate || !approxYears) return;
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const userName = context?.user?.displayName || 'TRAVELLER';
    const ogImageUrl = `${url}/api/og/solage?userName=${encodeURIComponent(userName)}&solAge=${days}&birthDate=${encodeURIComponent(birthDate)}&age=${approxYears}`;
    const message = `Forget birthdays—I've completed ${days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
    if (isInFrame && sdk) {
      await sdk.actions.composeCast({
        text: message,
        embeds: [ogImageUrl]
      });
    } else {
      window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message + '\n\n[My Sol Age Card](' + ogImageUrl + ')')}`;
    }
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

  if (!days || !birthDate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white z-20">
        <div className="w-full max-w-mobile desktop:max-w-desktop-content lg-desktop:max-w-desktop-wide px-4 desktop:px-8">
          <div className="max-w-md w-full mx-auto py-16 border border-gray-200 bg-white/90 shadow text-center">
            <div className="text-2xl font-serif font-bold mb-4 text-black">No Calculation Data</div>
            <div className="text-base font-mono text-gray-600 mb-8">
              We couldn&apos;t find your Sol Age calculation. Please calculate your age to continue.
            </div>
            <SpinnerButton
              onClick={() => router.push('/')}
              className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black hover:bg-[#e6c75a] transition-colors"
            >
              Calculate Age
            </SpinnerButton>
          </div>
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

  return (
    <div className="w-full min-h-screen flex flex-col bg-white relative z-20">
      {/* Main content section with background, border, and margin - full width */}
      <div className="w-full flex flex-col items-center" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
        <div className="w-full max-w-mobile desktop:max-w-desktop-content lg-desktop:max-w-desktop-wide px-4 desktop:px-8">
          <div className="max-w-md mx-auto w-full pt-8 pb-6 min-h-[60vh]">
            {/* Stats Card */}
            <div className="flex flex-col items-center mb-8 mt-32">
              <Image src="/sunsun.png" alt="Sun" width={96} height={96} className="w-24 h-24 object-contain mb-4" style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }} priority />
              <div className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">DEAR TRAVELER, YOU HAVE MADE</div>
              <div className="text-6xl font-serif font-light tracking-tight text-black text-center mb-0">{days.toLocaleString()}</div>
              <div className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">SOLAR ROTATIONS SINCE {birthDate.replace(/-/g, ".")}</div>
              <div className="text-lg font-serif italic text-gray-700 text-center mb-0">~ {approxYears} years old</div>
            </div>
            {/* Solar Journey Callout Card */}
            <div className="w-full flex flex-col items-center border border-gray-500 bg-white p-4 mb-4 shadow" style={{ marginLeft: 0, marginRight: 0 }}>
              <div className="text-4xl mb-2">🌞</div>
              <div className="font-mono font-base text-sm text-gray-900 uppercase tracking-base text-center mb-3">YOUR SOLAR JOURNEY CONTINUES</div>
              <div className="flex items-center justify-center gap-2 text-2xl font-serif font-light text-black mb-2">
                <span role="img" aria-label="star">⭐</span>
                INFINITE
                <span role="img" aria-label="star">⭐</span>
              </div>
              <div className="text-yellow-700 font-mono text-sm font-semibold mt-2 text-center">Your {days.toLocaleString()} rotations represent <br /> your cosmic evolution</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section below main content, on white - full width */}
      <div className="w-full bg-white flex flex-col items-center pt-6 pb-4">
        <div className="w-full max-w-mobile desktop:max-w-desktop-content lg-desktop:max-w-desktop-wide px-4 desktop:px-8">
          <div className="max-w-md mx-auto w-full flex flex-col items-center">
            {/* Only show vow button for Farcaster frame users */}
            {shouldShowCommit && !isDesktop && (
              <button
                className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-medium tracking-base uppercase border border-black hover:bg-[#e6c75a] transition-colors"
                onClick={() => setShowCeremonyModal(true)}
              >
                MAKE YOUR SOLAR VOW
              </button>
            )}
            <div className="flex w-full justify-between items-center mt-2 mb-6">
              <button onClick={handleShare} className="font-mono text-sm text-base underline underline-offset-2">SHARE SOL AGE ↗</button>
              <span className="mx-2 text-gray-400">|</span>
              <button onClick={handleRecalculate} className="font-mono text-sm text-base underline underline-offset-2">CALCULATE AGAIN ↗</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ceremony Modal - only show for Farcaster users */}
      {showCeremonyModal && !isDesktop && (
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
            <div className="text-4xl mb-4">🌞</div>
            <div className="text-2xl font-serif font-bold text-center mb-2">Your Solar Vow</div>
            <div className="text-xs font-mono text-center text-gray-600 mb-4 tracking-normal uppercase">THE BEGINNING TO YOUR BRIGHTEST SELF.<br />A PLEDGE TO BECOME BETTER, TOGETHER.</div>
            <div className="text-base text-gray-800 font-sans text-left mb-6">
              A Solar Vow is a sacred commitment to your cosmic journey, inscribed permanently in the celestial record. Share your journey with the community and track your progress through infinite rotations.<br /><br />
              Or you can simply bookmark and keep tabs on your Sol Age as you reach new milestones in your own cosmic journey.
            </div>
            <button
              className="w-full py-4 mt-2 mb-2 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border-none hover:bg-[#e6c75a] transition-colors"
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
              className="w-full py-2 mb-2 bg-transparent text-black font-mono text-base underline underline-offset-2 border-none hover:text-[#d4af37] transition-colors"
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
      
      {/* Floating Dev Toggle Button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
        {process.env.NODE_ENV === 'development' && (
          <>
            <button
              aria-label="Show Dev Toggle"
              onClick={() => setShowDevPopover((v) => !v)}
              className="w-12 h-12 bg-black text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: 24 }}
            >
              <span>⚙️</span>
            </button>
            {showDevPopover && (
              <div className="absolute bottom-14 right-0 bg-white border border-gray-300 shadow-lg p-4 min-w-[220px] flex flex-col items-start" style={{ zIndex: 1200 }}>
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
      
      {/* Local Footer (copied from main page) - full width */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12">
        <div className="w-full max-w-mobile desktop:max-w-desktop-content lg-desktop:max-w-desktop-wide px-4 desktop:px-8 mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm font-mono text-black text-center">
              Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
              built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 