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
import { getNextMilestone, getProgressToNextMilestone } from "~/lib/milestones";
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogOverlay,
} from "../components/ui/dialog";
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

function BookmarkCard({ bookmark, milestone, milestoneDate, daysToMilestone, onRecalculate, onClear, isRecalculating, sinceLastVisit }) {
  const [tab, setTab] = useState<'age' | 'reflections' | 'signature'>('age');
  return (
    <div className="bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] border border-gray-200 dark:border-gray-700 rounded-none shadow p-8 max-w-md w-full flex flex-col items-center space-y-6 relative mt-0">
      <Image
        src="/sunsun.png"
        alt="Sun"
        width={72}
        height={72}
        className="w-20 h-20 object-contain mx-auto mb-2"
        style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
        priority
      />
      <div className="text-xs font-mono tracking-widest text-gray-500 dark:text-gray-300 text-center uppercase mb-2">WELCOME BACK TRAVELER...</div>
      <div className="text-5xl font-serif font-extrabold tracking-tight text-gray-800 dark:text-white text-center mb-1">{bookmark.days} <span className="font-serif">Sol Age</span></div>
      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 text-center mb-2">+{sinceLastVisit} since your last visit</div>
      {/* Tabs */}
      <div className="flex w-full border-b border-gray-300 dark:border-gray-700 mb-4">
        <button onClick={() => setTab('age')} className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest ${tab==='age' ? 'border-b-2 border-black dark:border-white font-bold' : 'text-gray-400'}`}>Age</button>
        <button onClick={() => setTab('reflections')} className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest ${tab==='reflections' ? 'border-b-2 border-black dark:border-white font-bold' : 'text-gray-400'}`}>Reflections</button>
        <button onClick={() => setTab('signature')} className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest ${tab==='signature' ? 'border-b-2 border-black dark:border-white font-bold' : 'text-gray-400'}`}>Signature</button>
      </div>
      {/* Tab Content */}
      {tab === 'age' && (
        <div className="w-full text-sm font-mono space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">FROM BIRTH</span>
            <span className="font-bold text-right">{bookmark.days.toLocaleString()} DAYS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">NEXT MILESTONE</span>
            <span className="font-bold text-right">{milestone} <span className="font-normal">(in {daysToMilestone} days)</span></span>
          </div>
          {/* Milestone callout box */}
          <div className="w-full mt-1">
            <div className="bg-white/80 dark:bg-neutral-900/80 border border-gray-400 dark:border-gray-700 px-4 py-2 text-xs font-mono text-gray-800 dark:text-gray-100 rounded-none w-full text-center">
              <span className="font-semibold">Solar Return <span role='img' aria-label='sun'>🌞</span></span><br />
              <span className="text-xs">({milestoneDate})</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">BIRTH DATE</span>
            <span className="font-bold text-right">{bookmark.birthDate.replace(/-/g, ".")}</span>
          </div>
          {/* Divider before quote */}
          <div className="border-t border-gray-300 dark:border-gray-700 my-4" />
          <div className="text-xs font-sans text-gray-400 italic text-left">Your journey began {bookmark.days.toLocaleString()} days ago. Each rotation represents both repetition and change.</div>
        </div>
      )}
      {tab === 'reflections' && (
        <div className="w-full text-center text-xs font-mono text-gray-500 py-8 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-900/80">Reflections coming soon.</div>
      )}
      {tab === 'signature' && (
        <div className="w-full text-center text-xs font-mono text-gray-500 py-8 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-900/80">Signature coming soon.</div>
      )}
      {/* Actions */}
      <div className="flex w-full gap-2 mt-6">
        <button
          onClick={onRecalculate}
          disabled={isRecalculating}
          className="flex-1 border border-black dark:border-white bg-transparent dark:bg-black text-black dark:text-white uppercase tracking-widest font-mono py-2.5 px-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
        >
          {isRecalculating ? "RECALCULATING..." : "RECALCULATE"}
        </button>
        <button
          onClick={onClear}
          className="flex-1 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest font-mono py-2.5 px-2 text-sm transition-colors hover:bg-gray-900 dark:hover:bg-gray-100 rounded-none"
        >
          CLEAR BOOKMARK
        </button>
      </div>
    </div>
  );
}

export default function SunCycleAge({ initialConsentData }: SunCycleAgeProps) {
  const { 
    isSDKLoaded, 
    sdk, 
    pinFrame, 
    isFramePinned, 
    context, 
    isInFrame
  } = useFrameSDK();
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
    setDays(totalDays);
    setApproxYears(years);
  };

  const onShare = async () => {
    if (days === null) return;
    setIsSharing(true);
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const message = `Forget birthdays—I've completed ${days} rotations around the sun ☀️🌎 What's your Sol Age? ${url}`;
    try {
      await sdk.actions.composeCast({ text: message });
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

  // Main content (header, orbits, form) container
  const showMain = days === null;

  // Add this before the component
  function SunSVG() {
    return (
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-2 drop-shadow-lg"
      >
        <circle
          cx="40"
          cy="40"
          r="16"
          fill="url(#sun-gradient)"
          stroke="#FFD700"
          strokeWidth="2"
          filter="url(#glow)"
        />
        {/* Rays */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 40 + Math.cos(angle) * 22;
          const y1 = 40 + Math.sin(angle) * 22;
          const x2 = 40 + Math.cos(angle) * 32;
          const y2 = 40 + Math.sin(angle) * 32;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFD700"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}
        <defs>
          <radialGradient id="sun-gradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#FFD700" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    );
  }

  useEffect(() => {
    setDays(null);
    setApproxYears(null);
  }, []);

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

  // Save bookmark
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

      // Farcaster user
      if (context?.user?.fid) {
        fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid: context.user.fid, user_type: 'farcaster' }),
        }).catch(console.error);
      } else {
        // Browser user: generate/store anon_id
        let anon_id = localStorage.getItem('sunCycleAnonId');
        if (!anon_id) {
          anon_id = crypto.randomUUID();
          localStorage.setItem('sunCycleAnonId', anon_id);
        }
        fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anon_id, user_type: 'browser' }),
        }).catch(console.error);
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

  // If we're in a frame but not pinned, show a message
  if (isInFrame && !isFramePinned) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6">
          <SunSVG />
          <h2 className="text-xl font-serif font-bold mb-4">Pin to Farcaster</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Pin this app to your Farcaster profile to track your sun cycle age and receive milestone notifications.
          </p>
          <button
            onClick={pinFrame}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Pin App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between z-0">
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs font-mono z-50">
          SDK: {isSDKLoaded ? '✓' : '✗'} | Frame: {isFramePinned ? '✓' : '✗'} | Context: {context ? '✓' : '✗'}
        </div>
      )}
      {/* Main Content: Only one of calculator, results, or bookmark card is shown */}
      {days !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <ResultCard
            days={days}
            approxYears={approxYears!}
            nextMilestone={nextMilestone}
            daysToMilestone={daysToMilestone}
            milestoneDate={milestoneDate}
            quote={quote}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            onShare={onShare}
            isSharing={isSharing}
            onRecalculate={() => {
              setBirthDate("");
              setDays(null);
              setApproxYears(null);
              setShowDetails(false);
            }}
            bookmark={bookmark}
            handleBookmark={handleBookmark}
            formattedDate={formattedDate}
          />
        </div>
      ) : bookmark && showBookmark ? (
        <div className="flex-1 flex items-center justify-center w-full">
          <BookmarkCard
            bookmark={bookmark}
            milestone={bookmarkMilestone?.nextMilestone}
            milestoneDate={bookmarkMilestone?.milestoneDate}
            daysToMilestone={bookmarkMilestone?.daysToMilestone}
            sinceLastVisit={bookmark && bookmark.lastVisitDays !== undefined ? Math.max(0, bookmark.days - bookmark.lastVisitDays) : 0}
            onRecalculate={async () => {
              setIsRecalculating(true);
              await new Promise(r => setTimeout(r, 1200));
              calculateAge();
              // After recalculation, update lastVisitDays to the new days value
              setBookmark(prev => prev && days !== null ? {
                ...prev,
                lastVisitDays: days,
                lastVisitDate: new Date().toISOString(),
              } : prev);
              setIsRecalculating(false);
            }}
            onClear={() => setShowConfirmClear(true)}
            isRecalculating={isRecalculating}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <Header formattedDate={formattedDate} />
          <div className="border-b border-gray-200 dark:border-gray-800 mt-4 mb-2 w-full mx-0 sm:mx-4" />
          <SolarSystemGraphic />
          <div className="mb-10" />
          <FormSection birthDate={birthDate} setBirthDate={setBirthDate} calculateAge={calculateAge} />
        </div>
      )}
      {/* Confirmation dialog: */}
      {showConfirmClear && (
        <RadixDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
          <DialogOverlay />
          <DialogContent className="max-w-md w-full border border-gray-400 bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] p-6 rounded-none shadow-md backdrop-blur-sm" style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}>
            <DialogTitle className="text-lg font-serif font-bold mb-2">Clear Bookmark?</DialogTitle>
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to remove your bookmark? This cannot be undone.</div>
            <div className="flex gap-4 justify-center">
              <DialogClose asChild>
                <button className="px-6 py-2 border border-gray-400 dark:border-gray-700 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-none uppercase tracking-widest font-mono text-sm">CANCEL</button>
              </DialogClose>
              <button onClick={() => { handleClearBookmark(); setShowConfirmClear(false); setShowBookmark(false); }} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white rounded-none uppercase tracking-widest font-mono text-sm">CLEAR</button>
            </div>
          </DialogContent>
        </RadixDialog>
      )}
      {/* Footer */}
      <div className="flex justify-center items-center w-full mb-8">
        <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-400 dark:border-gray-700 p-2 mx-1 text-center text-xs font-mono text-gray-700 dark:text-gray-300 w-full max-w-md mx-auto">
          <div>Your data is not stored or shared.<br />
            Solara is made for <a href="https://warpcast.com/~/channel/occulture" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 transition-colors">/occulture</a>
          </div>
        </div>
      </div>
    </div>
  );
}

