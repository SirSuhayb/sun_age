import React, { useRef, useEffect, useState } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { SpinnerButton } from "~/components/ui/SpinnerButton";

interface ResultCardProps {
  days: number;
  approxYears: number;
  nextMilestone: number | null;
  daysToMilestone: number | null;
  milestoneDate: string | null;
  quote: string;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  onShare: () => void;
  isSharing: boolean;
  onRecalculate: () => void;
  bookmark: any;
  handleBookmark: () => void;
  formattedDate: string;
  milestoneCard?: React.ReactNode;
  onCommit?: (() => void) | undefined;
  isCommitting?: boolean;
  birthDate?: string;
}

const ResultCard: React.FC<ResultCardProps> = (props) => {
  const {
    days,
    approxYears,
    nextMilestone,
    daysToMilestone,
    milestoneDate,
    quote,
    showDetails,
    setShowDetails,
    onShare,
    isSharing,
    onRecalculate,
    bookmark,
    handleBookmark,
    formattedDate,
    milestoneCard,
    isCommitting,
    birthDate,
  } = props;
  const cardRef = useRef<HTMLDivElement>(null);
  const { context } = useFrameSDK();
  const displayName = context?.user?.displayName;
  // Live and accurate 30-day countdown to a fixed event date (30 days from today)
  const getEventDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(today);
    event.setDate(today.getDate() + 30);
    return event;
  };
  const [daysLeft, setDaysLeft] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = getEventDate();
    return Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = getEventDate();
      setDaysLeft(Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))));
    }, 1000 * 60 * 60); // update every hour
    return () => clearInterval(interval);
  }, []);

  // Fallback OccultureLink if not imported
  const OccultureLink = () => (
    <a href="https://warpcast.com/~/channel/occulture" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 transition-colors">/occulture</a>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] w-full px-2 sm:px-0 mb-24"
    >
      {/* Persistent Global Header */}
      <div className="w-full flex flex-col items-center mb-4">
        {/* Solara Logo (inline SVG) */}
        <span className="block text-[#d4af37] dark:text-white w-[180px] h-[45px] mx-auto select-none">
          <svg width="180" height="45" viewBox="0 0 627 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M36.6523 0C53.8132 6.29946e-06 62.7117 8.68652 65.6777 8.68652C67.1607 8.68634 68.2199 6.3552 68.8555 1.90625H75V47.8809H68.6436C65.4656 19.2794 55.508 7.20312 36.0166 7.20312C20.7627 7.20317 11.6525 15.4657 11.6523 30.2959C11.6523 42.5839 16.1015 49.5759 31.9912 60.5928L51.6943 74.1523C68.4315 85.8048 75.6348 97.2455 75.6348 114.83C75.6346 137.075 62.0755 149.999 39.8301 149.999C22.0342 149.999 12.2887 141.313 9.32227 141.312C7.83925 141.312 6.77915 143.643 6.14355 148.092H0V96.6094H6.35547C9.53341 128.601 20.127 142.796 40.6777 142.796C55.508 142.796 64.4061 133.897 64.4062 118.855C64.4062 104.237 59.5335 95.7622 45.7627 86.2285L26.0596 72.6689C7.41567 59.7453 0.423871 48.9403 0.423828 32.415C0.423828 11.8643 13.983 0 36.6523 0ZM139.316 0C169.824 0.000300237 191.434 29.237 191.435 74.999C191.435 120.761 169.824 149.999 139.316 149.999C108.808 149.999 87.1973 120.761 87.1973 74.999C87.1974 29.2368 108.808 0 139.316 0ZM238.312 8.47461C224.542 8.89834 223.271 12.7116 223.271 30.2959V121.821C223.271 138.558 225.601 141.101 240.431 141.101H253.778C271.787 141.101 275.813 134.109 284.075 96.6094H290.431L284.922 147.033H196.787V141.524C209.711 141.313 211.83 138.77 211.83 125.211V24.7881C211.83 11.2288 209.711 8.68647 196.787 8.47461V2.96582H238.312V8.47461ZM609.587 118.643C615.731 137.075 618.485 140.465 626.536 141.524V147.032H584.163V141.524C595.604 141.313 600.477 138.77 600.477 131.566C600.477 128.388 599.629 124.151 597.723 118.643L590.308 97.0332H541.579L534.799 117.796C533.104 123.092 532.045 127.541 532.045 130.719C532.045 138.134 536.918 141.101 549.418 141.524V147.032H513.216V147.033H496.479L453.682 72.0332H435.462V123.093C435.462 138.135 438.004 141.101 450.292 141.524V147.033H408.979V141.524C421.902 141.313 424.021 138.77 424.021 125.211V24.7881C424.021 11.2288 421.902 8.68647 408.979 8.47461V2.96582H457.072C484.402 2.96592 497.538 15.0423 497.538 36.4404C497.538 53.1775 486.944 66.7363 466.394 70.7617L500.08 126.906C506.026 136.755 509.04 139.92 511.978 141.121C517.581 139.476 521.203 133.563 526.536 117.372L561.494 11.8643L557.681 1.05859H569.757L609.587 118.643ZM389.944 118.643C396.088 137.075 398.843 140.465 406.894 141.524V147.032H364.521V141.524C375.961 141.313 380.834 138.77 380.834 131.566C380.834 128.388 379.987 124.151 378.08 118.643L370.665 97.0332H321.937L315.156 117.796C313.462 123.092 312.402 127.541 312.402 130.719C312.402 138.134 317.275 141.101 329.775 141.524V147.032H290.369V141.524C297.148 140.677 300.962 135.38 306.894 117.372L341.852 11.8643L338.038 1.05859H350.114L389.944 118.643ZM139.316 7.20312C115.164 7.20312 101.605 33.0503 101.604 74.999C101.604 116.948 115.164 142.796 139.316 142.796C163.469 142.796 177.027 116.948 177.027 74.999C177.027 33.0506 163.468 7.20346 139.316 7.20312ZM324.267 90.2529H368.334L346.089 24.5752L324.267 90.2529ZM543.909 90.2529H587.977L565.731 24.5752L543.909 90.2529ZM435.462 66.1016H453.682C474.444 66.1016 483.978 54.4488 483.979 37.0762C483.979 18.4323 476.352 8.8985 456.437 8.89844H435.462V66.1016Z" fill="currentColor"/>
          </svg>
        </span>
        {/* Date */}
        <div className="text-base font-mono font-normal text-gray-600 dark:text-gray-200 mt-0 tracking-wider text-center">
          {formattedDate}
        </div>
      </div>
      {/* Results Card Box */}
      <motion.div 
        ref={cardRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[rgba(255,252,242,0.3)] dark:bg-[rgba(24,24,28,0.3)] border border-gray-200 dark:border-gray-700 rounded-none shadow p-8 max-w-md w-full flex flex-col items-center relative mt-0"
      >
        {/* Sun image with animation */}
        <motion.div
          initial={{ scale: 0.8, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src="/sunsun.png"
            alt="Sun"
            width={72}
            height={72}
            className="w-20 h-20 object-contain mx-auto"
            style={{ filter: 'drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 16px #FFB30099)' }}
            priority
          />
        </motion.div>
        
        {/* Tight number section */}
        <div className="flex flex-col items-center leading-tight" style={{ letterSpacing: '-0.01em' }}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-xs font-mono font-medium tracking-normal text-gray-600 dark:text-gray-300 text-center uppercase mb-0"
            style={{ fontFamily: 'Geist Mono, monospace' }}
          >
            DEAR TRAVELER, YOU HAVE{props.onCommit || context?.user?.fid ? ' MADE' : ''}
          </motion.div>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
            className="text-6xl font-serif font-light tracking-tight text-black dark:text-white text-center mb-0"
            style={{ fontFamily: 'GT Alpina, serif', letterSpacing: '-0.06em', lineHeight: '1.05' }}
          >
            {days}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-xs font-mono font-medium tracking-normal text-gray-700 dark:text-gray-300 text-center mb-0"
            style={{ fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.01em' }}
          >
            SOLAR ROTATIONS SINCE {birthDate ? birthDate.replace(/-/g, ".") : "--.--.----"}
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="text-lg font-serif font-medium italic text-gray-700 dark:text-gray-200 text-center mt-2 mb-4"
          style={{ fontFamily: 'GT Alpina, serif' }}
        >
          ~ {approxYears} years old
        </motion.div>

        {/* Milestone card with animation */}
        <div className="w-full flex justify-center mb-8">
          <div className="w-full max-w-sm min-h-[136px] bg-white/90 dark:bg-neutral-900 border border-gray-400 rounded-none p-4 flex flex-col items-center text-center">
            <div className="font-mono text-sm font-medium tracking-normal text-black dark:text-gray-200 mb-2" style={{ fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.01em' }}>YOUR SOLAR JOURNEY CONTINUES</div>
            <div className="flex items-center justify-center gap-2 text-2xl font-serif font-light text-black dark:text-yellow-400 mb-2" style={{ fontFamily: 'GT Alpina, serif' }}>
              <span role="img" aria-label="star">⭐</span>
              INFINITE
              <span role="img" aria-label="star">⭐</span>
            </div>
            {(context?.user?.fid || props.onCommit) ? (
              <div className="text-xs font-mono font-semibold text-yellow-700 dark:text-yellow-300 mt-1" style={{ fontFamily: 'Geist Mono, monospace' }}>Your {days.toLocaleString()} rotations represent your cosmic evolution</div>
            ) : (
              <div className="text-xs font-mono font-semibold text-yellow-700 dark:text-yellow-300 mt-1" style={{ fontFamily: 'Geist Mono, monospace' }}>Connect to bookmark and share your solar age</div>
            )}
          </div>
        </div>

        {/* Quote with animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          className="mt-2 text-xs font-sans text-gray-400 italic text-center"
        >
          {quote}
        </motion.div>
      </motion.div>

      {/* CTA layout for Farcaster/dev override */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-6">
        {/* Primary CTA: Farcaster/dev or web */}
        {(context?.user?.fid || props.onCommit) ? (
          <SpinnerButton
            onClick={() => {
              if (typeof props.onCommit === 'function') {
                props.onCommit();
              } else {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.warn('onCommit handler missing for commit button');
                }
              }
            }}
            className="font-mono font-medium text-sm uppercase tracking-widest py-3 px-2 w-full rounded-none border border-yellow-500 dark:border-yellow-400 bg-yellow-400 dark:bg-yellow-500 text-black transition-colors hover:bg-yellow-300 dark:hover:bg-yellow-600"
          >
            MAKE YOUR SOLAR VOW
          </SpinnerButton>
        ) : (
          <>
            <SpinnerButton
              onClick={() => {
                if (typeof props.onCommit === 'function') {
                  props.onCommit();
                } else {
                  if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.warn('onCommit handler missing for connect button');
                  }
                }
              }}
              className="font-mono font-medium text-sm uppercase tracking-widest py-3 px-2 w-full rounded-none border border-yellow-500 dark:border-yellow-400 bg-yellow-400 dark:bg-yellow-500 text-black transition-colors hover:bg-yellow-300 dark:hover:bg-yellow-600"
            >
              CONNECT WALLET
            </SpinnerButton>
            <SpinnerButton
              onClick={handleBookmark}
              className="font-mono font-medium text-sm uppercase tracking-widest py-3 px-2 w-full rounded-none border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black transition-colors hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              BOOKMARK MY SOL AGE
            </SpinnerButton>
          </>
        )}
        {/* Secondary CTAs - smaller, link-like, with thin divider */}
        <div className="flex w-full items-center justify-center gap-0 mt-2">
          <SpinnerButton
            onClick={onShare}
            disabled={isSharing}
            className="flex-1 font-mono font-medium text-gray-700 dark:text-gray-300 text-sm py-1 px-1 rounded-none underline underline-offset-4 decoration-2 flex items-center justify-center gap-1 bg-transparent hover:text-yellow-700"
            style={{ background: 'none', border: 'none', textTransform: 'none' }}
          >
            {isSharing ? "SHARING..." : "SHARE SOL AGE"}
          </SpinnerButton>
          <div className="w-px h-5 bg-black mx-2 opacity-40" />
          <SpinnerButton
            onClick={onRecalculate}
            className="flex-1 font-mono font-medium text-gray-700 dark:text-gray-300 text-sm py-1 px-1 rounded-none underline underline-offset-4 decoration-2 flex items-center justify-center gap-1 bg-transparent hover:text-yellow-700"
            style={{ background: 'none', border: 'none', textTransform: 'none' }}
          >
            CALCULATE AGAIN
          </SpinnerButton>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard; 