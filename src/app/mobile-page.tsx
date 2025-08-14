'use client';

import { Metadata } from "next";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import SunCycleAge from '~/components/SunCycleAge';
import { useEffect } from 'react';

export default function MobilePage() {
  useEffect(() => {
    // Mobile-specific initialization
    if (typeof window !== 'undefined') {
      // Add mobile app initialization logic here
      document.title = PROJECT_TITLE;
    }
  }, []);

  return (
    <>
      <SunCycleAge />
    </>
  );
}