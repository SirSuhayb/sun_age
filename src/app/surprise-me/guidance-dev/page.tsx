'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { surpriseMeFramework } from '~/lib/surpriseMe';
import type { DailyRoll } from '~/lib/surpriseMe';

export default function GuidanceDevPage() {
  const [activities, setActivities] = useState<DailyRoll[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const innovatorActivities = surpriseMeFramework.getArchetypeActivities('Sol Innovator');
      setActivities(innovatorActivities);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-[#FFFCF2]/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-gray-800 mb-4">Page not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2]/50 backdrop-blur-sm">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-gray-700 hover:text-black transition-colors font-mono text-sm uppercase tracking-wide"
        >
          ← BACK
        </button>
        <div className="text-lg font-serif font-bold">Dev: Guidance Testing</div>
        <div className="w-8"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-black mb-4">Sol Innovator Activities</h1>
          <p className="text-gray-600 font-mono text-sm">Dev-only page for testing guidance pages</p>
        </div>

        <div className="grid gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{activity.icon}</div>
                  <div>
                    <div className="font-serif text-xl font-bold text-black mb-1">
                      {activity.title}
                    </div>
                    <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">
                      {activity.rarity} • {activity.duration}
                    </div>
                    <div className="text-gray-600 text-sm mb-3">
                      {activity.description}
                    </div>
                    {activity.quote && (
                                          <div className="italic text-gray-700 text-sm">
                      &ldquo;{activity.quote}&rdquo;
                    </div>
                    )}
                  </div>
                </div>
                <Link
                  href={`/surprise-me/guidance/${activity.id}`}
                  className="px-4 py-2 bg-[#d4af37] text-black font-mono text-sm uppercase tracking-widest hover:bg-[#e6c75a] transition-colors"
                >
                  View Guidance
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-mono">
            Total activities: {activities.length}
          </p>
        </div>
      </div>
    </div>
  );
} 