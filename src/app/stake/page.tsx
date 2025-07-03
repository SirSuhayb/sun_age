"use client";

import { useUserPremiumStatus } from '~/hooks/useRenaissanceStats';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function StakePage() {
  const router = useRouter();
  const { solarBalance, isLoading } = useUserPremiumStatus();

  // Mock data for staking UI (will be replaced with real contract integration)
  const mockStakingData = {
    currentAPY: 25.5,
    totalStaked: 15_000_000,
    userStaked: 1_000_000,
    rewardsEarned: 50_000,
    timeToNextReward: 86400, // 1 day in seconds
    emissionRate: 50_000, // SOLAR per month
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9]">
        <div className="text-center">
          <PulsingStarSpinner />
          <p className="text-gray-600 font-mono text-sm mt-4">Loading Staking Data...</p>
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
            <div className="text-4xl">💎</div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-2">SOLAR Staking</h1>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            STAKE SOLAR TO EARN REWARDS & ENHANCED FEATURES
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <div className="space-y-4">
          
          {/* FUTURE FEATURE PREVIEW - MOCKUP UI */}
          
          {/* Coming Soon Banner */}
          <div className="border border-yellow-400 bg-yellow-50 p-4 text-center">
            <div className="text-lg font-serif font-bold text-yellow-700 mb-2">🚧 COMING SOON 🚧</div>
            <div className="text-sm text-yellow-600">
              Staking functionality is being developed and will be available in the next release.
              Preview the interface below!
            </div>
          </div>

          {/* User Balance */}
          <div className="border border-[#d4af37] bg-[#fffbe9] p-4">
            <div className="text-sm font-mono text-[#d4af37] uppercase tracking-wide mb-2">AVAILABLE TO STAKE</div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">
              {solarBalance?.formatted || '0'} SOLAR
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Your current SOLAR balance ready for staking
            </div>
          </div>

          {/* Mock Current APY */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">CURRENT APY</div>
              <div className="text-xs text-gray-500">%</div>
            </div>
            <div className="text-2xl font-serif font-bold text-green-600">
              {mockStakingData.currentAPY}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Starts high, decreases 2% monthly (tokenomics model)
            </div>
          </div>

          {/* Mock Total Staked */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">TOTAL STAKED</div>
              <div className="text-xs text-gray-500">SOLAR</div>
            </div>
            <div className="text-2xl font-serif font-bold text-black">
              {(mockStakingData.totalStaked / 1_000_000).toFixed(1)}M SOLAR
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Community-wide staking participation
            </div>
          </div>

          {/* Mock User Staked */}
          <div className="border border-blue-300 bg-blue-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-blue-700 uppercase tracking-wide">YOUR STAKED</div>
              <div className="text-xs text-blue-600">SOLAR</div>
            </div>
            <div className="text-2xl font-serif font-bold text-blue-700">
              {(mockStakingData.userStaked / 1_000_000).toFixed(1)}M SOLAR
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Currently earning {(mockStakingData.userStaked * mockStakingData.currentAPY / 100 / 365).toFixed(0)} SOLAR/day
            </div>
          </div>

          {/* Mock Rewards Earned */}
          <div className="border border-green-300 bg-green-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-mono text-green-700 uppercase tracking-wide">REWARDS EARNED</div>
              <div className="text-xs text-green-600">SOLAR</div>
            </div>
            <div className="text-2xl font-serif font-bold text-green-700">
              {(mockStakingData.rewardsEarned / 1_000).toFixed(0)}K SOLAR
            </div>
            <div className="text-xs text-green-600 mt-1">
              Available to claim or compound
            </div>
          </div>

          {/* Staking Benefits */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">STAKING BENEFITS</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">🎯 Enhanced Features</span>
                <span className="text-sm font-bold">Boosted Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">💰 Yield Generation</span>
                <span className="text-sm font-bold">25-30% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">🗳️ Governance Rights</span>
                <span className="text-sm font-bold">Voting Power</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">⚡ Priority Support</span>
                <span className="text-sm font-bold">Fast-Track</span>
              </div>
            </div>
          </div>

          {/* Emission Schedule */}
          <div className="border border-purple-300 bg-purple-50 p-4">
            <div className="text-sm font-mono text-purple-700 uppercase tracking-wide mb-4">EMISSION SCHEDULE</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Monthly Emission</span>
                <span className="text-sm font-bold">{mockStakingData.emissionRate.toLocaleString()} SOLAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Reduction Rate</span>
                <span className="text-sm font-bold">2% per month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Total Duration</span>
                <span className="text-sm font-bold">60 months</span>
              </div>
            </div>
            <div className="text-xs text-purple-600 mt-3">
              Decreasing APY creates scarcity and long-term value
            </div>
          </div>

          {/* Mock Staking Actions (Disabled) */}
          <div className="border border-gray-300 bg-gray-50 p-4 opacity-60">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">STAKING ACTIONS</div>
            <div className="space-y-3">
              <button 
                disabled 
                className="w-full py-3 bg-gray-300 text-gray-500 font-mono text-sm uppercase border border-gray-300 cursor-not-allowed"
              >
                STAKE SOLAR (COMING SOON)
              </button>
              <button 
                disabled 
                className="w-full py-3 bg-gray-300 text-gray-500 font-mono text-sm uppercase border border-gray-300 cursor-not-allowed"
              >
                UNSTAKE SOLAR (COMING SOON)
              </button>
              <button 
                disabled 
                className="w-full py-3 bg-gray-300 text-gray-500 font-mono text-sm uppercase border border-gray-300 cursor-not-allowed"
              >
                CLAIM REWARDS (COMING SOON)
              </button>
            </div>
          </div>

          {/* Development Status */}
          <div className="text-center py-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wide">
              🔨 IN DEVELOPMENT
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Staking contract being finalized • UI ready for integration
            </div>
          </div>

          {/* COMMENTED OUT - AWAITING CONTRACT DEPLOYMENT */}
          {/*
          <div className="staking-contract-integration">
            <StakingPoolManager />
            <RewardDistribution />
            <LockupPeriods />
            <CompoundingOptions />
            <StakingAnalytics />
          </div>
          */}

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Staking rewards from <span className="font-bold">Token Emissions</span><br />
            Aligned incentives for long-term holders
          </div>
        </div>
      </footer>
    </div>
  );
}