// SOLAR Renaissance Contract Addresses
export const SOLAR_UTILITY_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_UTILITY_ADDRESS as `0x${string}`;
export const MORPHO_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_MORPHO_TREASURY_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// SolarUtility ABI - Premium Features & Burns
export const SolarUtilityABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "feature",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "purchaseFeatureAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "feature",
        "type": "bytes32"
      }
    ],
    "name": "useFeature",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "feature",
        "type": "bytes32"
      }
    ],
    "name": "checkAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasAccess",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserStatus",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "bytes32[]",
        "name": "accessibleFeatures",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "feature",
        "type": "bytes32"
      }
    ],
    "name": "getUserFeatureAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasAccess",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "accessType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "expiryTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "feature",
        "type": "bytes32"
      }
    ],
    "name": "getFeaturePricing",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "monthly",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quarterly",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "annual",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllFeatureRequirements",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "features",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256[]",
        "name": "requirements",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "prices",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "burnedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "burnCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "revenueForBurns",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nextBurnTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "usdcBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "morphoRevenue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "companyRevenue",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRevenueSplit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalCollected",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "morphoShare",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "companyShare",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pendingBalance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "strategicBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeQuarterlyBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// MorphoTreasury ABI - Yield Management
export const MorphoTreasuryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stakingContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_burnContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_airdropContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_developmentContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "depositToMorpho",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTreasuryStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deposited",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "withdrawn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalYield",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastUpdate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEstimatedAPY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "apy",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getAvailableYield",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "available",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "addRevenue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// USDC ABI - Standard ERC20 functions
export const USDC_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// SOLAR Token ABI - Basic ERC20 for balance checking
export const SOLAR_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Premium feature identifiers
export const PREMIUM_FEATURES = {
  PREMIUM_ANALYTICS: "premium_analytics",
  CUSTOM_MILESTONES: "custom_milestones", 
  PRIORITY_SUPPORT: "priority_support",
  ADVANCED_JOURNEY: "advanced_journey",
  API_ACCESS: "api_access",
  EARLY_ACCESS: "early_access",
  VIP_SUPPORT: "vip_support"
} as const;

// Helper function to convert feature names to bytes32
export function featureToBytes32(feature: string): `0x${string}` {
  const bytes = new TextEncoder().encode(feature);
  const padded = new Uint8Array(32);
  padded.set(bytes.slice(0, 32));
  return `0x${Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join('')}`;
} 