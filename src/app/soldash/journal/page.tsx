'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import { useDailyContent } from '~/hooks/useDailyContent';
import { useState, useEffect } from 'react';
import { Journal } from '~/components/Journal/Journal';
import MilestoneCard from '~/components/SunCycleAge/MilestoneCard';
import { motion } from "framer-motion";
import Image from 'next/image';
import { JournalEntryEditor } from '~/components/Journal/JournalEntryEditor';

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

export default function JournalPage() {
  const { content, isLoading } = useDailyContent();
  const [showEditor, setShowEditor] = useState(false);
  const [solAge, setSolAge] = useState(0);

  useEffect(() => {
    // Try to read solAge from localStorage sunCycleBookmark
    try {
      const bookmark = localStorage.getItem('sunCycleBookmark');
      if (bookmark) {
        const parsed = JSON.parse(bookmark);
        if (typeof parsed.days === 'number') {
          setSolAge(parsed.days);
        }
      }
    } catch (e) {
      // fallback to 0
      setSolAge(0);
    }
  }, []);

  // Helper to determine header text based on prompt ending
  const promptText = isLoading ? '' : (content?.primary?.text || '');
  let headerText = 'Abri Mathos says...';
  if (promptText.trim().endsWith('?')) {
    headerText = 'Abri Mathos is asking...';
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tooltip at the top */}
      <motion.div className="mt-10" variants={itemVariants}>
        <Tooltip
          title="INSPIRATION BECOMES WISDOM"
          body={"Your Sol Innovator energy flows best through free creative expression. The more you write, the more you learn."}
          bgColor="#E3F1FF"
          borderColor="#9CC8FF"
          textColor="#0067CF"
          storageKey="soldash-journal-tooltip"
        />
      </motion.div>
      {/* Daily Prompt Card - styled exactly like MilestoneHighlight in journey, with CTA */}
      <motion.div
        className="w-full mt-1 mb-2"
        style={{
          background: '#FCF6E5',
          borderTop: '5px solid #DBD3BC',
          borderLeft: '1px solid #DBD3BC',
          borderRight: '1px solid #DBD3BC',
          borderBottom: '1px solid #DBD3BC',
          boxSizing: 'border-box',
        }}
        variants={itemVariants}
      >
        <div className="px-6 pt-6 pb-2">
          {/* Header with starlight icons */}
          <div className="flex items-center justify-center mb-4 gap-2">
            <Image src="/journal/small_starlight.svg" alt="starlight" width={28} height={28} className="inline-block" />
            <span className="text-3xl font-serif font-normal text-black text-center" style={{ letterSpacing: '-0.04em' }}>{headerText}</span>
            <Image src="/journal/small_starlight.svg" alt="starlight" width={28} height={28} className="inline-block" />
          </div>
          {/* Prompt */}
          <div className="text-3xl mt-2 mb-4 font-gt-alpina-italic text-center" style={{ color: '#5F5F5F', letterSpacing: '-0.02em' }}>
            {isLoading ? 'Loading prompt...' : promptText || '—'}
          </div>
        </div>
        {/* CTA Button */}
        <div className="w-full bg-[#FFFDF6] px-0 py-4 flex items-center justify-center border-t border-[#DBD3BC]">
          <button
            className="w-full text-center text-sm font-mono text-black underline underline-offset-2 tracking-widest bg-transparent border-none rounded-none hover:text-gray-700 transition-colors cursor-pointer uppercase"
            onClick={() => setShowEditor(true)}
          >
            CAPTURE INSPIRATION
          </button>
        </div>
      </motion.div>
      {/* Journal Component (search, filter, entries, etc) */}
      <motion.div variants={itemVariants}>
        <Journal solAge={solAge} />
      </motion.div>
      {/* Journal Editor Modal */}
      {showEditor && (
        <JournalEntryEditor
          entry={{ id: '', user_fid: 0, sol_day: solAge, content: '', preservation_status: 'local', word_count: 0, created_at: new Date().toISOString() }}
          onSave={async () => { setShowEditor(false); }}
          onAutoSave={async () => {}}
          onFinish={() => setShowEditor(false)}
          mode="edit"
        />
      )}
    </motion.div>
  );
} 