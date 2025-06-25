"use client";

import React, { useState } from 'react';
import { useFrameSDK } from '~/hooks/useFrameSDK';

interface SwapInterfaceProps {
  className?: string;
}

export function SwapInterface({ className = "" }: SwapInterfaceProps) {
  const { sdk, isInFrame } = useFrameSDK();
  const [sellAmount, setSellAmount] = useState('');
  const [sellToken, setSellToken] = useState('USDC');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Token addresses on Base network (from Header.tsx)
  const SOLAR_TOKEN_ADDRESS = 'eip155:8453/erc20:0x746042147240304098C837563aAEc0F671881B07';
  const USDC_TOKEN_ADDRESS = 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const ETH_TOKEN_ADDRESS = 'eip155:8453/native';

  const getTokenAddress = (token: string) => {
    switch (token) {
      case 'USDC':
        return USDC_TOKEN_ADDRESS;
      case 'ETH':
        return ETH_TOKEN_ADDRESS;
      case 'WETH':
        return 'eip155:8453/erc20:0x4200000000000000000000000000000000000006'; // Base WETH
      default:
        return USDC_TOKEN_ADDRESS;
    }
  };

  const getTokenDecimals = (token: string) => {
    switch (token) {
      case 'USDC':
        return 6;
      case 'ETH':
      case 'WETH':
        return 18;
      default:
        return 6;
    }
  };

  const formatTokenAmount = (amount: string, token: string) => {
    if (!amount || isNaN(parseFloat(amount))) return '0';
    const decimals = getTokenDecimals(token);
    const parsedAmount = parseFloat(amount);
    return (parsedAmount * Math.pow(10, decimals)).toString();
  };

  const handleFarcasterSwap = async () => {
    if (!isInFrame || !sdk) {
      setSwapError('Farcaster frame not available');
      return;
    }

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      setSwapError('Please enter a valid amount');
      return;
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      const sellTokenAddress = getTokenAddress(sellToken);
      const formattedAmount = formatTokenAmount(sellAmount, sellToken);

      const result = await sdk.actions.swapToken({
        buyToken: SOLAR_TOKEN_ADDRESS,
        sellToken: sellTokenAddress,
        sellAmount: formattedAmount,
      });

      if (result.success) {
        console.log('Swap successful:', result);
        // Reset form on success
        setSellAmount('');
      } else {
        setSwapError(result.error?.message || 'Swap failed');
      }
    } catch (err) {
      console.error('Swap error:', err);
      setSwapError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleWebSwap = () => {
    // For web users, redirect to Uniswap or show instructions
    const uniswapUrl = `https://app.uniswap.org/#/swap?outputCurrency=0x746042147240304098C837563aAEc0F671881B07&chain=base`;
    window.open(uniswapUrl, '_blank');
  };

  const handleSwap = () => {
    if (isInFrame) {
      handleFarcasterSwap();
    } else {
      handleWebSwap();
    }
  };

  return (
    <div className={`w-full text-sm font-mono space-y-3 ${className}`}>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="text-4xl mb-3">💰</div>
        <div className="text-lg font-bold mb-2">Swap for $SOLAR</div>
        <p className="text-gray-600 mb-4">
          Exchange your tokens for $SOLAR and power your cosmic journey.
        </p>
      </div>
      
      {/* Swap Interface */}
      <div className="border border-gray-300 p-4 bg-white/90">
        <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3">
          {isInFrame ? 'Token Swap (Farcaster)' : 'Token Swap (Web)'}
        </div>
        
        {/* Error Display */}
        {swapError && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 text-xs">
            {swapError}
          </div>
        )}
        
        {/* From Token */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-gray-600 mb-2">FROM</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 text-black font-mono bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
            <select 
              value={sellToken}
              onChange={(e) => setSellToken(e.target.value)}
              className="px-3 py-2 border border-gray-300 bg-white font-mono text-sm"
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="WETH">WETH</option>
            </select>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center mb-4">
          <div className="text-2xl">↓</div>
        </div>

        {/* To Token */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-gray-600 mb-2">TO</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Estimated output"
              className="flex-1 px-3 py-2 border border-gray-300 text-black font-mono bg-gray-50"
              value="$SOLAR"
              readOnly
            />
            <div className="px-3 py-2 border border-gray-300 bg-gray-50 font-mono text-sm">$SOLAR</div>
          </div>
        </div>

        {/* Swap Button */}
        <button 
          className="w-full py-3 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black hover:bg-[#e6c75a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSwap}
          disabled={isSwapping || (!isInFrame && !sellAmount)}
        >
          {isSwapping ? 'SWAPPING...' : (isInFrame ? 'SWAP TOKENS' : 'SWAP ON UNISWAP')}
        </button>

        {/* Context-specific info */}
        {isInFrame ? (
          <div className="mt-4 text-xs font-mono text-gray-500">
            <div className="flex justify-between">
              <span>Network:</span>
              <span>Base</span>
            </div>
            <div className="flex justify-between">
              <span>DEX:</span>
              <span>Integrated Swap</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs font-mono text-gray-500">
            <div className="flex justify-between">
              <span>Network:</span>
              <span>Base</span>
            </div>
            <div className="flex justify-between">
              <span>DEX:</span>
              <span>Uniswap V3</span>
            </div>
            <div className="flex justify-between">
              <span>Token:</span>
              <span>0x746...1B07</span>
            </div>
          </div>
        )}
      </div>

      {/* Context-specific notice */}
      <div className="text-xs font-sans text-gray-600 italic text-left p-3 bg-gray-50">
        {isInFrame ? (
          <>$SOLAR tokens power the Solara ecosystem. Use them for enhanced features, ceremony sponsorship, and cosmic rewards.</>
        ) : (
          <>You&apos;ll be redirected to Uniswap to complete the swap. Make sure you&apos;re connected to Base network with $SOLAR token address: 0x746042147240304098C837563aAEc0F671881B07</>
        )}
      </div>
    </div>
  );
}