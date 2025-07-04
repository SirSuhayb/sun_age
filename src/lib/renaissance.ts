// SOLAR Renaissance Contract Integration Layer
export const RENAISSANCE_CONTRACTS = {
  SOLAR_PLEDGE_V3: "0xD57e727d2e7f72B08E3Ec7160ce8047802638FeE" as `0x${string}`,
  MORPHO_TREASURY: "0x720966609d2B051A2ba7608f0b3A4782DbeDbF6a" as `0x${string}`,
  SOLAR_UTILITY: "0x34cc7F26248F5E6D6a8B0C8d550E69bC6E51B6B0" as `0x${string}`,
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  SOLAR_TOKEN: "0x746042147240304098C837563aAEc0F671881B07" as `0x${string}`,
} as const;

// SolarPledgeV3 ABI - Key functions for Renaissance integration
export const SolarPledgeV3ABI = [
  // Core pledge functions
  {
    "inputs": [
      {"internalType": "string", "name": "_commitment", "type": "string"},
      {"internalType": "bytes32", "name": "_farcasterHandle", "type": "bytes32"},
      {"internalType": "uint128", "name": "_pledgeAmount", "type": "uint128"}
    ],
    "name": "createPledge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint96", "name": "_birthTimestamp", "type": "uint96"}],
    "name": "setBirthDate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [{"internalType": "address", "name": "_pledger", "type": "address"}],
    "name": "getPledge",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "pledger", "type": "address"},
          {"internalType": "uint96", "name": "pledgeNumber", "type": "uint96"},
          {"internalType": "uint96", "name": "pledgeTimestamp", "type": "uint96"},
          {"internalType": "uint128", "name": "usdcPaid", "type": "uint128"},
          {"internalType": "uint128", "name": "surplusAmount", "type": "uint128"},
          {"internalType": "uint64", "name": "solarAge", "type": "uint64"},
          {"internalType": "bytes32", "name": "commitmentHash", "type": "bytes32"},
          {"internalType": "bytes32", "name": "farcasterHandle", "type": "bytes32"},
          {"internalType": "string", "name": "commitmentText", "type": "string"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct SolarPledgeV3.Pledge",
        "name": "pledge",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasPledge",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Renaissance stats
  {
    "inputs": [],
    "name": "getRenaissanceStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalPledgeVolume", "type": "uint256"},
      {"internalType": "uint256", "name": "totalSolarBurned", "type": "uint256"},
      {"internalType": "uint256", "name": "morphoRevenue", "type": "uint256"},
      {"internalType": "uint256", "name": "activePledgers", "type": "uint256"},
      {"internalType": "uint256", "name": "currentPeriodVolume", "type": "uint256"},
      {"internalType": "uint256", "name": "usdcUsedForBurns", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "checkPremiumQualification",
    "outputs": [
      {"internalType": "bool", "name": "qualifies", "type": "bool"},
      {"internalType": "uint256", "name": "pledgeAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Convergence period functions (1:1 compatibility)
  {
    "inputs": [],
    "name": "getCurrentConvergencePeriodIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_periodIndex", "type": "uint256"}],
    "name": "getConvergencePeriod",
    "outputs": [
      {
        "components": [
          {"internalType": "uint96", "name": "startTime", "type": "uint96"},
          {"internalType": "uint96", "name": "endTime", "type": "uint96"},
          {"internalType": "uint96", "name": "periodTotalPledges", "type": "uint96"},
          {"internalType": "uint256", "name": "totalVolume", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct SolarPledgeV3.ConvergencePeriod",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

// Renaissance Types
export interface RenaissanceStats {
  totalPledgeVolume: bigint;
  totalSolarBurned: bigint;
  morphoRevenue: bigint;
  activePledgers: bigint;
  currentPeriodVolume: bigint;
  usdcUsedForBurns: bigint;
}

export interface PledgeV3 {
  pledger: string;
  pledgeNumber: bigint;
  pledgeTimestamp: bigint;
  usdcPaid: bigint;
  surplusAmount: bigint;
  solarAge: bigint;
  commitmentHash: string;
  farcasterHandle: string;
  commitmentText: string;
  isActive: boolean;
}

export interface MorphoTreasuryStats {
  balance: bigint;
  totalDeposited: bigint;
  currentAPY: number;
  yieldGenerated: bigint;
  lastUpdateTime: bigint;
}

export interface UtilityStats {
  totalFeatures: bigint;
  activeUsers: bigint;
  totalRevenue: bigint;
  burnedFromRevenue: bigint;
  totalBurns: bigint;
}

export interface PremiumQualification {
  qualifies: boolean;
  pledgeAmount: bigint;
  eligibleFeatures: string[];
  accessType: 'token_holding' | 'pledge_based' | 'subscription';
}

// Formatting utilities
export const formatters = {
  usdc: (amount: bigint): string => {
    return (Number(amount) / 1_000_000).toFixed(2);
  },
  
  solar: (amount: bigint): string => {
    return (Number(amount) / 1e18).toFixed(0);
  },
  
  percentage: (bps: number): string => {
    return (bps / 100).toFixed(2);
  },
  
  timestamp: (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  },
  
  compactNumber: (num: number): string => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  }
};

// Feature definitions for premium access
export const PREMIUM_FEATURES = {
  GOVERNANCE_VOTING: {
    id: 'governance_voting',
    name: 'Governance Voting',
    description: 'Vote on protocol decisions and improvements',
    requirement: 1_000_000n * 1000000n, // 1M SOLAR
    icon: '🗳️'
  },
  PRIORITY_SUPPORT: {
    id: 'priority_support', 
    name: 'Priority Support',
    description: 'Fast-track support and direct access to team',
    requirement: 3_000_000n * 1000000n, // 3M SOLAR
    icon: '🚀'
  },
  ADVANCED_ANALYTICS: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights into your Sol journey and ecosystem metrics',
    requirement: 5_000_000n * 1000000n, // 5M SOLAR
    icon: '📊'
  },
  CUSTOM_MILESTONES: {
    id: 'custom_milestones',
    name: 'Custom Milestones',
    description: 'Create personalized milestones and achievement tracking',
    requirement: 15_000_000n * 1000000n, // 15M SOLAR
    icon: '🎯'
  },
  API_ACCESS: {
    id: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to your Sol data and ecosystem metrics',
    requirement: 25_000_000n * 1000000n, // 25M SOLAR
    icon: '🔌'
  },
  VIP_EVENTS: {
    id: 'vip_events',
    name: 'VIP Events',
    description: 'Exclusive access to community events and early features',
    requirement: 50_000_000n * 1000000n, // 50M SOLAR
    icon: '⭐'
  },
  ECOSYSTEM_GOVERNANCE: {
    id: 'ecosystem_governance',
    name: 'Ecosystem Governance',
    description: 'Participate in major ecosystem decisions and treasury management',
    requirement: 100_000_000n * 1000000n, // 100M SOLAR
    icon: '👑'
  }
} as const;

// Utility functions for premium features
export const checkFeatureAccess = (userBalance: bigint, featureId: keyof typeof PREMIUM_FEATURES): boolean => {
  const feature = PREMIUM_FEATURES[featureId];
  return userBalance >= feature.requirement;
};

export const getAccessibleFeatures = (userBalance: bigint): Array<typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES]> => {
  return Object.values(PREMIUM_FEATURES).filter(feature => 
    userBalance >= feature.requirement
  );
};

export const getNextFeatureUnlock = (userBalance: bigint): typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES] | null => {
  const features = Object.values(PREMIUM_FEATURES).sort((a, b) => 
    Number(a.requirement - b.requirement)
  );
  
  return features.find(feature => userBalance < feature.requirement) || null;
};

// Environment variables for feature flags
export const FEATURE_FLAGS = {
  ENABLE_V3_PLEDGES: process.env.NEXT_PUBLIC_ENABLE_V3_PLEDGES === 'true',
  ENABLE_PREMIUM_FEATURES: process.env.NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES === 'true',
  ENABLE_TREASURY_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_TREASURY_DASHBOARD === 'true',
  ENABLE_BURN_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_BURN_ANALYTICS === 'true',
  ENABLE_STAKING: process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true',
} as const;