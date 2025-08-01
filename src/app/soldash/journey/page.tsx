'use client';
import { useState, useEffect } from 'react';
import { Tooltip } from '~/components/Soldash/Tooltip';
import SolAge from '~/components/Soldash/SolAge';
import MilestoneHighlight from '~/components/Soldash/MilestoneHighlight';
import SolCycle from '~/components/Soldash/SolCycle';
import CosmicCodex from '~/components/Soldash/CosmicCodex';
import { motion } from 'framer-motion';
import { getSolarArchetype } from '~/lib/solarIdentity';

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

export default function JourneyPage() {
  const [bookmark, setBookmark] = useState<any>(null);
  
  useEffect(() => {
    // Load bookmark from localStorage for enhanced CosmicCodex
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          setBookmark(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing bookmark:', error);
        }
      }
    }
  }, []);
  
  // Calculate user's current age and archetype if bookmark exists
  const userAge = bookmark ? Math.floor((Date.now() - new Date(bookmark.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25;
  const userArchetype = bookmark ? getSolarArchetype(bookmark.birthDate) : 'Sol Traveler';

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mt-10" variants={itemVariants}>
        <Tooltip
          title="YOUR COSMIC TIMELINE"
          body={"Track your journey through space and time.\nYour Solar Innovator energy builds with each rotation."}
          bgColor="#F6F3FF"
          borderColor="#C0AAFF"
          textColor="#7E22CE"
          storageKey="soldash-journey-tooltip"
        />
      </motion.div>

      {/* Sol Age Component */}
      <motion.div variants={itemVariants}>
        <SolAge />
      </motion.div>

      {/* Milestone Component */}
      <motion.div variants={itemVariants}>
        <MilestoneHighlight />
      </motion.div>

      {/* Sol Cycle Component */}
      <motion.div variants={itemVariants}>
        <SolCycle />
      </motion.div>

      {/* Enhanced Cosmic Codex Component */}
      <motion.div variants={itemVariants}>
        <CosmicCodex 
          birthDate={bookmark?.birthDate}
          archetype={userArchetype}
          currentAge={userAge}
        />
      </motion.div>
    </motion.div>
  );
} 