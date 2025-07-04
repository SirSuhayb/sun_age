import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWalletClient, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useFrameSDK } from './useFrameSDK';
import { stringToBytes, bytesToHex } from 'viem';

import { 
  SOLAR_UTILITY_ADDRESS, 
  MORPHO_TREASURY_ADDRESS,
  USDC_ADDRESS, 
  SolarUtilityABI, 
  MorphoTreasuryABI,
  USDC_ABI,
  SOLAR_ABI,
  PREMIUM_FEATURES,
  featureToBytes32
} from '~/lib/contracts';

// Define types for the SOLAR Renaissance ecosystem
export type UserStatus = {
  solarBalance: bigint;
  accessibleFeatures: string[];
  usdcBalance: bigint;
};

export type FeatureAccess = {
  hasAccess: boolean;
  accessType: string;
  expiryTime: bigint;
};

export type EcosystemStats = {
  totalSupply: bigint;
  burnedAmount: bigint;
  burnCount: bigint;
  revenueForBurns: bigint;
  nextBurnTime: bigint;
  usdcBalance: bigint;
  morphoRevenue: bigint;
  companyRevenue: bigint;
};

export type TreasuryStats = {
  totalBalance: bigint;
  deposited: bigint;
  withdrawn: bigint;
  totalYield: bigint;
  lastUpdate: bigint;
  estimatedAPY: bigint;
};

export interface UseSolarRenaissanceResult {
  // USDC Operations
  approveUSDC: (amount: bigint) => Promise<void>;
  purchaseFeatureAccess: (feature: string, duration: number) => Promise<void>;
  
  // Feature Access
  checkFeatureAccess: (feature: string) => boolean | undefined;
  useFeature: (feature: string) => Promise<void>;
  
  // Data
  userStatus: UserStatus | undefined;
  ecosystemStats: EcosystemStats | undefined;
  treasuryStats: TreasuryStats | undefined;
  
  // State
  isLoading: boolean;
  error: Error | null;
  allowance: bigint | undefined;
  isApprovalPending: boolean;
  isApprovalConfirmed: boolean;
  isPurchaseConfirmed: boolean;
  
  // Refresh functions
  refetchUserData: () => Promise<void>;
  refetchEcosystemData: () => Promise<void>;
}

