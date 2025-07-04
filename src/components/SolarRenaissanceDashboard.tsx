"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSolarRenaissance } from '~/hooks/useSolarRenaissance';
import { PREMIUM_FEATURES } from '~/lib/contracts';
import { formatEther, formatUnits } from 'viem';

interface SolarRenaissanceDashboardProps {
  className?: string;
}

export function SolarRenaissanceDashboard({ className = "" }: SolarRenaissanceDashboardProps) {
  const { address } = useAccount();
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [purchaseDuration, setPurchaseDuration] = useState<number>(30);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const {
    userStatus,
    ecosystemStats,
    treasuryStats,
    approveUSDC,
    purchaseFeatureAccess,
    checkFeatureAccess,
    isLoading,
    error,
    allowance,
    isApprovalPending,
    isApprovalConfirmed,
    isPurchaseConfirmed,
    refetchUserData,
    refetchEcosystemData,
  } = useSolarRenaissance();

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      refetchEcosystemData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchEcosystemData]);

  const handlePurchaseFeature = async (feature: string, duration: number) => {
    try {
      // Calculate required USDC amount (simplified - would get from contract in real implementation)
      const basePrice = 10; // $10 base price
      const multiplier = duration === 30 ? 1 : duration === 90 ? 2.7 : 9.6; // Discounts for longer periods
      const totalPrice = basePrice * multiplier;
      const usdcAmount = BigInt(totalPrice * 1_000_000); // Convert to USDC (6 decimals)

      // Check if approved
      if (!allowance || allowance < usdcAmount) {
        await approveUSDC(usdcAmount);
      }

      // Purchase feature access
      await purchaseFeatureAccess(feature, duration);
      setShowPurchaseModal(false);
      await refetchUserData();
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  if (!address) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">SOLAR Renaissance</h3>
          <p className="text-gray-600">Connect your wallet to access premium features</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Status Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🌞</span>
          Your SOLAR Status
        </h3>
        
        {userStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatEther(userStatus.solarBalance)}
              </div>
              <div className="text-sm text-gray-600">SOLAR Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${formatUnits(userStatus.usdcBalance, 6)}
              </div>
              <div className="text-sm text-gray-600">USDC Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userStatus.accessibleFeatures.length}
              </div>
              <div className="text-sm text-gray-600">Premium Features</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Loading your status...</div>
        )}
      </div>

      {/* Premium Features */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>⭐</span>
          Premium Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PREMIUM_FEATURES).map(([key, feature]) => {
            const hasAccess = checkFeatureAccess(feature);
            
            return (
              <div
                key={feature}
                className={`border rounded-lg p-4 ${
                  hasAccess ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{feature.replace(/_/g, ' ').toUpperCase()}</h4>
                  {hasAccess ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedFeature(feature);
                        setShowPurchaseModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Purchase
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {feature === 'premium_analytics' && 'Advanced data insights'}
                  {feature === 'custom_milestones' && 'Personalized milestone tracking'}
                  {feature === 'priority_support' && 'Fast customer support'}
                  {feature === 'advanced_journey' && 'Enhanced user experience'}
                  {feature === 'api_access' && 'Developer API access'}
                  {feature === 'early_access' && 'Beta feature previews'}
                  {feature === 'vip_support' && 'VIP treatment'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ecosystem Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🔥</span>
          SOLAR Renaissance Stats
        </h3>
        
        {ecosystemStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">
                {formatEther(ecosystemStats.burnedAmount)}
              </div>
              <div className="text-sm text-gray-600">SOLAR Burned</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {ecosystemStats.burnCount.toString()}
              </div>
              <div className="text-sm text-gray-600">Burn Events</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                ${formatUnits(ecosystemStats.morphoRevenue, 6)}
              </div>
              <div className="text-sm text-gray-600">Holder Benefits</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                ${formatUnits(ecosystemStats.companyRevenue, 6)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Loading ecosystem stats...</div>
        )}
      </div>

      {/* Treasury Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏛️</span>
          Morpho Treasury
        </h3>
        
        {treasuryStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                ${formatUnits(treasuryStats.totalBalance, 6)}
              </div>
              <div className="text-sm text-gray-600">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                ${formatUnits(treasuryStats.totalYield, 6)}
              </div>
              <div className="text-sm text-gray-600">Total Yield</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {(Number(treasuryStats.estimatedAPY) / 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Est. APY</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {new Date(Number(treasuryStats.lastUpdate) * 1000).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Last Update</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Loading treasury stats...</div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error.message}
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Purchase {selectedFeature.replace(/_/g, ' ').toUpperCase()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={purchaseDuration}
                  onChange={(e) => setPurchaseDuration(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={30}>1 Month - $10</option>
                  <option value={90}>3 Months - $27 (10% off)</option>
                  <option value={365}>1 Year - $96 (20% off)</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchaseFeature(selectedFeature, purchaseDuration)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}