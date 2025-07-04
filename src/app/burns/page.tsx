"use client";

import { useRenaissanceStats, useBurnMetrics } from '~/hooks/useRenaissanceStats';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BurnsPage() {
  const router = useRouter();
  const { pledgeStats, utilityStats, aggregateStats, isLoading } = useRenaissanceStats();
  const { burnData } = useBurnMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9]">
        <div className="text-center">
          <PulsingStarSpinner />
          <p className="text-gray-600 font-mono text-sm mt-4">Loading Burn Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbe9] flex flex-col">
      {/* Header */}
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs text-gray-500 font-mono hover:underline bg-transparent border-none flex items-center gap-1"
          style={{ letterSpacing: '0.05em' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> BACK TO DASHBOARD
        </button>

        <div className="text-center mb-6">
          <div className="relative mb-4">
            <div className="text-4xl">🔥</div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-2">Burn Analytics</h1>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            SOLAR DEFLATIONARY MECHANISMS & BURN TRACKING
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <div className="space-y-4">
          
          {/* REAL DATA - SHELL UI */}
          
          {/* Total SOLAR Burned */}
          <div className="border border-red-300 bg-red-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-red-700 uppercase tracking-wide">TOTAL SOLAR BURNED</div>
              <div className="text-xs text-red-600">SOLAR</div>
            </div>
            <div className="text-2xl font-serif font-bold text-red-700">
              {pledgeStats?.solarBurned || '0'} SOLAR
            </div>
            <div className="text-xs text-red-600 mt-1">
              Permanently removed from circulation
            </div>
          </div>

          {/* Pledge-Driven Burns */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">PLEDGE BURNS</div>
              <div className="text-xs text-gray-500">SOLAR</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              {burnData?.pledgeBurns || '0'} SOLAR
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Real DEX purchases → burns from pledges (10%)
            </div>
          </div>

          {/* USDC Used for Burns */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">USDC → SOLAR BURNS</div>
              <div className="text-xs text-gray-500">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              ${pledgeStats?.usdcUsedForBurns || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              USDC converted to SOLAR via DEX then burned
            </div>
          </div>

          {/* Burn Rate */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">BURN RATE</div>
              <div className="text-xs text-gray-500">SOLAR/USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-blue-600">
              {burnData?.burnRate?.toFixed(0) || '0'} SOLAR
            </div>
            <div className="text-xs text-gray-500 mt-1">
              SOLAR tokens burned per $1 USDC spent
            </div>
          </div>

          {/* Burn Efficiency */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">BURN EFFICIENCY</div>
              <div className="text-xs text-gray-500">%</div>
            </div>
            <div className="text-2xl font-serif font-bold text-green-600">
              {pledgeStats?.burnEfficiency || '0.00'}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Market price efficiency vs static rates
            </div>
          </div>

          {/* Revenue Burns */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">REVENUE BURNS</div>
              <div className="text-xs text-gray-500">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              ${utilityStats?.burnedFromRevenue || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              25% of utility revenue → SOLAR burns
            </div>
          </div>

          {/* Burn Breakdown */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">BURN SOURCES</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ Pledge Revenue (10%)</span>
                <span className="text-sm font-bold">{pledgeStats?.solarBurned || '0'} SOLAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ Utility Revenue (25%)</span>
                <span className="text-sm font-bold">{utilityStats?.totalBurns || '0'} SOLAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ Strategic Burns</span>
                <span className="text-sm font-bold">2.1B SOLAR</span>
              </div>
            </div>
          </div>

          {/* Supply Impact */}
          <div className="border border-[#d4af37] bg-[#fffbe9] p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-[#d4af37] uppercase tracking-wide">SUPPLY REDUCTION</div>
              <div className="text-xs text-[#d4af37]">%</div>
            </div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">
              2.1%+
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Percentage of total supply permanently burned
            </div>
          </div>

          {/* Real-time Status */}
          <div className="text-center py-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wide">
              {pledgeStats ? '🔥 BURNS ACTIVE' : '⏳ LOADING BURN DATA'}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Each pledge automatically creates buy pressure + burns
            </div>
          </div>

          {/* COMMENTED OUT - AWAITING UI DESIGN */}
          {/*
          <div className="sophisticated-burn-analytics">
            <BurnChart data={burnHistory} />
            <SupplyReductionTracker />
            <BurnPredictionModel />
            <DeflatinaryImpactMetrics />
            <RealTimeBurnFeed />
          </div>
          */}

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Burns powered by <span className="font-bold">Real DEX Trading</span><br />
            Creating genuine deflationary pressure
          </div>
        </div>
      </footer>
    </div>
  );
}