// SOLAR Renaissance V2 Contract Addresses & ABIs
export const SOLAR_PLEDGE_V2_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_PLEDGE_V2_ADDRESS as `0x${string}`;

// Deployed addresses
export const DEPLOYED_ADDRESSES = {
  SOLAR_PLEDGE_V2: "0x1459c9bEBb9d43136a92d2a6b41d548d96129eFb" as `0x${string}`,
  MORPHO_TREASURY: "0x720966609d2B051A2ba7608f0b3A4782DbeDbF6a" as `0x${string}`,
  SOLAR_UTILITY: "0x34cc7F26248F5E6D6a8B0C8d550E69bC6E51B6B0" as `0x${string}`,
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  SOLAR_TOKEN: "0x746042147240304098C837563aAEc0F671881B07" as `0x${string}`,
};

// SolarPledgeV2 ABI - Complete interface for enhanced pledging with Renaissance integration
export const SolarPledgeV2ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_morphoTreasuryContract",
        "type": "address"
      },
      {
        "internalType": "address", 
        "name": "_solarUtilityContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Core pledge functions (1:1 compatibility)
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_commitment",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_farcasterHandle",
        "type": "bytes32"
      },
      {
        "internalType": "uint128",
        "name": "_pledgeAmount",
        "type": "uint128"
      }
    ],
    "name": "createPledge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "_birthTimestamp",
        "type": "uint96"
      }
    ],
    "name": "setBirthDate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions (1:1 compatibility)
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_pledger",
        "type": "address"
      }
    ],
    "name": "getPledge",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pledger",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "pledgeNumber",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "pledgeTimestamp",
            "type": "uint96"
          },
          {
            "internalType": "uint128",
            "name": "usdcPaid",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "surplusAmount",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "solarAge",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "commitmentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "farcasterHandle",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "commitmentText",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SolarPledgeV2.Pledge",
        "name": "pledge",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "hasPledge",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
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
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "userBirthTimestamp",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentConvergencePeriodIndex",
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
        "internalType": "uint256",
        "name": "_periodIndex",
        "type": "uint256"
      }
    ],
    "name": "getConvergencePeriod",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint96",
            "name": "startTime",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "endTime",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "periodTotalPledges",
            "type": "uint96"
          },
          {
            "internalType": "uint256",
            "name": "totalVolume",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SolarPledgeV2.ConvergencePeriod",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Renaissance integration functions
  {
    "inputs": [],
    "name": "getRenaissanceStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalPledgeVolume",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSolarBurned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "morphoRevenue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "activePledgers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentPeriodVolume",
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
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "checkPremiumQualification",
    "outputs": [
      {
        "internalType": "bool",
        "name": "qualifies",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "pledgeAmount",
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
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserProfile",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasSetBirthDate",
        "type": "bool"
      },
      {
        "internalType": "uint96",
        "name": "birthTimestamp",
        "type": "uint96"
      },
      {
        "internalType": "bool",
        "name": "hasMadePledge",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "pledger",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "pledgeNumber",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "pledgeTimestamp",
            "type": "uint96"
          },
          {
            "internalType": "uint128",
            "name": "usdcPaid",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "surplusAmount",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "solarAge",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "commitmentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "farcasterHandle",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "commitmentText",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SolarPledgeV2.Pledge",
        "name": "pledge",
        "type": "tuple"
      },
      {
        "internalType": "uint64",
        "name": "currentSolarAge",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "premiumQualified",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Admin functions (for completeness)
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "_startTime",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "_endTime",
        "type": "uint96"
      },
      {
        "internalType": "bool",
        "name": "_setAsActive",
        "type": "bool"
      }
    ],
    "name": "setConvergencePeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_morphoTreasury",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_solarUtility",
        "type": "address"
      }
    ],
    "name": "updateRenaissanceContracts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "fundSolarForBurns",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "pledger",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pledgeNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "usdcPaid",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "solarAge",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "commitment",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "farcasterHandle",
        "type": "bytes32"
      }
    ],
    "name": "PledgeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "birthTimestamp",
        "type": "uint96"
      }
    ],
    "name": "BirthDateSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "MorphoTreasuryDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "SolarBurned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pledgeAmount",
        "type": "uint256"
      }
    ],
    "name": "PremiumFeatureUnlocked",
    "type": "event"
  },
  // Standard contract functions
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Type definitions for better TypeScript support
export interface Pledge {
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

export interface ConvergencePeriod {
  startTime: bigint;
  endTime: bigint;
  periodTotalPledges: bigint;
  totalVolume: bigint;
  isActive: boolean;
}

export interface RenaissanceStats {
  totalPledgeVolume: bigint;
  totalSolarBurned: bigint;
  morphoRevenue: bigint;
  activePledgers: bigint;
  currentPeriodVolume: bigint;
}

export interface UserProfile {
  hasSetBirthDate: boolean;
  birthTimestamp: bigint;
  hasMadePledge: boolean;
  pledge: Pledge;
  currentSolarAge: bigint;
  premiumQualified: boolean;
}

// Helper functions
export const formatPledgeAmount = (amount: bigint): string => {
  return (Number(amount) / 1_000_000).toFixed(2);
};

export const formatSolarAge = (age: bigint): string => {
  const days = Number(age);
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
};

export const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

// Constants for premium features
export const PREMIUM_THRESHOLDS = {
  BASIC: 50n * 1_000_000n,      // $50
  ADVANCED: 75n * 1_000_000n,   // $75
  VIP: 100n * 1_000_000n,       // $100
} as const;