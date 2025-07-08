'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SoldashPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/soldash/journey');
  }, [router]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-lg font-serif text-gray-800 mb-2">Redirecting...</div>
        <div className="text-sm font-mono text-gray-500 uppercase tracking-widest">
          TO YOUR COSMIC JOURNEY
        </div>
      </div>
    </div>
  );
}
