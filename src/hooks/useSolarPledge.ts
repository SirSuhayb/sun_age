import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { SOLAR_PLEDGE_ADDRESS, USDC_ADDRESS } from '~/lib/constants';
import SolarPledgeABI from '~/lib/abis/SolarPledge.json';
import USDC_ABI from '~/lib/abis/USDC.json';

export function useSolarPledge() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Write contract for USDC approve
  const { writeContract: writeApprove, isPending: isApprovePending } = useWriteContract();
  // Write contract for pledge
  const { writeContract, isPending: isPledgePending } = useWriteContract();

  // Read USDC allowance
  const [allowanceAmount, setAllowanceAmount] = useState<bigint>(BigInt(0));
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address, SOLAR_PLEDGE_ADDRESS],
    query: { enabled: !!address },
  });

  // Read if user has pledged
  const { data: hasPledged, refetch: refetchPledged } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'hasPledged',
    args: [address],
    query: { enabled: !!address },
  });

  // Approve USDC for a given amount
  const approveUSDC = async (amount: bigint) => {
    setError(null);
    setIsLoading(true);
    try {
      await writeApprove({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [SOLAR_PLEDGE_ADDRESS, amount],
      });
      await refetchAllowance();
      setAllowanceAmount(amount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve USDC'));
    } finally {
      setIsLoading(false);
    }
  };

  // Create pledge (records vow and pledge onchain)
  const createPledge = async (commitment: string, farcasterHandle: string, pledgeAmount: number) => {
    setError(null);
    setIsLoading(true);
    try {
      await writeContract({
        address: SOLAR_PLEDGE_ADDRESS,
        abi: SolarPledgeABI,
        functionName: 'createPledge',
        args: [commitment, farcasterHandle, BigInt(pledgeAmount * 1_000_000)],
      });
      await refetchPledged();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create pledge'));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if approved for the current pledge amount
  const isApproved = (amount: number) => {
    if (typeof allowance === 'bigint') {
      return allowance >= BigInt(amount * 1_000_000);
    }
    return false;
  };

  return {
    approveUSDC,
    createPledge,
    isApproved,
    isLoading: isLoading || isApprovePending || isPledgePending,
    error,
    hasPledged,
  };
} 