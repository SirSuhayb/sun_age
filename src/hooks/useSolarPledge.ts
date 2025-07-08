import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWalletClient, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useFrameSDK } from './useFrameSDK';
import { stringToBytes, bytesToHex, bytesToString, hexToBytes } from 'viem';

import { SOLAR_PLEDGE_ADDRESS, USDC_ADDRESS, SolarPledgeABI, USDC_ABI, SOLAR_PLEDGE_V1_ADDRESS, SolarPledgeV1ABI, SolarPledgeV3ABI } from '~/lib/contracts';

// Utility to encode a string as bytes32 (like Solidity's stringToBytes32)
function encodeBytes32String(str: string): `0x${string}` {
  const bytes = stringToBytes(str);
  if (bytes.length > 32) throw new Error('String too long for bytes32');
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return bytesToHex(padded);
}

// Define the Pledge type for getPledge return value
export type Pledge = {
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
};

// Define the return type for useSolarPledge
export interface UseSolarPledgeResult {
  approveUSDC: (amount: bigint) => Promise<void>;
  createPledge: (commitment: string, farcasterHandle: string, pledgeAmount: number, birthDate?: Date) => Promise<void>;
  isApproved: (amount: number) => boolean;
  isLoading: boolean;
  error: Error | null;
  hasPledged: boolean | undefined;
  debugInfo: string | null;
  allowance: bigint | undefined;
  isApprovalPending: boolean;
  isApprovalConfirmed: boolean;
  isPledgeConfirmed: boolean;
  refetchPledged: (...args: any[]) => Promise<any>;
  onChainVow?: string;
  refetchOnChainPledge: (...args: any[]) => Promise<any>;
  onChainPledge: Pledge | undefined;
  onChainPledgeV1: Pledge | undefined;
}

