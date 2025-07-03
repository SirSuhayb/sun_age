"use client";

import { useUserPremiumStatus } from '~/hooks/useRenaissanceStats';
import { PREMIUM_FEATURES, getAccessibleFeatures, getNextFeatureUnlock } from '~/lib/renaissance';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PremiumPage() {
  const router = useRouter();
  const { qualification, solarBalance, isLoading } = useUserPremiumStatus();

  const userSolarBalanceRaw = solarBalance?.balanceRaw || 0n;
  const accessibleFeatures = getAccessibleFeatures(userSolarBalanceRaw);
  const nextFeature = getNextFeatureUnlock(userSolarBalanceRaw);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbe9]">
        <div className="text-center">
          <PulsingStarSpinner />
          <p className="text-gray-600 font-mono text-sm mt-4">Loading Premium Status...</p>
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
            <div className="text-4xl">⭐</div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black mb-2">Premium Features</h1>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            ENHANCED FEATURES FOR SOLAR HOLDERS
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-8">
        <div className="space-y-4">
          
          {/* User Status */}
          <div className="border border-[#d4af37] bg-[#fffbe9] p-4">
            <div className="text-sm font-mono text-[#d4af37] uppercase tracking-wide mb-2">YOUR SOLAR BALANCE</div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">
              {solarBalance?.formatted || '0'} SOLAR
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {accessibleFeatures.length} of {Object.keys(PREMIUM_FEATURES).length} features unlocked
            </div>
          </div>

          {/* Premium Qualification */}
          {qualification && (
            <div className="border border-green-300 bg-green-50 p-4">
              <div className="text-sm font-mono text-green-700 uppercase tracking-wide mb-2">PLEDGE QUALIFICATION</div>
              <div className="text-lg font-serif font-bold text-green-700">
                {qualification.qualifies ? '✅ QUALIFIED' : '❌ NOT QUALIFIED'}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Pledge Amount: ${qualification.pledgeAmount}
              </div>
            </div>
          )}

          {/* REAL DATA - FEATURE ACCESS */}
          
          {/* Accessible Features */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">UNLOCKED FEATURES</div>
            {accessibleFeatures.length > 0 ? (
              <div className="space-y-3">
                {accessibleFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200">
                    <div className="text-lg">{feature.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-green-700">{feature.name}</div>
                      <div className="text-xs text-green-600">{feature.description}</div>
                    </div>
                    <div className="text-xs text-green-500">✅</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-sm">No features unlocked yet</div>
                <div className="text-xs mt-1">Acquire SOLAR tokens to unlock features</div>
              </div>
            )}
          </div>

          {/* Next Feature to Unlock */}
          {nextFeature && (
            <div className="border border-blue-300 bg-blue-50 p-4">
              <div className="text-sm font-mono text-blue-700 uppercase tracking-wide mb-2">NEXT UNLOCK</div>
              <div className="flex items-center gap-3">
                <div className="text-lg">{nextFeature.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-700">{nextFeature.name}</div>
                  <div className="text-xs text-blue-600">{nextFeature.description}</div>
                  <div className="text-xs text-blue-500 mt-1">
                    Need: {(Number(nextFeature.requirement) / 1e24).toLocaleString()} SOLAR
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Premium Features */}
          <div className="border border-gray-300 bg-white p-4">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wide mb-4">ALL PREMIUM FEATURES</div>
            <div className="space-y-3">
              {Object.values(PREMIUM_FEATURES).map((feature) => {
                const isUnlocked = userSolarBalanceRaw >= feature.requirement;
                return (
                  <div key={feature.id} className={`flex items-center gap-3 p-2 border ${
                    isUnlocked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="text-lg">{feature.icon}</div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${isUnlocked ? 'text-green-700' : 'text-gray-600'}`}>
                        {feature.name}
                      </div>
                      <div className={`text-xs ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}>
                        {feature.description}
                      </div>
                      <div className={`text-xs mt-1 ${isUnlocked ? 'text-green-500' : 'text-gray-400'}`}>
                        {(Number(feature.requirement) / 1e24).toLocaleString()} SOLAR required
                      </div>
                    </div>
                    <div className="text-xs">
                      {isUnlocked ? '✅' : '🔒'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alternative Access */}
          <div className="border border-purple-300 bg-purple-50 p-4">
            <div className="text-sm font-mono text-purple-700 uppercase tracking-wide mb-4">ALTERNATIVE ACCESS</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">High-Value Pledge ($50+)</span>
                <span className="text-sm font-bold">30 Days Premium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">USDC Subscription</span>
                <span className="text-sm font-bold">$5-100/month</span>
              </div>
              <div className="text-xs text-purple-600 mt-2">
                Multiple ways to access features beyond SOLAR holdings
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center py-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wide">
              {solarBalance ? '⭐ PREMIUM STATUS ACTIVE' : '⏳ LOADING STATUS'}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Features unlock automatically based on your SOLAR balance
            </div>
          </div>

          {/* COMMENTED OUT - AWAITING UI DESIGN */}
          {/*
          <div className="sophisticated-premium-features">
            <FeatureUsageAnalytics />
            <PremiumSubscriptionManager />
            <FeatureAccessTimeline />
            <SOLARRequirementCalculator />
            <PremiumUserBenefits />
          </div>
          */}

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Features unlock with <span className="font-bold">SOLAR Holdings</span><br />
            Real utility for token holders
          </div>
        </div>
      </footer>
    </div>
  );
}