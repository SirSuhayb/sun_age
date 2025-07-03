import { useReadContract, useAccount } from 'wagmi';
import { RENAISSANCE_CONTRACTS, SolarPledgeV3ABI, formatters } from '~/lib/renaissance';
import { SolarUtilityABI, MorphoTreasuryABI } from '~/lib/contracts';
import type { RenaissanceStats, MorphoTreasuryStats, UtilityStats, PremiumQualification } from '~/lib/renaissance';

export function useRenaissanceStats() {
  const { address } = useAccount();

  // ============ SOLAR PLEDGE V3 STATS ============
  
  const { data: pledgeStatsRaw, isLoading: pledgeLoading } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_PLEDGE_V3,
    abi: SolarPledgeV3ABI,
    functionName: 'getRenaissanceStats',
    query: { 
      enabled: true,
      refetchInterval: 30000 // 30 seconds
    }
  });
  
  const pledgeStats = pledgeStatsRaw as RenaissanceStats | undefined;

  // User-specific pledge data
  const { data: userHasPledge } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_PLEDGE_V3,
    abi: SolarPledgeV3ABI,
    functionName: 'hasPledge',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: userPledgeRaw } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_PLEDGE_V3,
    abi: SolarPledgeV3ABI,
    functionName: 'getPledge',
    args: address && userHasPledge ? [address] : undefined,
    query: { enabled: !!address && !!userHasPledge }
  });

  const { data: premiumQualificationRaw } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_PLEDGE_V3,
    abi: SolarPledgeV3ABI,
    functionName: 'checkPremiumQualification',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // ============ MORPHO TREASURY STATS ============
  
  const { data: morphoStatsRaw, isLoading: morphoLoading } = useReadContract({
    address: RENAISSANCE_CONTRACTS.MORPHO_TREASURY,
    abi: MorphoTreasuryABI,
    functionName: 'getTreasuryStats',
    query: { 
      enabled: true,
      refetchInterval: 60000 // 1 minute
    }
  });

  const { data: morphoBalanceRaw } = useReadContract({
    address: RENAISSANCE_CONTRACTS.MORPHO_TREASURY,
    abi: MorphoTreasuryABI,
    functionName: 'getCurrentBalance',
    query: { 
      enabled: true,
      refetchInterval: 60000
    }
  });

  // ============ SOLAR UTILITY STATS ============
  
  const { data: utilityStatsRaw, isLoading: utilityLoading } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_UTILITY,
    abi: SolarUtilityABI,
    functionName: 'getStats',
    query: { 
      enabled: true,
      refetchInterval: 30000
    }
  });

  // User's SOLAR balance for premium features
  const { data: userSolarBalance } = useReadContract({
    address: RENAISSANCE_CONTRACTS.SOLAR_TOKEN,
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // ============ PROCESS DATA ============
  
  const isLoading = pledgeLoading || morphoLoading || utilityLoading;

  // Format pledge stats
  const formattedPledgeStats = pledgeStats ? {
    totalVolume: formatters.usdc(pledgeStats.totalPledgeVolume),
    totalVolumeRaw: pledgeStats.totalPledgeVolume,
    solarBurned: formatters.solar(pledgeStats.totalSolarBurned),
    solarBurnedRaw: pledgeStats.totalSolarBurned,
    morphoRevenue: formatters.usdc(pledgeStats.morphoRevenue),
    morphoRevenueRaw: pledgeStats.morphoRevenue,
    activePledgers: Number(pledgeStats.activePledgers),
    currentPeriodVolume: formatters.usdc(pledgeStats.currentPeriodVolume),
    usdcUsedForBurns: formatters.usdc(pledgeStats.usdcUsedForBurns),
    
    // Calculated metrics
    avgPledgeSize: Number(pledgeStats.activePledgers) > 0 
      ? formatters.usdc(pledgeStats.totalPledgeVolume / pledgeStats.activePledgers)
      : '0.00',
    burnEfficiency: Number(pledgeStats.usdcUsedForBurns) > 0 
      ? formatters.percentage(Number(pledgeStats.totalSolarBurned) / Number(pledgeStats.usdcUsedForBurns) * 100)
      : '0.00'
  } : null;

  // Format Morpho treasury stats
  const formattedMorphoStats = morphoStatsRaw ? {
    balance: formatters.usdc(morphoBalanceRaw as bigint || 0n),
    balanceRaw: morphoBalanceRaw as bigint || 0n,
    totalDeposited: formatters.usdc((morphoStatsRaw as any)[1] || 0n),
    yieldGenerated: formatters.usdc((morphoStatsRaw as any)[2] || 0n),
    currentAPY: 5.2, // TODO: Calculate from actual yield data
    lastUpdate: formatters.timestamp((morphoStatsRaw as any)[3] || 0n)
  } : null;

  // Format utility stats
  const formattedUtilityStats = utilityStatsRaw ? {
    totalRevenue: formatters.usdc((utilityStatsRaw as any)[2] || 0n),
    totalBurns: formatters.solar((utilityStatsRaw as any)[4] || 0n),
    activeUsers: Number((utilityStatsRaw as any)[1] || 0n),
    burnedFromRevenue: formatters.usdc((utilityStatsRaw as any)[3] || 0n)
  } : null;

  // User premium qualification
  const userPremiumQualification = premiumQualificationRaw ? {
    qualifies: (premiumQualificationRaw as any)[0] as boolean,
    pledgeAmount: formatters.usdc((premiumQualificationRaw as any)[1] as bigint),
    pledgeAmountRaw: (premiumQualificationRaw as any)[1] as bigint
  } : null;

  // User SOLAR balance formatting
  const formattedSolarBalance = userSolarBalance ? {
    balance: formatters.solar(userSolarBalance as bigint),
    balanceRaw: userSolarBalance as bigint,
    formatted: formatters.compactNumber(Number(userSolarBalance as bigint) / 1e18)
  } : null;

  // ============ AGGREGATE METRICS ============
  
  const aggregateStats = {
    // Total ecosystem value
    totalEcosystemValue: pledgeStats && morphoBalanceRaw ? 
      formatters.usdc(pledgeStats.totalPledgeVolume + (morphoBalanceRaw as bigint)) : '0.00',
    
    // Burn rate (SOLAR burned per USDC)
    burnRate: pledgeStats && pledgeStats.usdcUsedForBurns > 0n ? 
      Number(pledgeStats.totalSolarBurned) / Number(pledgeStats.usdcUsedForBurns) : 0,
    
    // Revenue split efficiency
    morphoAllocation: pledgeStats ? 
      Number(pledgeStats.morphoRevenue) / Number(pledgeStats.totalPledgeVolume) * 100 : 0,
    
    // Growth metrics
    weeklyGrowthRate: 0, // TODO: Calculate from historical data
    monthlyGrowthRate: 0, // TODO: Calculate from historical data
  };

  return {
    // Loading states
    isLoading,
    
    // Individual contract stats
    pledgeStats: formattedPledgeStats,
    morphoStats: formattedMorphoStats,
    utilityStats: formattedUtilityStats,
    
    // User-specific data
    userHasPledge: !!userHasPledge,
    userPledge: userPledgeRaw,
    userPremiumQualification,
    userSolarBalance: formattedSolarBalance,
    
    // Aggregate ecosystem metrics
    aggregateStats,
    
    // Raw data for advanced usage
    raw: {
      pledgeStats,
      morphoStatsRaw,
      utilityStatsRaw,
      morphoBalanceRaw,
      userSolarBalance
    }
  };
}

// Specialized hooks for specific use cases
export function usePledgeStats() {
  const { pledgeStats, isLoading } = useRenaissanceStats();
  return { stats: pledgeStats, isLoading };
}

export function useMorphoStats() {
  const { morphoStats, isLoading } = useRenaissanceStats();
  return { stats: morphoStats, isLoading };
}

export function useUserPremiumStatus() {
  const { userPremiumQualification, userSolarBalance, isLoading } = useRenaissanceStats();
  return { 
    qualification: userPremiumQualification,
    solarBalance: userSolarBalance,
    isLoading 
  };
}

export function useBurnMetrics() {
  const { pledgeStats, utilityStats, aggregateStats, isLoading } = useRenaissanceStats();
  
  const combinedBurnData = {
    totalBurned: pledgeStats && utilityStats ? 
      Number(pledgeStats.solarBurnedRaw) + Number(utilityStats.burnedFromRevenue || 0) : 0,
    pledgeBurns: pledgeStats?.solarBurned || '0',
    revenueBurns: utilityStats?.burnedFromRevenue || '0',
    burnRate: aggregateStats.burnRate,
    burnEfficiency: pledgeStats?.burnEfficiency || '0.00'
  };
  
  return { burnData: combinedBurnData, isLoading };
}