"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { useAccount } from 'wagmi';
import Image from "next/image";

export default function CosmicCodexPage() {
  const router = useRouter();
  const { isInFrame, context } = useFrameSDK();
  const { address } = useAccount();
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has already unlocked cosmic codex
  useEffect(() => {
    const checkUnlockStatus = async () => {
      const unlockStatus = localStorage.getItem(`cosmic-codex-${address}`);
      if (unlockStatus) {
        setHasUnlocked(true);
      }
    };
    
    if (address) {
      checkUnlockStatus();
    }
  }, [address]);

  // Auto-select payment method based on user type
  useEffect(() => {
    if (isInFrame && context?.user?.fid) {
      setPaymentMethod('crypto');
    }
  }, [isInFrame, context]);

  const handlePaymentSuccess = () => {
    setHasUnlocked(true);
    localStorage.setItem(`cosmic-codex-${address}`, 'true');
  };

  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate USDC payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      handlePaymentSuccess();
    } catch (err) {
      setError('Crypto payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFiatPayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate Stripe payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      handlePaymentSuccess();
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasUnlocked) {
    return <UnlockedCosmicCodex />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white relative">
      <div className="w-full flex flex-col items-center flex-grow" style={{ background: 'rgba(255,252,242,0.5)', borderTop: '1px solid #9CA3AF', borderBottom: '1px solid #9CA3AF' }}>
        <div className="max-w-md mx-auto w-full px-6 pt-16 pb-8 min-h-[60vh] flex flex-col">
          
          {/* Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="relative">
              <Image
                src="/sunsun.png"
                alt="Sun"
                width={80}
                height={80}
                className="object-contain mx-auto opacity-80"
                style={{ filter: 'drop-shadow(0 0 20px #FFD700cc)' }}
                priority
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                Cosmic Codex
              </h1>
              <p className="text-sm font-mono text-gray-600 tracking-wide uppercase">
                Unlock Your Celestial Journey
              </p>
            </div>
          </div>

          {/* What You'll Unlock */}
          <div className="border border-gray-300 rounded p-6 bg-gray-50 mb-6">
            <h3 className="font-mono font-bold mb-4 uppercase tracking-widest text-sm">What You'll Unlock:</h3>
            <ul className="text-sm space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-lg mr-3">🌌</span>
                <span>Personalized cosmic journey maps based on your Sol Age</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-3">📊</span>
                <span>Advanced milestone analytics and predictions</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-3">🔮</span>
                <span>Celestial event notifications and alignments</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-3">📜</span>
                <span>Exclusive cosmic wisdom and guided meditations</span>
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-3">⭐</span>
                <span>Premium journey visualizations and insights</span>
              </li>
            </ul>
          </div>

          {/* Payment Method Selection for Web Users */}
          {!paymentMethod && !isInFrame && (
            <div className="space-y-4 mb-6">
              <h3 className="font-mono font-bold text-center uppercase tracking-widest text-sm">Choose Payment Method</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className="border border-gray-300 rounded p-6 hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="text-3xl mb-3">₿</div>
                  <div className="font-mono font-bold text-sm uppercase">Crypto</div>
                  <div className="text-xs text-gray-600 mt-1">Pay with USDC</div>
                  <div className="text-sm text-green-600 mt-2 font-bold">$7.99</div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('fiat')}
                  className="border border-gray-300 rounded p-6 hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="text-3xl mb-3">💳</div>
                  <div className="font-mono font-bold text-sm uppercase">Credit Card</div>
                  <div className="text-xs text-gray-600 mt-1">Pay with card</div>
                  <div className="text-sm text-blue-600 mt-2 font-bold">$9.99</div>
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center font-mono">
                Crypto payment discounted for early adopters
              </div>
            </div>
          )}

          {/* Crypto Payment */}
          {paymentMethod === 'crypto' && (
            <div className="space-y-4">
              <div className="border border-gray-300 rounded p-6">
                <h3 className="font-mono font-bold mb-4 uppercase tracking-widest text-sm">Crypto Payment</h3>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-bold">$7.99 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-bold">Base</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Treasury:</span>
                    <span className="font-bold text-xs">Morpho Integration</span>
                  </div>
                </div>
              </div>

              {isInFrame && context?.user?.fid && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="text-sm text-blue-800">
                    <strong>Farcaster User Detected!</strong> Payment will be processed through your connected wallet.
                  </div>
                </div>
              )}

              <button
                onClick={handleCryptoPayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'PROCESSING...' : 'UNLOCK WITH USDC'}
              </button>
            </div>
          )}

          {/* Fiat Payment */}
          {paymentMethod === 'fiat' && (
            <div className="space-y-4">
              <div className="border border-gray-300 rounded p-6">
                <h3 className="font-mono font-bold mb-4 uppercase tracking-widest text-sm">Credit Card Payment</h3>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span>Cosmic Codex Unlock:</span>
                    <span className="font-bold">$9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>$9.99</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> 50% of fiat revenue is automatically converted to USDC for treasury management.
                </div>
              </div>

              <button
                onClick={handleFiatPayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'PROCESSING...' : 'UNLOCK WITH CARD'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm text-center mt-4 font-mono">
              {error}
            </div>
          )}

          {/* Back to Journey */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <button
              onClick={() => router.push('/soldash?tab=journal')}
              className="text-sm font-mono text-gray-600 hover:text-black transition-colors uppercase tracking-widest"
            >
              ← Back to Journey
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Unlocked Cosmic Codex Content
function UnlockedCosmicCodex() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex flex-col bg-white relative">
      <div className="w-full flex flex-col items-center flex-grow" style={{ background: 'rgba(255,252,242,0.5)' }}>
        <div className="max-w-md mx-auto w-full px-6 pt-16 pb-8">
          
          {/* Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="text-4xl">✨</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold text-green-600 tracking-tight">
                Cosmic Codex Unlocked!
              </h1>
              <p className="text-sm font-mono text-gray-600 tracking-wide uppercase">
                Your celestial journey awaits
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-green-200 rounded p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">🌌</div>
              <div className="font-mono font-bold text-sm">Journey Maps</div>
              <div className="text-xs text-gray-600">Personalized cosmic paths</div>
            </div>
            
            <div className="border border-blue-200 rounded p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-mono font-bold text-sm">Analytics</div>
              <div className="text-xs text-gray-600">Advanced predictions</div>
            </div>
            
            <div className="border border-purple-200 rounded p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">🔮</div>
              <div className="font-mono font-bold text-sm">Alignments</div>
              <div className="text-xs text-gray-600">Celestial events</div>
            </div>
            
            <div className="border border-orange-200 rounded p-4 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">📜</div>
              <div className="font-mono font-bold text-sm">Wisdom</div>
              <div className="text-xs text-gray-600">Guided insights</div>
            </div>
          </div>

          {/* Featured Content Preview */}
          <div className="border border-gray-200 rounded p-6 mb-6">
            <h3 className="font-mono font-bold mb-4 uppercase tracking-widest text-sm">Featured: Today's Cosmic Insight</h3>
            <div className="text-sm text-gray-700 italic leading-relaxed">
              "The cosmos whispers secrets to those who listen with their solar heart. Your journey of {Math.floor(Math.random() * 10000) + 1000} rotations has prepared you for this moment of celestial revelation."
            </div>
            <div className="mt-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
              Next update in 23 hours, 47 minutes
            </div>
          </div>

          {/* Quick Stats */}
          <div className="border border-gray-200 rounded p-6 mb-8">
            <h3 className="font-mono font-bold mb-4 uppercase tracking-widest text-sm">Your Cosmic Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Phase:</div>
                <div className="font-bold">Solar Sage</div>
              </div>
              <div>
                <div className="text-gray-600">Next Milestone:</div>
                <div className="font-bold">147 days</div>
              </div>
              <div>
                <div className="text-gray-600">Alignment:</div>
                <div className="font-bold">Jupiter Rising</div>
              </div>
              <div>
                <div className="text-gray-600">Cosmic Level:</div>
                <div className="font-bold">Tier III</div>
              </div>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="border-t border-gray-300 pt-4">
            <button
              onClick={() => router.push('/soldash?tab=journal')}
              className="text-sm font-mono text-gray-600 hover:text-black transition-colors uppercase tracking-widest"
            >
              ← Back to Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}