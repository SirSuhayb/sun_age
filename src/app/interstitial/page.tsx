'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSolarArchetype } from '~/lib/solarIdentity';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function InterstitialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  const solarIdentity = birthDate ? getSolarArchetype(birthDate) : null;
  const days = searchParams?.get('days');
  const approxYears = searchParams?.get('approxYears');
  const [returningUser, setReturningUser] = useState(false);
  const [lastVisitRotations, setLastVisitRotations] = useState<number | null>(null);
  const [bookmark, setBookmark] = useState<any>(null);
  const [todayDays, setTodayDays] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBookmark(parsed);
          if (parsed.lastVisitDate && parsed.birthDate) {
            const lastVisit = new Date(parsed.lastVisitDate);
            const now = new Date();
            const msPerDay = 1000 * 60 * 60 * 24;
            const rotationsSinceLast = Math.floor((now.getTime() - lastVisit.getTime()) / msPerDay);
            setLastVisitRotations(rotationsSinceLast);
            // Calculate total days since birthDate to today
            const birth = new Date(parsed.birthDate);
            const totalDays = Math.floor((now.getTime() - birth.getTime()) / msPerDay);
            setTodayDays(totalDays);
            // Always mark as returning user if bookmark exists
            setReturningUser(true);
          }
        } catch {}
      }
    }
  }, []);

  // Power phrase mapping (core only for now)
  const powerPhrases: Record<string, string> = {
    'Sol Innovator': "My innovative spirit transforms tomorrow's possibilities into today's breakthroughs.",
    'Sol Nurturer': "My nurturing essence creates sanctuaries where every soul can flourish.",
    'Sol Alchemist': "My alchemical power transforms every challenge into evolutionary fuel.",
    'Sol Sage': "My wisdom essence expands consciousness through fearless truth-seeking.",
    'Sol Builder': "My building essence creates lasting structures that elevate collective achievement.",
    'Sol Artist': "My artistic essence weaves beauty and harmony into the fabric of existence.",
  };

  // Use bookmark data if returning user, else use params
  const showReturning = returningUser && bookmark && todayDays !== null && lastVisitRotations !== null;
  const displayDays = showReturning ? todayDays : days;
  const displayBirthDate = showReturning ? bookmark.birthDate : birthDate;
  const displaySolarIdentity = showReturning ? getSolarArchetype(bookmark.birthDate) : solarIdentity;
  const displayAffirmation = displaySolarIdentity ? powerPhrases[displaySolarIdentity] : null;

  // Card color mapping
  const cardColors = [
    'bg-[#FFF7B0]', // yellow
    'bg-[#E9D6FF]', // purple
    'bg-[#C7E6FF]', // blue
    'bg-[#D6FFE6]', // green
  ];

  const handleBookmark = () => {
    if (days && approxYears && birthDate) {
      const now = new Date();
      const data = {
        days: Number(days),
        approxYears: Number(approxYears),
        birthDate,
        lastVisitDays: Number(days),
        lastVisitDate: now.toISOString(),
      };
      localStorage.setItem('sunCycleBookmark', JSON.stringify(data));
    }
  };

  return (
    <>
      {/* Interstitial background and content section */}
      <div className="w-full relative overflow-hidden">
        {/* --- BACKGROUND LAYERS --- */}
        {/* Bottom Layer: #FFFCF2 at 50% opacity */}
        <div className="absolute inset-0 z-0" style={{ background: '#FFFCF2', opacity: 0.5 }} aria-hidden="true" />
        {/* Middle Layer: sol_constellation.png */}
        <div className="fixed inset-0 w-full h-full z-10 pointer-events-none" style={{ background: 'url(/sol_constellation.png) center/cover no-repeat' }} aria-hidden="true" />
        {/* Top Layer: #FFFCF2 at 10% opacity with blur */}
        <div className="absolute inset-0 z-20 backdrop-blur" style={{ background: '#FFFCF2', opacity: 0.5, filter: 'blur(10px)' }} aria-hidden="true" />

        {/* --- FADE-IN ANIMATION FOR CONTENT --- */}
        <div className="w-full flex flex-col items-center relative z-30 animate-fadein" style={{ animation: 'fadein 1.2s cubic-bezier(0.4,0,0.2,1)' }}>
          {/* Sun and Title */}
          <div className="flex flex-col items-center w-full pt-10 pb-2">
            {/* Sun with drop-shadow blur */}
            <div className="relative flex flex-col items-center mb-6 mt-24">
              {/* Pulsating blur */}
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="pulsing-blur" />
              </div>
              {/* Sun image */}
              <Image src="/sunsun.png" alt="Sun" width={100} height={100} className="w-24 h-24 object-contain z-10" style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }} />
            </div>
            {/* Title and Sol Age */}
            {showReturning ? (
              <>
                <div className="text-base font-mono text-gray-700 text-center mb-2 tracking-widest uppercase">WELCOME BACK TRAVELER...</div>
                <div className="text-6xl font-serif font-bold text-black text-center mb-2">{displayDays?.toLocaleString()}</div>
                <div className="text-sm font-mono text-gray-700 text-center mb-4 px-4 tracking-widest uppercase">{lastVisitRotations} ROTATIONS SINCE YOUR LAST VISIT. YOUR ENERGY HAS BEEN CHARGING...</div>
                {/* Affirmation Card */}
                <div
                  className="flex flex-col items-center bg-[#FFF7E0] border border-[#E6D6AD] mt-4 mb-6 rounded-none"
                  style={{ maxWidth: 368, width: '100%', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 24, borderRightWidth: 1, borderTopWidth: 5 }}
                >
                  <div className="text-xs font-mono text-[#bfa12e] uppercase tracking-widest mb-4 font-semibold">INNER SOL AFFIRMATION</div>
                  <div className="font-serif italic text-black text-xl text-center">{displayAffirmation}</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-serif font-bold text-black text-center mb-6" style={{letterSpacing: '-0.01em'}}>Your solar power awaits...</div>
                {/* Solar Identity Card */}
                <div
                  className="flex flex-col items-center bg-[#FFF7E0] border border-[#E6D6AD] mb-6 rounded-none"
                  style={{paddingLeft: 8, paddingRight: 8, paddingTop: 24, paddingBottom: 24, borderRightWidth: 1, borderTopWidth: 5, marginLeft: 8, marginRight: 8, width: 368 }}
                >
                  <div className="text-3xl font-serif font-bold text-black text-center flex items-center justify-center gap-2 mb-1">
                    <span role="img" aria-label="sun" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne Color, Twemoji, sans-serif' }}>🌞</span>
                    {solarIdentity}
                    <span role="img" aria-label="sun" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne Color, Twemoji, sans-serif' }}>🌞</span>
                  </div>
                </div>
              </>
            )}
            {/* Arrow Divider with vertical line */}
            <div className="flex flex-col items-center mb-2" style={{height: '40px'}}>
              <div className="w-px h-6 bg-gray-200" />
              <span className="text-gray-300 text-xl" style={{marginTop: '-2px'}}>&#8595;</span>
            </div>
            <div className="text-sm font-mono text-gray-500 uppercase tracking-widest text-center mb-6 mt-2 px-4" style={{letterSpacing: '0.08em'}}>
              How do you want to channel this energy?
            </div>
          </div>
          {/* Options */}
          <div className="w-full max-w-md mx-auto flex flex-col gap-4 px-4 pb-8">
            {/* 1. Dive into your inner sol */}
            <button
              className="w-full border border-gray-300 px-4 py-6 text-center rounded-none flex items-center gap-4 transition-colors duration-150 hover:brightness-90 active:brightness-75"
              style={{ backgroundColor: '#FFF7B0' }}
              onClick={() => {
                handleBookmark();
                router.push('/soldash?tab=sol%20sign');
              }}
            >
              <Image src="/tabIcons/radiance.svg" alt="Radiance" width={40} height={40} className="object-contain" />
              <div className="text-left">
                <div className="font-serif font-bold text-lg text-black mb-2">Dive into your inner sol</div>
                <div className="font-mono text-sm uppercase text-gray-600 leading-tight">DISCOVER THE LAYERS OF YOUR SOLAR POWER AND BECOME MORE RADIANT WITH TIME.</div>
              </div>
            </button>
            {/* 2. Track your milestones */}
            <button
              className="w-full border border-gray-300 px-4 py-6 text-center rounded-none flex items-center gap-4 transition-colors duration-150 hover:brightness-90 active:brightness-75"
              style={{ backgroundColor: '#E9D6FF' }}
              onClick={() => {
                handleBookmark();
                router.push('/soldash?tab=sol%20age');
              }}
            >
              <Image src="/tabIcons/outstar.svg" alt="Outstar" width={40} height={40} className="object-contain" />
              <div className="text-left">
                <div className="font-serif font-bold text-lg text-black mb-2">Track your milestones</div>
                <div className="font-mono text-sm uppercase text-gray-600 leading-tight">THE COSMOS KNOWS WHERE YOU&#39;RE HEADED. FOLLOW YOUR THREADS IN THE STARS.</div>
              </div>
            </button>
            {/* 3. Inscribe what inspires you */}
            <button
              className="w-full border border-gray-300 px-4 py-6 text-center rounded-none flex items-center gap-4 transition-colors duration-150 hover:brightness-90 active:brightness-75"
              style={{ backgroundColor: '#C7E6FF' }}
              onClick={() => {
                handleBookmark();
                router.push('/soldash?tab=journal');
              }}
            >
              <Image src="/tabIcons/galaxy.svg" alt="Galaxy" width={40} height={40} className="object-contain" />
              <div className="text-left">
                <div className="font-serif font-bold text-lg text-black mb-2">Inscribe what inspires you</div>
                <div className="font-mono text-sm uppercase text-gray-600 leading-tight">TRANSMUTE YOUR INNER WISDOM INTO WORDS. SHARE THEM FOR OTHERS TO LEARN FROM.</div>
              </div>
            </button>
            {/* 4. Make a sacred vow */}
            <button
              className="w-full border border-gray-300 px-4 py-6 text-center rounded-none flex items-center gap-4 transition-colors duration-150 hover:brightness-90 active:brightness-75"
              style={{ backgroundColor: '#D6FFE6' }}
              onClick={() => {
                handleBookmark();
                router.push('/soldash?tab=sol%20vows');
              }}
            >
              <Image src="/tabIcons/starburst.svg" alt="Starburst" width={40} height={40} className="object-contain" />
              <div className="text-left">
                <div className="font-serif font-bold text-lg text-black mb-2">Make a sacred vow</div>
                <div className="font-mono text-sm uppercase text-gray-600 leading-tight">THE BEGINNING TO YOUR BRIGHTEST SELF. A PLEDGE TO BECOME BETTER, TOGETHER.</div>
              </div>
            </button>
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