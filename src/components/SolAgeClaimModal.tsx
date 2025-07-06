"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';

interface SolAgeClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  solAge: number;
  archetype?: string;
  platform?: string;
  shareId?: string;
  claimAmount?: number;
}

type ClaimStep = 'verify' | 'connect' | 'claim' | 'success';

export function SolAgeClaimModal({
  isOpen,
  onClose,
  solAge,
  archetype,
  platform,
  shareId,
  claimAmount = 1000
}: SolAgeClaimModalProps) {
  const [step, setStep] = useState<ClaimStep>('verify');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Wagmi wallet state
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Check if user has shared recently
  useEffect(() => {
    if (isOpen && step === 'verify') {
      const checkShare = () => {
        const storedShare = localStorage.getItem('latest_solage_share');
        if (storedShare) {
          const shareData = JSON.parse(storedShare);
          const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
          
          if (shareData.timestamp > thirtyMinutesAgo && shareData.solAge === solAge) {
            setIsVerified(true);
            setStep('connect');
          } else {
            setError('No recent share found. Please share your sol age first.');
          }
        } else {
          setError('No share found. Please share your sol age first.');
        }
      };
      
      checkShare();
    }
  }, [isOpen, step, solAge]);

  const handleConnectWallet = async () => {
    try {
      if (connectors && connectors.length > 0) {
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet');
    }
  };

  const handleCreateAccountAndClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      // For non-farcaster users, we'll need to create an account
      // This is where Privy integration would come in
      if (!userEmail.trim()) {
        setError('Please enter your email address');
        setClaiming(false);
        return;
      }

      const res = await fetch('/api/solage/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solAge,
          archetype,
          platform,
          shareId,
          walletAddress: address,
          email: userEmail.trim(),
          claimAmount
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setStep('success');
      triggerConfetti();
      
      // Clear stored share after successful claim
      localStorage.removeItem('latest_solage_share');
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  const handleDirectClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      const res = await fetch('/api/solage/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solAge,
          archetype,
          platform,
          shareId,
          walletAddress: address,
          claimAmount
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setStep('success');
      triggerConfetti();
      
      // Clear stored share after successful claim
      localStorage.removeItem('latest_solage_share');
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  const triggerConfetti = () => {
    const sunEmojis = ['🌞', '☀️', '🌅', '🌄', '⭐', '🌟'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.textContent = sunEmojis[Math.floor(Math.random() * sunEmojis.length)];
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
          { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
          duration: 4000 + Math.random() * 2000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
          document.body.removeChild(confetti);
        };
      }, i * 150);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'verify':
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">Verifying Share</h2>
            <p className="text-gray-600 mb-6">
              Checking if you've shared your sol age recently...
            </p>
            {error && (
              <div className="text-red-500 text-sm font-mono mb-4">
                {error}
              </div>
            )}
          </div>
        );

      case 'connect':
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">🌞</div>
            <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to claim {claimAmount.toLocaleString()} $SOLAR tokens for sharing your sol age
            </p>

            {isConnected && address ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Wallet Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={handleDirectClaim}
                  disabled={claiming}
                  className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                >
                  {claiming ? 'CLAIMING...' : 'CLAIM $SOLAR'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleConnectWallet}
                  className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors"
                >
                  CONNECT WALLET
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowEmailInput(!showEmailInput)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-mono text-sm hover:bg-gray-50 transition-colors"
                >
                  CREATE ACCOUNT & CLAIM
                </button>
                
                {showEmailInput && (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      onClick={handleCreateAccountAndClaim}
                      disabled={claiming || !userEmail.trim()}
                      className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                    >
                      {claiming ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT & CLAIM'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm font-mono mt-4">
                {error}
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">Tokens Claimed!</h2>
            <p className="text-gray-600 mb-6">
              Your {claimAmount.toLocaleString()} $SOLAR tokens have been claimed successfully!
            </p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
              <p className="text-sm text-yellow-700">
                <strong>What's next?</strong> Your tokens will be deposited to your wallet within 24 hours.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors"
            >
              AWESOME!
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white border border-gray-200 p-6">
          {renderStepContent()}
          
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-gray-500 font-mono text-sm hover:text-gray-700 transition-colors"
            >
              CANCEL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}