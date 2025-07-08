'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import SolAge from '~/components/Soldash/SolAge';
import MilestoneHighlight from '~/components/Soldash/MilestoneHighlight';
import SolCycle from '~/components/Soldash/SolCycle';
import CosmicCodex from '~/components/Soldash/CosmicCodex';
import { motion } from 'framer-motion';

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

      {/* Cosmic Codex Component */}
      <motion.div variants={itemVariants}>
        <CosmicCodex />
      </motion.div>
    </motion.div>
  );
} 