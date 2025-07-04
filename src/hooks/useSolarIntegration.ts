import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther, keccak256, toBytes } from 'viem';

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const SOLAR_TOKEN_ADDRESS = '0x746042147240304098c837563aaec0f671881b07' as const;
export const SOLAR_INTEGRATION_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_INTEGRATION_ADDRESS as `0x${string}`;

// ABI for SOLAR token (ERC20)
export const SOLAR_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ABI for SOLAR Integration contract
export const SOLAR_INTEGRATION_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }, { name: 'feature', type: 'bytes32' }],
    name: 'checkAccess',
    outputs: [{ name: 'hasAccess', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserStatus',
    outputs: [
      { name: 'balance', type: 'uint256' },
      { name: 'accessList', type: 'bytes32[]' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'feature', type: 'bytes32' }],
    name: 'useFeature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { name: 'totalSupply', type: 'uint256' },
      { name: 'burnedAmount', type: 'uint256' },
      { name: 'burnCount', type: 'uint256' },
      { name: 'totalUsers', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllFeatureRequirements',
    outputs: [
      { name: 'features', type: 'bytes32[]' },
      { name: 'requirements', type: 'uint256[]' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Feature definitions
export const SOLAR_FEATURES = {
  premium_analytics: {
    name: 'Advanced Solar Analytics',
    description: 'Deep insights into your cosmic journey with advanced charts and predictions',
    requirement: '5000000', // 5M SOLAR
    icon: '📊',
  },
  custom_milestones: {
    name: 'Custom Cosmic Milestones',
    description: 'Create and track personalized milestones in your solar journey',
    requirement: '15000000', // 15M SOLAR
    icon: '🎯',
  },
  priority_support: {
    name: 'Priority Support',
    description: 'Get priority access to customer support and feature requests',
    requirement: '3000000', // 3M SOLAR
    icon: '🚀',
  },
  advanced_journey: {
    name: 'Advanced Journey Features',
    description: 'Enhanced journey tracking with detailed cosmic insights',
    requirement: '10000000', // 10M SOLAR
    icon: '🌌',
  },
  api_access: {
    name: 'API Access',
    description: 'Programmatic access to your solar data and platform features',
    requirement: '25000000', // 25M SOLAR
    icon: '🔗',
  },
  governance_vote: {
    name: 'Governance Voting',
    description: 'Vote on platform changes and future development direction',
    requirement: '1000000', // 1M SOLAR
    icon: '🗳️',
  },
  early_access: {
    name: 'Early Access',
    description: 'Get early access to new features before public release',
    requirement: '5000000', // 5M SOLAR
    icon: '⚡',
  },
} as const;

export type SolarFeature = keyof typeof SOLAR_FEATURES;

interface UseSolarIntegrationReturn {
  // Balance and access
  solarBalance: bigint;
  formattedBalance: string;
  isLoading: boolean;
  
  // Feature access
  hasAccess: (feature: SolarFeature) => boolean;
  accessibleFeatures: SolarFeature[];
  
  // Actions
  useFeature: (feature: SolarFeature) => Promise<void>;
  isUsingFeature: boolean;
  
  // Stats
  stats: {
    totalSupply: bigint;
    burnedAmount: bigint;
    burnCount: number;
    totalUsers: number;
  } | null;
  
  // Utilities
  getFeatureInfo: (feature: SolarFeature) => typeof SOLAR_FEATURES[SolarFeature];
  formatSolarAmount: (amount: bigint) => string;
  checkMinimumHolding: (feature: SolarFeature) => boolean;
}

export function useSolarIntegration(): UseSolarIntegrationReturn {
  const { address, isConnected } = useAccount();
  const [accessibleFeatures, setAccessibleFeatures] = useState<SolarFeature[]>([]);
  const [isUsingFeature, setIsUsingFeature] = useState(false);

  // Get SOLAR balance
  const { data: solarBalance = 0n, isLoading: balanceLoading } = useReadContract({
    address: SOLAR_TOKEN_ADDRESS,
    abi: SOLAR_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get user status (balance + accessible features)
  const { data: userStatus, isLoading: statusLoading } = useReadContract({
    address: SOLAR_INTEGRATION_ADDRESS,
    abi: SOLAR_INTEGRATION_ABI,
    functionName: 'getUserStatus',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!SOLAR_INTEGRATION_ADDRESS },
  });

  // Get global stats
  const { data: stats } = useReadContract({
    address: SOLAR_INTEGRATION_ADDRESS,
    abi: SOLAR_INTEGRATION_ABI,
    functionName: 'getStats',
    query: { enabled: !!SOLAR_INTEGRATION_ADDRESS },
  });

  // Write contract for using features
  const { writeContractAsync } = useWriteContract();

  // Update accessible features when user status changes
  useEffect(() => {
    if (userStatus && userStatus[1]) {
      const accessList = userStatus[1] as readonly `0x${string}`[];
      const features = accessList.map(bytes32Feature => {
        // Convert bytes32 back to feature name
        try {
          const hexString = bytes32Feature.slice(2); // Remove '0x'
          const cleanHex = hexString.replace(/00+$/, ''); // Remove trailing zeros
          const featureName = Buffer.from(cleanHex, 'hex').toString('utf8');
          return featureName as SolarFeature;
        } catch {
          return null;
        }
      }).filter(Boolean) as SolarFeature[];
      
      setAccessibleFeatures(features);
    }
  }, [userStatus]);

  // Helper function to convert feature name to bytes32
  const featureToBytes32 = (feature: SolarFeature): `0x${string}` => {
    return keccak256(toBytes(feature));
  };

  // Check if user has access to a specific feature
  const hasAccess = (feature: SolarFeature): boolean => {
    if (!isConnected || !address) return false;
    
    // Check if feature is in accessible features list
    if (accessibleFeatures.includes(feature)) return true;
    
    // Fallback: check balance requirement
    const requirement = parseEther(SOLAR_FEATURES[feature].requirement);
    return solarBalance >= requirement;
  };

  // Use a feature (call contract to track usage)
  const useFeature = async (feature: SolarFeature): Promise<void> => {
    if (!address || !SOLAR_INTEGRATION_ADDRESS) {
      throw new Error('Wallet not connected or contract not configured');
    }

    if (!hasAccess(feature)) {
      throw new Error(`Insufficient SOLAR balance for ${SOLAR_FEATURES[feature].name}`);
    }

    setIsUsingFeature(true);
    try {
      await writeContractAsync({
        address: SOLAR_INTEGRATION_ADDRESS,
        abi: SOLAR_INTEGRATION_ABI,
        functionName: 'useFeature',
        args: [featureToBytes32(feature)],
      });
    } catch (error) {
      console.error('Error using feature:', error);
      throw error;
    } finally {
      setIsUsingFeature(false);
    }
  };

  // Get feature information
  const getFeatureInfo = (feature: SolarFeature) => SOLAR_FEATURES[feature];

  // Format SOLAR amounts for display
  const formatSolarAmount = (amount: bigint): string => {
    const formatted = formatEther(amount);
    const num = parseFloat(formatted);
    
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  // Check if user meets minimum holding requirement
  const checkMinimumHolding = (feature: SolarFeature): boolean => {
    const requirement = parseEther(SOLAR_FEATURES[feature].requirement);
    return solarBalance >= requirement;
  };

  const formattedBalance = formatSolarAmount(solarBalance);
  const isLoading = balanceLoading || statusLoading;

  // Format stats
  const formattedStats = stats ? {
    totalSupply: stats[0] as bigint,
    burnedAmount: stats[1] as bigint,
    burnCount: Number(stats[2]),
    totalUsers: Number(stats[3]),
  } : null;

  return {
    solarBalance,
    formattedBalance,
    isLoading,
    hasAccess,
    accessibleFeatures,
    useFeature,
    isUsingFeature,
    stats: formattedStats,
    getFeatureInfo,
    formatSolarAmount,
    checkMinimumHolding,
  };
}