export function useSolarRenaissance(): UseSolarRenaissanceResult {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isApprovalPending, setIsApprovalPending] = useState(false);
  const [isApprovalConfirmed, setIsApprovalConfirmed] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isInFrame } = useFrameSDK();
  const { writeContractAsync, isPending: isPurchasePending } = useWriteContract();
  const publicClient = usePublicClient();

  console.log('[useSolarRenaissance] Hook initialized with address:', address);

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Read USDC allowance for SolarUtility
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, SOLAR_UTILITY_ADDRESS] : ['0x0000000000000000000000000000000000000000', SOLAR_UTILITY_ADDRESS],
    query: { enabled: !!address },
  });

  // Read user SOLAR balance and accessible features
  const { data: userStatus, refetch: refetchUserStatus } = useReadContract({
    address: SOLAR_UTILITY_ADDRESS,
    abi: SolarUtilityABI,
    functionName: 'getUserStatus',
    args: address ? [address] : ['0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  // Read user USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : ['0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  // Read ecosystem stats from SolarUtility
  const { data: ecosystemStats, refetch: refetchEcosystemStats } = useReadContract({
    address: SOLAR_UTILITY_ADDRESS,
    abi: SolarUtilityABI,
    functionName: 'getStats',
    query: { enabled: true },
  });

  // Read treasury stats from MorphoTreasury
  const { data: treasuryStatsRaw, refetch: refetchTreasuryStats } = useReadContract({
    address: MORPHO_TREASURY_ADDRESS,
    abi: MorphoTreasuryABI,
    functionName: 'getTreasuryStats',
    query: { enabled: true },
  });

  // Read estimated APY from MorphoTreasury
  const { data: estimatedAPY, refetch: refetchAPY } = useReadContract({
    address: MORPHO_TREASURY_ADDRESS,
    abi: MorphoTreasuryABI,
    functionName: 'getEstimatedAPY',
    query: { enabled: true },
  });

  // Process treasury stats to include APY
  const treasuryStats: TreasuryStats | undefined = treasuryStatsRaw && estimatedAPY ? {
    totalBalance: (treasuryStatsRaw as any)[0],
    deposited: (treasuryStatsRaw as any)[1],
    withdrawn: (treasuryStatsRaw as any)[2],
    totalYield: (treasuryStatsRaw as any)[3],
    lastUpdate: (treasuryStatsRaw as any)[4],
    estimatedAPY: estimatedAPY as bigint,
  } : undefined;

  // Combine user status with USDC balance
  const processedUserStatus: UserStatus | undefined = userStatus && usdcBalance ? {
    solarBalance: (userStatus as any)[0],
    accessibleFeatures: (userStatus as any)[1],
    usdcBalance: usdcBalance as bigint,
  } : undefined;

  // Process ecosystem stats
  const processedEcosystemStats: EcosystemStats | undefined = ecosystemStats ? {
    totalSupply: (ecosystemStats as any)[0],
    burnedAmount: (ecosystemStats as any)[1],
    burnCount: (ecosystemStats as any)[2],
    revenueForBurns: (ecosystemStats as any)[3],
    nextBurnTime: (ecosystemStats as any)[4],
    usdcBalance: (ecosystemStats as any)[5],
    morphoRevenue: (ecosystemStats as any)[6],
    companyRevenue: (ecosystemStats as any)[7],
  } : undefined;

  // Approve USDC for SolarUtility
  const approveUSDC = async (amount: bigint) => {
    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsApprovalPending(true);
    setIsApprovalConfirmed(false);

    try {
      console.log(`Approving ${amount} USDC for SolarUtility...`);
      
      if (isInFrame) {
        const result = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [SOLAR_UTILITY_ADDRESS, amount],
        });
        setTxHash(result);
      } else {
        if (!walletClient) {
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          setIsApprovalPending(false);
          return;
        }
        const hash = await walletClient.writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [SOLAR_UTILITY_ADDRESS, amount],
        });
        setTxHash(hash);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve USDC'));
      setIsLoading(false);
      setIsApprovalPending(false);
    }
  };

  // Purchase premium feature access
  const purchaseFeatureAccess = async (feature: string, duration: number) => {
    if (!isApprovalConfirmed) {
      setError(new Error('Please approve USDC first'));
      return;
    }
    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log(`Purchasing ${feature} access for ${duration} days...`);
      
      const featureBytes32 = featureToBytes32(feature);
      
      if (isInFrame) {
        const result = await writeContractAsync({
          address: SOLAR_UTILITY_ADDRESS,
          abi: SolarUtilityABI,
          functionName: 'purchaseFeatureAccess',
          args: [featureBytes32, BigInt(duration)],
        });
        setTxHash(result);
      } else {
        if (!walletClient) {
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          return;
        }
        const hash = await walletClient.writeContract({
          address: SOLAR_UTILITY_ADDRESS,
          abi: SolarUtilityABI,
          functionName: 'purchaseFeatureAccess',
          args: [featureBytes32, BigInt(duration)],
        });
        setTxHash(hash);
      }

      // Wait for transaction confirmation
      if (publicClient && txHash) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        // Refresh user data after successful purchase
        await refetchUserData();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err : new Error('Failed to purchase feature access'));
      setIsLoading(false);
      throw err;
    }
  };

  // Use a premium feature
  const useFeature = async (feature: string) => {
    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log(`Using feature: ${feature}`);
      
      const featureBytes32 = featureToBytes32(feature);
      
      if (isInFrame) {
        await writeContractAsync({
          address: SOLAR_UTILITY_ADDRESS,
          abi: SolarUtilityABI,
          functionName: 'useFeature',
          args: [featureBytes32],
        });
      } else {
        if (!walletClient) {
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          return;
        }
        await walletClient.writeContract({
          address: SOLAR_UTILITY_ADDRESS,
          abi: SolarUtilityABI,
          functionName: 'useFeature',
          args: [featureBytes32],
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Use feature error:', err);
      setError(err instanceof Error ? err : new Error('Failed to use feature'));
      setIsLoading(false);
      throw err;
    }
  };

  // Check if user has access to a feature
  const checkFeatureAccess = (feature: string): boolean | undefined => {
    if (!processedUserStatus) return undefined;
    return processedUserStatus.accessibleFeatures.includes(feature);
  };

  // Refresh user data
  const refetchUserData = async () => {
    try {
      await Promise.all([
        refetchUserStatus(),
        refetchUsdcBalance(),
        refetchAllowance(),
      ]);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Refresh ecosystem data
  const refetchEcosystemData = async () => {
    try {
      await Promise.all([
        refetchEcosystemStats(),
        refetchTreasuryStats(),
        refetchAPY(),
      ]);
    } catch (error) {
      console.error("Error refreshing ecosystem data:", error);
    }
  };

  // Effect: when transaction is confirmed, refetch data and update state
  React.useEffect(() => {
    if (isConfirmed && txHash) {
      console.log(`Transaction confirmed: ${txHash}`);
      refetchUserData();
      refetchEcosystemData();
      setIsLoading(false);
      setIsApprovalPending(false);
      setIsApprovalConfirmed(true);
      setTxHash(undefined);
    }
    if (isTxError && txError) {
      setError(txError instanceof Error ? txError : new Error('Transaction failed'));
      setIsLoading(false);
      setIsApprovalPending(false);
      setTxHash(undefined);
    }
  }, [isConfirmed, isTxError, txError, txHash]);

  // Effect: update approval state when allowance changes
  React.useEffect(() => {
    if (typeof allowance === 'bigint' && allowance > 0n) {
      setIsApprovalConfirmed(true);
    }
  }, [allowance]);

  // Effect: refetch data when address changes
  React.useEffect(() => {
    if (address) {
      refetchUserData();
    }
  }, [address]);

  return {
    approveUSDC,
    purchaseFeatureAccess,
    useFeature,
    checkFeatureAccess,
    userStatus: processedUserStatus,
    ecosystemStats: processedEcosystemStats,
    treasuryStats,
    isLoading: isLoading || isPurchasePending || isConfirming,
    error,
    allowance: allowance as bigint | undefined,
    isApprovalPending,
    isApprovalConfirmed,
    isPurchaseConfirmed: isConfirmed && !isTxError,
    refetchUserData,
    refetchEcosystemData,
  };
}