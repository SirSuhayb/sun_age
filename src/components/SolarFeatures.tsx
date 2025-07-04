'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSolarIntegration, type SolarFeature, SOLAR_FEATURES } from '@/hooks/useSolarIntegration';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PulsingStarSpinner } from '@/components/ui/PulsingStarSpinner';

interface SolarFeaturesProps {
  className?: string;
  showOnlyAccessible?: boolean;
  onFeatureUse?: (feature: SolarFeature) => void;
}

interface FeatureCardProps {
  feature: SolarFeature;
  hasAccess: boolean;
  isUsingFeature: boolean;
  solarBalance: bigint;
  formatSolarAmount: (amount: bigint) => string;
  onUse: (feature: SolarFeature) => Promise<void>;
  onFeatureUse?: (feature: SolarFeature) => void;
}

function FeatureCard({ 
  feature, 
  hasAccess, 
  isUsingFeature, 
  solarBalance,
  formatSolarAmount,
  onUse,
  onFeatureUse 
}: FeatureCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const featureInfo = SOLAR_FEATURES[feature];
  const requirementBigInt = BigInt(featureInfo.requirement) * BigInt(10 ** 18);
  const formattedRequirement = formatSolarAmount(requirementBigInt);
  const formattedBalance = formatSolarAmount(solarBalance);

  const handleUse = async () => {
    if (!hasAccess || isLoading) return;
    
    setIsLoading(true);
    try {
      await onUse(feature);
      onFeatureUse?.(feature);
    } catch (error) {
      console.error('Error using feature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = solarBalance > 0n ? 
    Math.min(100, (Number(solarBalance) / Number(requirementBigInt)) * 100) : 0;

  return (
    <Card className="p-6 border-2 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{featureInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{featureInfo.name}</h3>
            <p className="text-sm text-gray-600">{featureInfo.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {hasAccess ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              ✓ Access Granted
            </span>
          ) : (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              Requires {formattedRequirement} SOLAR
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for non-accessible features */}
      {!hasAccess && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Your SOLAR: {formattedBalance}</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-end">
        {hasAccess ? (
          <Button
            onClick={handleUse}
            disabled={isLoading || isUsingFeature}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          >
            {isLoading || isUsingFeature ? (
              <>
                <PulsingStarSpinner />
                Using...
              </>
            ) : (
              'Use Feature'
            )}
          </Button>
        ) : (
          <div className="text-sm text-gray-500">
            Need {formatSolarAmount(requirementBigInt - solarBalance)} more SOLAR
          </div>
        )}
      </div>
    </Card>
  );
}

function SolarStatsCard({ stats, formatSolarAmount }: { 
  stats: ReturnType<typeof useSolarIntegration>['stats']; 
  formatSolarAmount: (amount: bigint) => string;
}) {
  if (!stats) return null;

  const burnPercentage = stats.totalSupply > 0n ? 
    (Number(stats.burnedAmount) / Number(stats.totalSupply)) * 100 : 0;

  return (
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <h3 className="text-xl font-bold text-orange-800">SOLAR Token Stats</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatSolarAmount(stats.totalSupply)}
          </div>
          <div className="text-sm text-gray-600">Total Supply</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatSolarAmount(stats.burnedAmount)}
          </div>
          <div className="text-sm text-gray-600">Burned</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {burnPercentage.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">Supply Burned</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
      </div>
      
      {stats.burnCount > 0 && (
        <div className="mt-4 p-3 bg-orange-100 rounded-lg">
          <div className="text-sm text-orange-800">
            🔥 <strong>{stats.burnCount}</strong> burn event{stats.burnCount > 1 ? 's' : ''} completed
          </div>
        </div>
      )}
    </Card>
  );
}

export function SolarFeatures({ className = '', showOnlyAccessible = false, onFeatureUse }: SolarFeaturesProps) {
  const { isConnected } = useAccount();
  const {
    solarBalance,
    formattedBalance,
    isLoading,
    hasAccess,
    accessibleFeatures,
    useFeature,
    isUsingFeature,
    stats,
    formatSolarAmount,
  } = useSolarIntegration();

  if (!isConnected) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">SOLAR Premium Features</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to access premium features with SOLAR tokens
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
            Connect Wallet
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <PulsingStarSpinner />
          </div>
          <p>Loading SOLAR features...</p>
        </Card>
      </div>
    );
  }

  const allFeatures = Object.keys(SOLAR_FEATURES) as SolarFeature[];
  const featuresToShow = showOnlyAccessible 
    ? allFeatures.filter(feature => hasAccess(feature))
    : allFeatures;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with SOLAR balance */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-orange-800 mb-2">
              SOLAR Premium Features
            </h2>
            <p className="text-gray-600">
              Hold SOLAR tokens to unlock exclusive features and capabilities
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600">
              {formattedBalance}
            </div>
            <div className="text-sm text-gray-600">Your SOLAR Balance</div>
            {accessibleFeatures.length > 0 && (
              <div className="text-sm text-green-600 mt-1">
                {accessibleFeatures.length} feature{accessibleFeatures.length > 1 ? 's' : ''} unlocked
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Global SOLAR stats */}
      <SolarStatsCard stats={stats} formatSolarAmount={formatSolarAmount} />

      {/* Features grid */}
      {featuresToShow.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {featuresToShow.map(feature => (
            <FeatureCard
              key={feature}
              feature={feature}
              hasAccess={hasAccess(feature)}
              isUsingFeature={isUsingFeature}
              solarBalance={solarBalance}
              formatSolarAmount={formatSolarAmount}
              onUse={useFeature}
              onFeatureUse={onFeatureUse}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <span className="text-4xl mb-4 block">🌟</span>
          <h3 className="text-xl font-bold mb-2">
            {showOnlyAccessible ? 'No Features Unlocked' : 'Get Started with SOLAR'}
          </h3>
          <p className="text-gray-600 mb-4">
            {showOnlyAccessible 
              ? 'Hold SOLAR tokens to unlock premium features'
              : 'Start your cosmic journey by acquiring SOLAR tokens'
            }
          </p>
          
          {!showOnlyAccessible && (
            <div className="space-y-2 text-sm text-gray-600">
              <p>Minimum requirements:</p>
              <ul className="space-y-1">
                <li>• Governance Voting: 1M SOLAR</li>
                <li>• Priority Support: 3M SOLAR</li>
                <li>• Advanced Analytics: 5M SOLAR</li>
                <li>• Custom Milestones: 15M SOLAR</li>
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Call to action for users with insufficient SOLAR */}
      {solarBalance === 0n && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <span className="text-3xl mb-4 block">🚀</span>
            <h3 className="text-xl font-bold mb-2">Ready to Unlock SOLAR Features?</h3>
            <p className="text-gray-600 mb-4">
              Get SOLAR tokens to access premium features and join the cosmic community
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              Get SOLAR Tokens
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SolarFeatures;