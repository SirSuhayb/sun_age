"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import Image from 'next/image';
import ResultCard from '~/components/SunCycleAge/ResultCard';
import { sdk } from '@farcaster/frame-sdk';
import { SignInButton, useProfile } from '@farcaster/auth-kit';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { context } = useFrameSDK();

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

  // Handlers
  const handleShare = async () => {
    if (!days) return;
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const message = `Forget birthdays—I've completed ${days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
    window.location.href = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
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
      // Navigate to /soldash after saving
      router.push('/soldash?tab=sol%20age');
    }
  };

  if (!days || !birthDate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No calculation data found. Please calculate your age first.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Calculate Age
          </button>
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

  // Add state for details toggle
  const [showDetails, setShowDetails] = useState(false);
  // Add state for sharing
  const [isSharing, setIsSharing] = useState(false);

  // Handler for commit (show ceremony modal)
  const handleCommit = () => setShowCeremonyModal(true);

  // Remove old handleConnect logic
  // Add AuthKit connect button logic
  function ConnectForCosmicConvergence() {
    const { profile } = useProfile();

    if (profile) {
      if (typeof window !== 'undefined') {
        window.location.href = '/ceremony';
      }
      return null;
    }

    return (
      <SignInButton>
        CONNECT FOR COSMIC CONVERGENCE
      </SignInButton>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative">
      <div className="max-w-md mx-auto w-full px-6 pt-8 pb-6 min-h-[60vh]">
        <ResultCard
          days={days}
          approxYears={approxYears ?? 0}
          nextMilestone={null}
          daysToMilestone={null}
          milestoneDate={null}
          quote={"Sun cycle age measures your existence through rotations around our star. One day = one rotation."}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onShare={handleShare}
          isSharing={isSharing}
          onRecalculate={handleRecalculate}
          bookmark={null}
          handleBookmark={handleBookmark}
          formattedDate={formattedDate}
          milestoneCard={null}
          onCommit={shouldShowCommit ? handleCommit : undefined}
          isCommitting={false}
          birthDate={birthDate}
        />
        {/* Add the AuthKit connect button below the ResultCard if not signed in */}
        <div className="mt-6 w-full flex justify-center">
          <ConnectForCosmicConvergence />
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
              The Cosmic Convergence is a ceremony where accumulated rotations around our star crystallize into $SOLAR tokens. Only committed cosmic travelers who inscribe a Solar Vow will receive stellar essence based on their journey's length.<br /><br />
              Or you can simply bookmark and keep tabs on your Sol Age as you reach new milestones in your own cosmic journey.
            </div>
            <button
              className="w-full py-4 mt-2 mb-2 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border-none rounded-none hover:bg-[#e6c75a] transition-colors"
              onClick={() => {
                setShowCeremonyModal(false);
                router.push('/ceremony');
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
      {/* Floating Dev Toggle Button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
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
      </div>
      {/* Local Footer (copied from main page) */}
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