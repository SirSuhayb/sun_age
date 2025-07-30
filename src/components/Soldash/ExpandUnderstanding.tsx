import React from 'react';
import Image from 'next/image';

const features = [
  { icon: '🎯', label: 'Life Focus' },
  { icon: '⚡', label: 'Energy Rhythms' },
  { icon: '🧩', label: 'Natural Strengths' },
  { icon: '📅', label: 'Annual Resets' },
  { icon: '🌊', label: 'Growth Phases' },
  { icon: '🛑', label: 'Breakthroughs' },
];

const ExpandUnderstanding: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-[#FEFDF8] border border-[#D7D7D7] rounded-none flex flex-col items-center">
      <div className="text-2xl font-serif font-semibold text-center mb-2">Expand your understanding</div>
      <div className="text-base font-mono uppercase tracking-wide text-center text-[#888] mb-6">
        Add your birth time & location for deeper insights on your inner sol
      </div>
      <div className="w-full flex justify-center items-center mb-6">
        <Image src="/you/solChart.svg" alt="Sol Chart" width={400} height={300} className="w-full max-w-md border border-[#E5E1D8] bg-[#FCF6E5] p-8" />
      </div>
      <div className="text-[#444] text-lg font-serif text-left w-full mb-6">
        Your complete Sol Chart reveals the intricate layers of your cosmic signature, timing, and evolutionary path.
      </div>
      <div className="w-full mb-8">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {features.map((f) => (
            <li key={f.label} className="flex items-center text-medium font-serif text-[#444]">
              <span className="text-medium mr-2">{f.icon}</span>
              <span className="font-semibold mr-2">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
              <button
          className="w-full py-4 bg-[#E6B13A] text-black font-mono text-lg tracking-widest uppercase border-none rounded-none mt-2 hover:bg-[#D4A02A] transition-colors"
          onClick={() => window.location.href = '/soldash/you/expand'}
        >
          Unlock Sol Codex
        </button>
    </div>
  );
};

export default ExpandUnderstanding; 