export function useSolarPledge(): UseSolarPledgeResult {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isApprovalPending, setIsApprovalPending] = useState(false);
  const [isApprovalConfirmed, setIsApprovalConfirmed] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { isInFrame } = useFrameSDK();
  const { writeContractAsync, isPending: isPledgePending } = useWriteContract();
  const publicClient = usePublicClient();

  console.log('[useSolarPledge] Hook initialized with address:', address);

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Read USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, SOLAR_PLEDGE_ADDRESS] : ['0x0000000000000000000000000000000000000000', SOLAR_PLEDGE_ADDRESS],
    query: { enabled: !!address },
  });

  // Read if user has pledged
  const { data: hasPledged, refetch: refetchPledged } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'hasPledge',
    args: address ? [address] : ['0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  // Fetch on-chain pledge details (v3)
  const { data: onChainPledgeRaw, refetch: refetchOnChainPledge } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeV3ABI,
    functionName: 'getPledge',
    args: address ? [address] : ['0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  // Decode farcasterHandle from bytes32 to string for v3
  let onChainPledge: Pledge | undefined = undefined;
  if (onChainPledgeRaw && typeof onChainPledgeRaw === 'object' && 'farcasterHandle' in onChainPledgeRaw) {
    onChainPledge = {
      ...onChainPledgeRaw,
      farcasterHandle: bytesToString(hexToBytes(onChainPledgeRaw.farcasterHandle as `0x${string}`)),
    } as Pledge;
  }

  const onChainVow = (onChainPledge as Pledge | undefined)?.commitmentText;

  console.log('[useSolarPledge] Contract read results:', {
    hasPledged,
    onChainPledge,
    onChainVow
  });

  // Fetch on-chain pledge details (v1)
  const { data: onChainPledgeV1Raw, refetch: refetchOnChainPledgeV1 } = useReadContract({
    address: SOLAR_PLEDGE_V1_ADDRESS,
    abi: SolarPledgeV1ABI,
    functionName: 'getPledge',
    args: address ? [address] : ['0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });
  console.log('[useSolarPledge] onChainPledgeV1Raw', onChainPledgeV1Raw);

  // Decode farcasterHandle from bytes32 to string for v1
  let onChainPledgeV1: Pledge | undefined = undefined;
  if (onChainPledgeV1Raw && typeof onChainPledgeV1Raw === 'object' && 'farcasterHandle' in onChainPledgeV1Raw) {
    onChainPledgeV1 = {
      ...onChainPledgeV1Raw,
      farcasterHandle: bytesToString(hexToBytes(onChainPledgeV1Raw.farcasterHandle as `0x${string}`)),
    } as Pledge;
  }

  // Approve USDC for a given amount
  const approveUSDC = async (amount: bigint) => {
    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsApprovalPending(true);
    setIsApprovalConfirmed(false);
    setDebugInfo(null);
    try {
      setDebugInfo(`Starting USDC approval for amount: ${amount}`);
      // If in Farcaster frame, use writeContract directly to trigger the frame wallet
      if (isInFrame) {
        setDebugInfo('In Farcaster frame, using writeContract directly');
        const result = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [SOLAR_PLEDGE_ADDRESS, amount],
        });
        setDebugInfo('writeContract called successfully');
        // The transaction hash will be handled by the useWaitForTransactionReceipt hook
      } else {
        setDebugInfo('Using wallet client for approval');
        // For regular wallets, use the wallet client
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
          args: [SOLAR_PLEDGE_ADDRESS, amount],
        });
        setDebugInfo(hash ? `Tx Hash: ${hash}` : 'No transaction hash returned');
        setTxHash(hash);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve USDC'));
      setDebugInfo(`Error in approveUSDC: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      setIsApprovalPending(false);
    }
  };

  // Effect: when transaction is confirmed, refetch allowance and update state
  React.useEffect(() => {
    if (isConfirmed && txHash) {
      setDebugInfo(`Transaction confirmed: ${txHash}`);
      refetchAllowance();
      setIsLoading(false);
      setIsApprovalPending(false);
      setIsApprovalConfirmed(true);
      setTxHash(undefined);
    }
    if (isTxError && txError) {
      setError(txError instanceof Error ? txError : new Error('Transaction failed'));
      setDebugInfo(`Transaction error: ${txError instanceof Error ? txError.message : String(txError)}`);
      setIsLoading(false);
      setIsApprovalPending(false);
      setTxHash(undefined);
    }
  }, [isConfirmed, isTxError, txError, txHash, refetchAllowance]);

  // Create pledge (records vow and pledge onchain)
  const createPledge = async (commitment: string, farcasterHandle: string, pledgeAmount: number, birthDate?: Date) => {
    console.log('createPledge called with:', { commitment, farcasterHandle, pledgeAmount, birthDate });
    console.log('Current state:', { isApprovalConfirmed, isInFrame, walletClient: !!walletClient });
    
    if (!isApprovalConfirmed) {
      console.log('Blocked: isApprovalConfirmed is', isApprovalConfirmed);
      setError(new Error('Please wait for USDC approval to complete'));
      return;
    }
    if (!walletClient && !isInFrame) {
      console.log('Blocked: No wallet client available');
      setError(new Error("No wallet client available"));
      return;
    }
    setError(null);
    setIsLoading(true);
    setDebugInfo(null);
    try {
      setDebugInfo(`Starting pledge creation for amount: ${pledgeAmount}`);
      
      // Convert Farcaster handle to bytes32
      const farcasterHandleBytes32 = encodeBytes32String(farcasterHandle);
      setDebugInfo(`Converted Farcaster handle to bytes32: ${farcasterHandleBytes32}`);

      // Check if birth date is set onchain
      if (publicClient && address && birthDate) {
        const userBirthTimestamp = await publicClient.readContract({
          address: SOLAR_PLEDGE_ADDRESS,
          abi: SolarPledgeABI,
          functionName: 'userBirthTimestamp',
          args: [address],
        }) as bigint;
        if (userBirthTimestamp === 0n) {
          setDebugInfo('Setting birth date onchain...');
          const birthTimestamp = Math.floor(birthDate.getTime() / 1000);
          const birthDateHash = await walletClient!.writeContract({
            address: SOLAR_PLEDGE_ADDRESS,
            abi: SolarPledgeABI,
            functionName: 'setBirthDate',
            args: [BigInt(birthTimestamp)],
          });
          setDebugInfo('Birth date set onchain.');
          // Wait for birth date transaction to be confirmed
          await publicClient.waitForTransactionReceipt({ hash: birthDateHash });
        }
      }

      // Continue with pledge
      let pledgeHash: `0x${string}`;
      if (isInFrame) {
        console.log('Using Farcaster frame for pledge');
        setDebugInfo('In Farcaster frame, using writeContract for pledge');
        try {
          const result = await writeContractAsync({
            address: SOLAR_PLEDGE_ADDRESS,
            abi: SolarPledgeABI,
            functionName: 'createPledge',
            args: [commitment, farcasterHandleBytes32, BigInt(pledgeAmount * 1_000_000)],
          });
          setDebugInfo('writeContract for pledge called successfully');
          if (result) {
            pledgeHash = result;
            setTxHash(pledgeHash);
            setDebugInfo(`Pledge Tx Hash: ${pledgeHash}`);
            // Wait for transaction confirmation
            if (publicClient) {
              setDebugInfo('Waiting for transaction confirmation...');
              const receipt = await publicClient.waitForTransactionReceipt({ hash: pledgeHash });
              if (receipt.status === 'reverted') {
                throw new Error('Transaction was reverted');
              }
              setDebugInfo('Transaction confirmed!');
            }
          } else {
            throw new Error('No transaction hash returned from writeContract');
          }
        } catch (err) {
          console.error('Pledge transaction error:', err);
          throw err;
        }
      } else {
        console.log('Using wallet client for pledge');
        setDebugInfo('Using wallet client for pledge');
        if (!walletClient) {
          console.log('No wallet client available');
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          return;
        }
        try {
          console.log('Calling walletClient.writeContract with:', {
            address: SOLAR_PLEDGE_ADDRESS,
            functionName: 'createPledge',
            args: [commitment, farcasterHandleBytes32, BigInt(pledgeAmount * 1_000_000)]
          });
          pledgeHash = await walletClient.writeContract({
            address: SOLAR_PLEDGE_ADDRESS,
            abi: SolarPledgeABI,
            functionName: 'createPledge',
            args: [commitment, farcasterHandleBytes32, BigInt(pledgeAmount * 1_000_000)],
          });
          console.log('Pledge transaction hash:', pledgeHash);
          setDebugInfo(pledgeHash ? `Pledge Tx Hash: ${pledgeHash}` : 'No pledge transaction hash returned');
          setTxHash(pledgeHash);
          // Wait for transaction confirmation
          if (publicClient) {
            setDebugInfo('Waiting for transaction confirmation...');
            const receipt = await publicClient.waitForTransactionReceipt({ hash: pledgeHash });
            if (receipt.status === 'reverted') {
              throw new Error('Transaction was reverted');
            }
            setDebugInfo('Transaction confirmed!');
          }
        } catch (err) {
          console.error('Pledge transaction error:', err);
          throw err;
        }
      }

      setIsLoading(false);
      setIsApprovalConfirmed(true);
      // Refetch on-chain pledge status after successful pledge
      if (typeof refetchOnChainPledge === 'function') {
        refetchOnChainPledge();
      }
    } catch (err) {
      console.error('Pledge error:', err);
      setError(err instanceof Error ? err : new Error('Failed to create pledge'));
      setIsLoading(false);
      setIsApprovalConfirmed(false);
      throw err; // Re-throw the error to be caught by the ceremony page
    }
  };

  // Check if approved for the current pledge amount
  const isApproved = (amount: number) => {
    if (typeof allowance === 'bigint') {
      return allowance >= BigInt(amount * 1_000_000);
    }
    return false;
  };

  // Effect: update approval state when allowance changes
  React.useEffect(() => {
    if (typeof allowance === 'bigint' && allowance > 0n) {
      setIsApprovalConfirmed(true);
    }
  }, [allowance]);

  // Effect: refetch allowance when address changes
  React.useEffect(() => {
    if (address) {
      refetchAllowance();
    }
  }, [address, refetchAllowance]);

  return {
    approveUSDC,
    createPledge,
    isApproved,
    isLoading: isLoading || isPledgePending || isConfirming,
    error,
    hasPledged: hasPledged as boolean | undefined,
    debugInfo,
    allowance: allowance as bigint | undefined,
    isApprovalPending,
    isApprovalConfirmed,
    isPledgeConfirmed: isConfirmed && !isTxError,
    refetchPledged,
    onChainVow,
    refetchOnChainPledge,
    onChainPledge: onChainPledge as Pledge | undefined,
    onChainPledgeV1: onChainPledgeV1 as Pledge | undefined,
  };
} 