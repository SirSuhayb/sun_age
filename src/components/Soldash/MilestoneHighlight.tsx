"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getNextMilestone } from '~/lib/milestones';
import MilestoneModal from './MilestoneModal';

interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
  userName?: string;
}

export default function MilestoneHighlight() {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [milestone, setMilestone] = useState<any>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sunCycleBookmark");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookmark(parsed);
        setMilestone(getNextMilestone(parsed.days, new Date(parsed.birthDate)));
      } catch {}
    }
  }, []);

  if (!bookmark || !milestone) return null;

  return (
    <>
      <div className="w-full flex flex-col items-center">
        {/* Section Title */}
        <div className="text-lg font-serif font-bold text-center mb-2" style={{ color: '#AE8C25' }}>
          Approaching Milestones
        </div>
        {/* Card */}
        <div
          className="w-full mt-1 mb-2"
          style={{
            background: '#FCF6E5',
            borderTop: '5px solid #DBD3BC',
            borderLeft: '1px solid #DBD3BC',
            borderRight: '1px solid #DBD3BC',
            borderBottom: '1px solid #DBD3BC',
            boxSizing: 'border-box',
          }}
        >
          <div className="px-6 pt-6 pb-2">
            {/* Header */}
            <div className="text-3xl font-serif font-normal text-black text-center mb-4" style={{ letterSpacing: '-0.04em' }}>{milestone.label}</div>
            <div className="flex flex-row items-end justify-between mb-2">
              {/* Milestone Number & Label */}
              <div>
                <div className="text-2xl font-serif text-[#5F5F5F] font-normal mb-1" style={{ letterSpacing: '-0.02em' }}>{milestone.cycles.toLocaleString()} Solar Days</div>
                <div className="text-base font-mono text-[#5F5F5F] uppercase tracking-widest mb-1" style={{ letterSpacing: '-0.02em' }}>{milestone.emoji} {milestone.labelDescription || milestone.label}</div>
              </div>
              {/* Days to Milestone & Date */}
              <div className="flex flex-col items-end">
                <div className="text-2xl font-serif font-normal" style={{ color: '#AE8C25', letterSpacing: '-0.02em' }}>{milestone.daysToMilestone.toLocaleString()} days</div>
                <div className="text-base font-mono uppercase tracking-widest" style={{ color: '#AE8C25', letterSpacing: '-0.02em' }}>{milestone.milestoneDate}</div>
              </div>
            </div>
            {/* Description */}
            <div className="mt-2 mb-4 font-gt-alpina-italic" style={{ color: '#5F5F5F', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              {milestone.description}
            </div>
          </div>
          {/* CTA Button */}
          <div className="w-full bg-[#FFFDF6] px-0 py-4 flex items-center justify-center border-t border-[#DBD3BC]">
            <button
              className="w-full text-center text-sm font-mono text-black underline underline-offset-2 tracking-widest bg-transparent border-none rounded-none hover:text-gray-700 transition-colors cursor-pointer"
              onClick={() => setShowMilestoneModal(true)}
            >
              VIEW MORE MILESTONES
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        bookmark={bookmark}
      />
    </>
  );
} 