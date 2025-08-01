'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import Image from 'next/image';
import SolProfilePreview from '~/components/Soldash/SolProfilePreview';
import SolEvolution from '~/components/Soldash/SolEvolution';
import ExpandUnderstanding from '~/components/Soldash/ExpandUnderstanding';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCompleteSolarProfile } from '~/lib/solarIdentity';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function YouPage() {
  const [bookmark, setBookmark] = useState<any>(null);
  const [solarProfile, setSolarProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsedBookmark = JSON.parse(saved);
          setBookmark(parsedBookmark);
          
          // Generate enhanced solar profile if we have a birth date
          if (parsedBookmark.birthDate) {
            const profile = getCompleteSolarProfile(parsedBookmark.birthDate);
            setSolarProfile(profile);
            
            // Update bookmark with new foundation/depth data
            const enhancedBookmark = {
              ...parsedBookmark,
              foundation: profile.foundation,
              depth: profile.depth,
              agePhase: profile.agePhase
            };
            setBookmark(enhancedBookmark);
          }
        } catch {
          // Handle parse error gracefully
        }
      }
    }
  }, []);

  return (
    <motion.div 
      className="space-y-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tooltip at the top */}
      <motion.div className="mt-10" variants={itemVariants}>
        <Tooltip
          title="DISCOVER YOUR INNER SOL"
          body={`Go deeper into your ${solarProfile?.archetype || 'Solar'} identity. In time, you'll unlock the layers of your cosmic signature.`}
          bgColor="#FFF8ED"
          borderColor="#F5C16C"
          textColor="#D4A02A"
          storageKey="soldash-you-tooltip"
        />
      </motion.div>
      {/* Archetype Card (Preview) */}
      <motion.div className="mt-10" variants={itemVariants}>
        {bookmark ? (
          <SolProfilePreview bookmark={bookmark} />
        ) : (
          <div className="w-full max-w-xl mx-auto bg-[#FCF6E5] border-t-4 border-[#DBD3BC] border-l border-r border-b border-[#DBD3BC] p-6 text-center font-serif text-lg text-gray-700" style={{ borderRadius: 0 }}>
            No Solar Identity found. Please calculate your Sol Age to unlock your cosmic profile.
          </div>
        )}
      </motion.div>
      {/* Sol Evolution Card */}
      <motion.div className="mt-10" variants={itemVariants}>
        {bookmark && <SolEvolution bookmark={bookmark} />}
      </motion.div>
      {/* Expand Understanding Card */}
      <motion.div className="mt-10" variants={itemVariants}>
        {bookmark && <ExpandUnderstanding />}
      </motion.div>
    </motion.div>
  );
} 