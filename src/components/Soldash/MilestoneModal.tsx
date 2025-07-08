'use client';
import { getNextMilestoneByType } from '~/lib/milestones';

interface Bookmark {
  days: number;
  approxYears: number;
  birthDate: string;
  lastVisitDays?: number;
  lastVisitDate?: string;
  userName?: string;
}

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: Bookmark | null;
}

export default function MilestoneModal({ isOpen, onClose, bookmark }: MilestoneModalProps) {
  if (!isOpen || !bookmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Sunrise gradient overlay */}
      <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
      {/* Modal with blur effect */}
      <div className="relative z-10 w-full">
        <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="text-2xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>Upcoming Milestones</div>
            <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {(() => {
              const milestoneTypes = [
                { type: 'interval', label: 'Numerical Milestone' },
                { type: 'palindrome', label: 'Palindrome Day' },
                { type: 'interesting', label: 'Interesting Number' },
                { type: 'cosmic', label: 'Cosmic (Solar Return or Special)' },
                { type: 'angel', label: 'Angel Number' },
              ];
              const milestoneByType = getNextMilestoneByType(bookmark.days, new Date(bookmark.birthDate));
              
              return milestoneTypes.map(({ type, label }) => {
                const milestone = milestoneByType[type as keyof typeof milestoneByType];
                if (!milestone) return null;
                
                return (
                  <div key={type} className="bg-white/80 border border-gray-300 p-4 rounded-none">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{milestone.emoji}</span>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-600">{label}</span>
                    </div>
                    <div className="text-xl font-serif font-bold mb-1" style={{ letterSpacing: '-0.04em' }}>
                      {milestone.cycles.toLocaleString()}
                    </div>
                    <div className="text-sm font-mono text-gray-600 mb-2">
                      {milestone.daysToMilestone} days • {milestone.milestoneDate}
                    </div>
                    <div className="text-xs font-gt-alpina-italic text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                      {milestone.description}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
} 