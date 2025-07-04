"use client";

import { useRenaissanceStats, useMorphoStats } from '~/hooks/useRenaissanceStats';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TreasuryPage() {
  const router = useRouter();
  const { morphoStats, aggregateStats, isLoading } = useRenaissanceStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9]">
        <div className="text-center">
          <PulsingStarSpinner />
          <p className="text-gray-600 font-mono text-sm mt-4">Loading Treasury Data...</p>
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
            <Image
              src="/sunsun.png"
              alt="Treasury"
              width={60}
              height={60}
              className="mx-auto opacity-80"
            />
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-2">Treasury Dashboard</h1>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            MORPHO YIELD GENERATION & REVENUE TRACKING
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <div className="space-y-4">
          
          {/* REAL DATA - SHELL UI */}
          
          {/* Treasury Balance */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">MORPHO BALANCE</div>
              <div className="text-xs text-gray-500">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              ${morphoStats?.balance || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Treasury earning yield via Morpho protocol
            </div>
          </div>

          {/* Current APY */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">CURRENT APY</div>
              <div className="text-xs text-gray-500">%</div>
            </div>
            <div className="text-2xl font-serif font-bold text-green-600">
              {morphoStats?.currentAPY || '0.00'}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Variable rate based on market conditions
            </div>
          </div>

          {/* Total Deposited */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">TOTAL DEPOSITED</div>
              <div className="text-xs text-gray-500">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              ${morphoStats?.totalDeposited || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Lifetime deposits from pledge revenue (50%)
            </div>
          </div>

          {/* Yield Generated */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">YIELD GENERATED</div>
              <div className="text-xs text-gray-500">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-green-600">
              ${morphoStats?.yieldGenerated || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total yield earned from Morpho lending
            </div>
          </div>

          {/* Revenue Allocation */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">REVENUE ALLOCATION</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ Morpho Treasury</span>
                <span className="text-sm font-bold">50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ Operations</span>
                <span className="text-sm font-bold">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">→ SOLAR Burns</span>
                <span className="text-sm font-bold">10%</span>
              </div>
            </div>
          </div>

          {/* Ecosystem Value */}
          <div className="border border-[#d4af37] bg-[#fffbe9] p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-[#d4af37] uppercase tracking-wide">TOTAL ECOSYSTEM VALUE</div>
              <div className="text-xs text-[#d4af37]">USDC</div>
            </div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">
              ${aggregateStats?.totalEcosystemValue || '0.00'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Combined pledges + treasury balance
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center py-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wide">
              {morphoStats ? '✅ TREASURY ACTIVE' : '⏳ LOADING TREASURY DATA'}
            </div>
          </div>

          {/* COMMENTED OUT - AWAITING UI DESIGN */}
          {/*
          <div className="sophisticated-treasury-widget">
            <YieldChart data={morphoStats.history} />
            <RevenueBreakdown splits={morphoStats.splits} />
            <ProjectedReturns timeframe="1year" />
            <HistoricalPerformance />
            <AdvancedTreasuryMetrics />
          </div>
          */}

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Treasury powered by <span className="font-bold">Morpho</span><br />
            Yield generation for SOLAR holders
          </div>
        </div>
      </footer>
    </div>
  );
}