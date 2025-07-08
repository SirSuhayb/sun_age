import React, { useEffect, useState } from 'react';

interface TooltipProps {
  title: string;
  body: string;
  bgColor: string;
  borderColor: string;
  textColor?: string;
  storageKey: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ title, body, bgColor, borderColor, textColor }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed) return null;

  const color = textColor || borderColor;

  return (
    <div
      className="w-full flex items-start px-6 py-4 mb-6 relative"
      style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 0 }}
      role="alert"
    >
      <div className="flex-1">
        <div
          className="font-mono text-sm font-normal uppercase mb-2 text-left"
          style={{ color, letterSpacing: '0.04em' }}
        >
          {title}
        </div>
        <div className="font-mono text-sm text-left" style={{ color }}>
          {body}
        </div>
      </div>
      <button
        aria-label="Dismiss tooltip"
        onClick={handleDismiss}
        className="ml-3 mt-1 p-1 hover:opacity-70 focus:outline-none"
        style={{ background: 'none', border: 'none', borderRadius: 0 }}
      >
        {/* Eye icon SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="12" rx="9.5" ry="6.5" stroke={borderColor} strokeWidth="1" fill="none" />
          <circle cx="12" cy="12" r="2.5" fill={borderColor} />
        </svg>
      </button>
    </div>
  );
}; 