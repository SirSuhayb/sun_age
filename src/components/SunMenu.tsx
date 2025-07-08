"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

interface SunMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWallet: () => void;
  onClaimTokens: () => void;
}

export function SunMenu({ isOpen, onClose, onConnectWallet, onClaimTokens }: SunMenuProps) {
  const [solarBalance, setSolarBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch SOLAR balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !isConnected) return;

      setLoadingBalance(true);
      try {
        const response = await fetch(`/api/tokens/balance?address=${address}`);
        const data = await response.json();
        setSolarBalance(data.balance || 0);
      } catch (error) {
        console.error('Failed to fetch SOLAR balance:', error);
        setSolarBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (isConnected && address) {
      fetchBalance();
    }
  }, [address, isConnected]);

  // Check for pending claims
  const checkPendingClaims = () => {
    const storedShare = localStorage.getItem('latest_solage_share');
    if (storedShare) {
      try {
        const shareData = JSON.parse(storedShare);
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        return shareData.timestamp > thirtyMinutesAgo;
      } catch (error) {
        console.error('Failed to parse stored share data:', error);
        // Clear corrupted data
        localStorage.removeItem('latest_solage_share');
        return false;
      }
    }
    return false;
  };

  const hasPendingClaims = checkPendingClaims();

  if (!isOpen) return null;

  return (
    <div className="fixed top-14 right-4 z-50" ref={menuRef}>
      <div className="bg-white border border-[#d4af37] shadow-sm min-w-[280px] max-w-[320px]" style={{ boxShadow: '0 2px 8px 0 #e6c75a22' }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold">Solar Wallet</h3>
            <div className="text-2xl">🌞</div>
          </div>

          {isConnected && address ? (
            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="p-3 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-600">CONNECTED</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm font-mono text-gray-800">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>

              {/* SOLAR Balance */}
              <div className="p-3 bg-yellow-50 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-600">$SOLAR BALANCE</span>
                  <span className="text-xl">☀️</span>
                </div>
                <div className="text-lg font-bold text-yellow-700">
                  {loadingBalance ? (
                    'Loading...'
                  ) : (
                    `${solarBalance?.toLocaleString() || 0} $SOLAR`
                  )}
                </div>
              </div>

                             {/* Pending Claims */}
               {hasPendingClaims && (
                 <div className="p-3 bg-orange-50 border border-orange-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-mono text-orange-600">PENDING CLAIM</span>
                     <span className="text-xl">🎁</span>
                   </div>
                   <div className="text-sm text-orange-700 mb-2">
                     You have tokens to claim!
                   </div>
                   <button
                     onClick={onClaimTokens}
                     className="w-full px-3 py-2 bg-orange-500 text-white font-mono text-xs font-bold hover:bg-orange-600 transition-colors rounded-none"
                     style={{ letterSpacing: '0.1em' }}
                   >
                     CLAIM NOW
                   </button>
                 </div>
               )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    disconnect();
                    onClose();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-mono text-sm font-bold hover:bg-gray-50 transition-colors rounded-none"
                  style={{ letterSpacing: '0.1em' }}
                >
                  DISCONNECT
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 text-center">
                <div className="text-sm font-mono text-gray-600 mb-2">
                  NO WALLET CONNECTED
                </div>
                <div className="text-xs text-gray-500">
                  Connect your wallet to view your $SOLAR tokens
                </div>
              </div>

              {/* Pending Claims for non-connected users */}
              {hasPendingClaims && (
                <div className="p-3 bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-orange-600">PENDING CLAIM</span>
                    <span className="text-xl">🎁</span>
                  </div>
                  <div className="text-sm text-orange-700 mb-2">
                    You have tokens to claim!
                  </div>
                  <button
                    onClick={onClaimTokens}
                    className="w-full px-3 py-2 bg-orange-500 text-white font-mono text-xs hover:bg-orange-600 transition-colors"
                  >
                    CLAIM NOW
                  </button>
                </div>
              )}

              <button
                onClick={onConnectWallet}
                className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37]"
                style={{ letterSpacing: '0.1em' }}
              >
                CONNECT WALLET
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center font-mono tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              Earn $SOLAR tokens by sharing your cosmic journey
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}