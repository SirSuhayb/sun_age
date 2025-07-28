'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OracleCard() {
  const router = useRouter();
  const [bookmark, setBookmark] = useState<any>(null);
  const [dailyRolls, setDailyRolls] = useState<number>(3);
  const [hasRolledToday, setHasRolledToday] = useState(false);

  useEffect(() => {
    // Get bookmark data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBookmark(parsed);
        } catch {}
      }

      // Check daily rolls status
      const today = new Date().toDateString();
      const rollData = localStorage.getItem(`dailyRolls_${today}`);
      if (rollData) {
        const parsed = JSON.parse(rollData);
        setDailyRolls(parsed.remaining);
        setHasRolledToday(parsed.history?.length > 0);
      }
    }
  }, []);

  const handleOracleClick = () => {
    if (bookmark?.birthDate) {
      router.push(`/surprise-me?birthDate=${bookmark.birthDate}`);
    } else {
      router.push('/surprise-me');
    }
  };

  const getOracleStatus = () => {
    if (!hasRolledToday) {
      return {
        text: 'Ready for guidance',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    if (dailyRolls > 0) {
      return {
        text: `${dailyRolls} rolls remaining`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
    
    return {
      text: 'All rolls used',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const status = getOracleStatus();

  return (
    <motion.div
      className="w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="w-full cursor-pointer"
        style={{
          background: '#FCF6E5',
          borderTop: '5px solid #DBD3BC',
          borderLeft: '1px solid #DBD3BC',
          borderRight: '1px solid #DBD3BC',
          borderBottom: '1px solid #DBD3BC',
          boxSizing: 'border-box',
        }}
        onClick={handleOracleClick}
      >
        <div className="px-6 pt-6 pb-2">
          {/* Header with oracle icon */}
          <div className="flex items-center justify-center mb-4 gap-2">
            <div className="text-2xl">🔮</div>
            <span className="text-2xl font-serif font-normal text-black text-center" style={{ letterSpacing: '-0.04em' }}>
              Daily Oracle
            </span>
            <div className="text-2xl">🔮</div>
          </div>
          
          {/* Description */}
          <div className="text-xl mt-2 mb-4 font-gt-alpina-italic text-center" style={{ color: '#5F5F5F', letterSpacing: '-0.02em' }}>
            Receive personalized cosmic guidance tailored to your Sol Innovator energy
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="w-full bg-[#FFFDF6] px-6 py-4 flex items-center justify-between border-t border-[#DBD3BC]">
          <div className={`text-xs font-mono px-2 py-1 rounded ${status.bgColor} ${status.color} ${status.borderColor} border`}>
            {status.text}
          </div>
          
          <div className="text-sm font-mono text-black underline underline-offset-2 tracking-widest uppercase">
            Roll for Guidance
          </div>
        </div>
      </div>
    </motion.div>
  );
} 