'use client';

import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import SunCycleAge from '~/components/SunCycleAge';
import { useEffect } from 'react';

export default function MobilePage() {
  useEffect(() => {
    // Mobile-specific initialization
    if (typeof window !== 'undefined') {
      document.title = PROJECT_TITLE;
      
      // Set up mobile-specific viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      <SunCycleAge />
    </div>
  );
}