'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpandPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to data collection for free chart generation
    router.push('/soldash/you/expand/collect-data');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6B13A] mx-auto mb-4"></div>
        <p className="text-[#666] font-mono">Loading...</p>
      </div>
    </div>
  );
}