import React from 'react';
import Image from 'next/image';

const MILESTONES = [
  { x: 60, label: '5555', event: 'WORLD EVENT', eventY: 52, labelY: 50, eventAlign: 'top' },
  { x: 200, label: 'COSMIC EVENT', event: 'COSMIC EVENT', eventY: 52, labelY: 50, eventAlign: 'top', isEvent: true },
  { x: 60, label: '4000', event: 'COSMIC EVENT', eventY: 140, labelY: 168, eventAlign: 'bottom', isEvent: true },
  { x: 200, label: '7500', event: 'WORLD EVENT', eventY: 140, labelY: 168, eventAlign: 'bottom' },
  { x: 340, label: '10000', event: 'COSMIC EVENT', eventY: 52, labelY: 50, eventAlign: 'top', isEvent: true },
];

const EVENT_COLORS = {
  'WORLD EVENT': '#3730A3',
  'COSMIC EVENT': '#3730A3',
};

export default function CosmicCodex() {
  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full mt-1 mb-2"
        style={{
          background: '#FEFDF8',
          border: '1px solid #D7D7D7',
          boxSizing: 'border-box',
        }}
      >
        <div className="px-6 pt-10 pb-10">
          {/* Title */}
          <div className="text-3xl font-serif text-black text-center mb-4 font-normal" style={{ letterSpacing: '-0.04em' }}>
            Unlock your Cosmic Codex
          </div>
          {/* Subtitle */}
          <div className="text-base text-sm font-mono text-gray-700 text-center mb-8 tracking-tightest uppercase" style={{ letterSpacing: '0.08em' }}>
            JOURNEY THROUGH TIME TO UNCOVER THE COSMIC PATTERNS THAT REVEAL YOUR TRUE TRAJECTORY.
          </div>

          {/* Timeline Section with SVG */}
          <div className="w-full flex justify-center mb-10">
            <div style={{ width: 420, maxWidth: '100%', background: '#FFF7DD', border: '1px solid #E0D09D', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                src="/journey/codex_timeline.svg"
                alt="Timeline of cosmic and world events"
                width={400}
                height={200}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </div>
          </div>

          {/* Callout & Description */}
          <div className="text-lg font-serif text-[#555] font-bold mb-3 text-left" style={{ letterSpacing: '-0.01em' }}>
            The stars remember what you've forgotten.
          </div>
          <div className="text-lg font-serif text-[#555] leading-tight text-left mb-8" style={{ letterSpacing: '-0.01em', maxWidth: 480 }}>
            Every moment of your journey through time carries encoded wisdom—patterns that reveal not just where you've been, but where you're destined to go. The cosmos doesn't just witness your story; it holds the keys to unlock your future.
          </div>

          {/* Coming Soon Button */}
          <button
            className="w-full py-4 bg-[#D4AF37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none mt-2"
            style={{ letterSpacing: '0.04em', cursor: 'not-allowed' }}
            disabled
          >
            COMING SOON
          </button>
        </div>
      </div>
    </div>
  );
}

// Starburst SVG helper
function Starburst({ x, y, color }: { x: number; y: number; color: string }) {
  // 16-pointed starburst
  const points = Array.from({ length: 16 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 28 : 12;
    return [
      x + Math.cos(angle) * r,
      y + Math.sin(angle) * r,
    ];
  });
  const d = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ') + ' Z';
  return <path d={d} fill="none" stroke={color} strokeWidth={3} />;
} 