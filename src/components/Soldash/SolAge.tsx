"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
  userName?: string;
}

export default function SolAge() {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        setBookmark(JSON.parse(saved));
      } catch {}
    }
  }, []);

  if (!bookmark) return null;

  return (
    <div className="w-full flex items-center justify-between gap-4 px-2 py-6">
      {/* Sun with blur */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="pulsing-blur" />
        </div>
        <Image
          src="/sunsun.png"
          alt="Sun"
          width={80}
          height={80}
          className="object-contain z-10"
          style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
          priority
        />
      </div>
      {/* Text */}
      <div className="flex-1 flex flex-col items-start justify-center pl-2">
        <div className="text-base font-mono text-gray-400 tracking-widest uppercase mb-1">YOU HAVE TRAVELED FAR ...</div>
        <div className="text-5xl sm:text-6xl font-serif font-bold text-black leading-none mb-1">
          {bookmark.days.toLocaleString()} <span className="text-2xl font-serif font-normal align-top">days</span>
        </div>
        <div className="text-base font-mono text-gray-400 tracking-widest uppercase mt-1">AROUND THE SUN</div>
      </div>
      {/* Pulsing blur style */}
      <style jsx>{`
        .pulsing-blur {
          width: 80px;
          height: 80px;
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