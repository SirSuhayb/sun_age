import { useRouter } from 'next/navigation';
import React from 'react';
import Image from 'next/image';

interface OracleStatusBarProps {
  solarBalance: number;
  achievements: { unlocked: number; total: number };
  rolls: number;
  onHowToPlay: () => void;
}

const OracleStatusBar: React.FC<OracleStatusBarProps> = ({ solarBalance, achievements, rolls, onHowToPlay }) => {
  const router = useRouter();

  // 20% larger base values for icons and padding only
  const iconSize = 40; // SVG icon size
  const emojiSize = 14; // Emoji icon size (smaller, fixed)
  const paddingX = '1rem'; // 0.5rem * 1.2
  const paddingY = '0.6rem'; // 0.3rem * 1.2
  const gap = '0.3rem'; // 0.5rem * 1.2

  return (
    <div className="w-full flex items-center justify-between border-b border-gray-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-3 py-2 mt-4" style={{ borderRadius: 0 }}>
      {/* Back Button */}
      <button
        className="flex items-center gap-1 font-mono text-sm uppercase tracking-widest border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-none"
        style={{ borderRadius: 0, padding: `${paddingY} ${paddingX}` }}
        onClick={() => router.push('/interstitial')}
        aria-label="Back"
      >
        <span style={{ fontSize: emojiSize }}>←</span>
        <span>Back</span>
      </button>

      {/* Status Buttons */}
      <div className="flex items-center" style={{ gap }}>
        {/* SOLAR Balance */}
        <button
          className="flex items-center font-mono text-sm border border-gray-300 bg-white hover:bg-yellow-50 transition-colors rounded-none"
          style={{ borderRadius: 0, padding: `${paddingY} ${paddingX}` }}
          onClick={() => router.push('/surprise-me/solar')}
          aria-label="SOLAR Balance"
        >
          <span style={{ fontSize: emojiSize }}>🌞</span>
          <span>{solarBalance}</span>
        </button>
        {/* Achievements */}
        <button
          className="flex items-center font-mono text-sm border border-gray-300 bg-white hover:bg-yellow-50 transition-colors rounded-none"
          style={{ borderRadius: 0, padding: `${paddingY} ${paddingX}` }}
          onClick={() => router.push('/surprise-me/achievements')}
          aria-label="Achievements"
        >
          <span style={{ fontSize: emojiSize }}>🏆</span>
          <span>{achievements.unlocked}/{achievements.total}</span>
        </button>
        {/* Rolls */}
        <button
          className="flex items-center font-mono text-sm border border-gray-300 bg-white hover:bg-yellow-50 transition-colors rounded-none"
          style={{ borderRadius: 0, padding: `${paddingY} ${paddingX}` }}
          onClick={() => router.push('/surprise-me/more-rolls')}
          aria-label="Rolls"
        >
          <span style={{ fontSize: emojiSize }}>🎲</span>
          <span>{rolls}</span>
        </button>
        {/* How to Play (Asterisk Icon) */}
        <button
          className="ml-2 flex items-center justify-center"
          style={{ border: 'none', background: 'none', borderRadius: 0, padding: 0 }}
          onClick={onHowToPlay}
          aria-label="How to play"
        >
          <Image src="/asterisk_icon.svg" alt="How to play" width={iconSize} height={iconSize} />
        </button>
      </div>
    </div>
  );
};

export default OracleStatusBar; 