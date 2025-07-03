"use client";

import { useRenaissanceStats } from '~/hooks/useRenaissanceStats';
import { FEATURE_FLAGS } from '~/lib/renaissance';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RenaissancePage() {
  const router = useRouter();
  const { 
    pledgeStats, 
    morphoStats, 
    utilityStats, 
    userSolarBalance, 
    userPremiumQualification,
    aggregateStats,
    isLoading 
  } = useRenaissanceStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9]">
        <div className="text-center">
          <PulsingStarSpinner />
          <p className="text-gray-600 font-mono text-sm mt-4">Loading Renaissance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbe9] flex flex-col">
      {/* Header */}
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-4">
        <button
          onClick={() => router.push('/soldash')}
          className="mb-4 text-xs text-gray-500 font-mono hover:underline bg-transparent border-none flex items-center gap-1"
          style={{ letterSpacing: '0.05em' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> BACK TO DASHBOARD
        </button>

        <div className="text-center mb-6">
          <div className="relative mb-4">
            <Image
              src="/sunsun.png"
              alt="Solar Renaissance"
              width={80}
              height={80}
              className="mx-auto"
              style={{ filter: 'drop-shadow(0 0 20px #FFD700cc)' }}
            />
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-2">SOLAR Renaissance</h1>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            NEXT-GENERATION SOLAR ECOSYSTEM
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <div className="space-y-4">
          
          {/* Ecosystem Overview */}
          <div className="border border-[#d4af37] bg-[#fffbe9] p-4">
            <div className="text-sm font-mono text-[#d4af37] uppercase tracking-wide mb-4">ECOSYSTEM OVERVIEW</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Pledges</span>
                <span className="text-sm font-bold">${pledgeStats?.totalVolume || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">SOLAR Burned</span>
                <span className="text-sm font-bold">{pledgeStats?.solarBurned || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Treasury Balance</span>
                <span className="text-sm font-bold">${morphoStats?.balance || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Active Pledgers</span>
                <span className="text-sm font-bold">{pledgeStats?.activePledgers || 0}</span>
              </div>
            </div>
          </div>

          {/* User Status */}
          <div className="border border-blue-300 bg-blue-50 p-4">
            <div className="text-sm font-mono text-blue-700 uppercase tracking-wide mb-4">YOUR STATUS</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">SOLAR Balance</span>
                <span className="text-sm font-bold">{userSolarBalance?.formatted || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Premium Access</span>
                <span className="text-sm font-bold">
                  {userPremiumQualification?.qualifies ? '✅ Qualified' : '❌ Not Qualified'}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Navigation */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">RENAISSANCE FEATURES</div>
            <div className="space-y-3">
              
              {/* Treasury Dashboard */}
              {FEATURE_FLAGS.ENABLE_TREASURY_DASHBOARD && (
                <Link href="/treasury" className="block">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 hover:border-[#d4af37] hover:bg-[#fffbe9] transition-colors">
                    <div className="text-2xl">🏛️</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-black">Treasury Dashboard</div>
                      <div className="text-xs text-gray-600">Morpho yield generation & revenue tracking</div>
                    </div>
                    <div className="text-xs text-[#d4af37]">→</div>
                  </div>
                </Link>
              )}

              {/* Burn Analytics */}
              {FEATURE_FLAGS.ENABLE_BURN_ANALYTICS && (
                <Link href="/burns" className="block">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 hover:border-[#d4af37] hover:bg-[#fffbe9] transition-colors">
                    <div className="text-2xl">🔥</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-black">Burn Analytics</div>
                      <div className="text-xs text-gray-600">Real DEX burns & deflationary metrics</div>
                    </div>
                    <div className="text-xs text-[#d4af37]">→</div>
                  </div>
                </Link>
              )}

              {/* Premium Features */}
              {FEATURE_FLAGS.ENABLE_PREMIUM_FEATURES && (
                <Link href="/premium" className="block">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 hover:border-[#d4af37] hover:bg-[#fffbe9] transition-colors">
                    <div className="text-2xl">⭐</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-black">Premium Features</div>
                      <div className="text-xs text-gray-600">Enhanced features for SOLAR holders</div>
                    </div>
                    <div className="text-xs text-[#d4af37]">→</div>
                  </div>
                </Link>
              )}

              {/* Staking Interface */}
              {FEATURE_FLAGS.ENABLE_STAKING && (
                <Link href="/stake" className="block">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 hover:border-[#d4af37] hover:bg-[#fffbe9] transition-colors">
                    <div className="text-2xl">💎</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-black">SOLAR Staking</div>
                      <div className="text-xs text-gray-600">Stake SOLAR for rewards & enhanced access</div>
                    </div>
                    <div className="text-xs text-[#d4af37]">→</div>
                  </div>
                </Link>
              )}

              {/* Staking (Coming Soon) */}
              {!FEATURE_FLAGS.ENABLE_STAKING && (
                <Link href="/stake" className="block">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 opacity-75">
                    <div className="text-2xl">💎</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-600">SOLAR Staking</div>
                      <div className="text-xs text-gray-500">Coming soon - preview available</div>
                    </div>
                    <div className="text-xs text-gray-400">🚧</div>
                  </div>
                </Link>
              )}

            </div>
          </div>

          {/* Key Metrics */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">KEY METRICS</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 border border-gray-200">
                <div className="text-lg font-serif font-bold text-black">${aggregateStats?.totalEcosystemValue || '0.00'}</div>
                <div className="text-xs text-gray-600">Ecosystem Value</div>
              </div>
              <div className="text-center p-2 border border-gray-200">
                <div className="text-lg font-serif font-bold text-red-600">{pledgeStats?.solarBurned || '0'}</div>
                <div className="text-xs text-gray-600">SOLAR Burned</div>
              </div>
              <div className="text-center p-2 border border-gray-200">
                <div className="text-lg font-serif font-bold text-green-600">{morphoStats?.currentAPY || '0.00'}%</div>
                <div className="text-xs text-gray-600">Treasury APY</div>
              </div>
              <div className="text-center p-2 border border-gray-200">
                <div className="text-lg font-serif font-bold text-blue-600">{(aggregateStats?.burnRate || 0).toFixed(0)}</div>
                <div className="text-xs text-gray-600">Burn Rate</div>
              </div>
            </div>
          </div>

          {/* Development Status */}
          <div className="border border-green-300 bg-green-50 p-4">
            <div className="text-sm font-mono text-green-700 uppercase tracking-wide mb-4">DEVELOPMENT STATUS</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">✅ SolarPledgeV3</span>
                <span className="text-xs text-green-600">Deployed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">✅ MorphoTreasury</span>
                <span className="text-xs text-green-600">Deployed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">✅ SolarUtility</span>
                <span className="text-xs text-green-600">Deployed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-yellow-700">🚧 Staking Contract</span>
                <span className="text-xs text-yellow-600">Development</span>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="border border-purple-300 bg-purple-50 p-4">
            <div className="text-sm font-mono text-purple-700 uppercase tracking-wide mb-4">FEATURE FLAGS</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-700">V3 Pledges</span>
                <span className={FEATURE_FLAGS.ENABLE_V3_PLEDGES ? 'text-green-600' : 'text-red-600'}>
                  {FEATURE_FLAGS.ENABLE_V3_PLEDGES ? '✅ ON' : '❌ OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Premium Features</span>
                <span className={FEATURE_FLAGS.ENABLE_PREMIUM_FEATURES ? 'text-green-600' : 'text-red-600'}>
                  {FEATURE_FLAGS.ENABLE_PREMIUM_FEATURES ? '✅ ON' : '❌ OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Treasury Dashboard</span>
                <span className={FEATURE_FLAGS.ENABLE_TREASURY_DASHBOARD ? 'text-green-600' : 'text-red-600'}>
                  {FEATURE_FLAGS.ENABLE_TREASURY_DASHBOARD ? '✅ ON' : '❌ OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Burn Analytics</span>
                <span className={FEATURE_FLAGS.ENABLE_BURN_ANALYTICS ? 'text-green-600' : 'text-red-600'}>
                  {FEATURE_FLAGS.ENABLE_BURN_ANALYTICS ? '✅ ON' : '❌ OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Staking</span>
                <span className={FEATURE_FLAGS.ENABLE_STAKING ? 'text-green-600' : 'text-red-600'}>
                  {FEATURE_FLAGS.ENABLE_STAKING ? '✅ ON' : '❌ OFF'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            <span className="font-bold">SOLAR Renaissance</span> • Next-Gen Ecosystem<br />
            Real utility • Real yields • Real burns
          </div>
        </div>
      </footer>
    </div>
  );
}