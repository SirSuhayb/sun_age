'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Fragment } from 'react';
import { ConfirmationModal } from '~/components/ui/ConfirmationModal';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useAccount, useWalletClient, usePublicClient, useConnect } from 'wagmi';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { DaimoPayButton } from '@daimo/pay';
import { useRef } from 'react';

interface PaymentOption {
  id: string;
  name: string;
  currency: string;
  price: number;
  rolls: number;
  popular?: boolean;
  icon: string;
  color: string;
}

// Move this to the top-level, outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function FiatPaymentForm({ selectedPackage, onSuccess }: { selectedPackage: PaymentOption | null, onSuccess: (rolls: number) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements || !selectedPackage) return;
    setProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (pmError || !paymentMethod) throw pmError || new Error('No payment method');
      // Call backend to process payment
      const res = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: selectedPackage.price * 100,
          currency: 'usd',
          packageId: selectedPackage.id,
          rolls: selectedPackage.rolls
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      onSuccess(selectedPackage.rolls);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="p-3 border border-amber-300 bg-white" style={{ borderRadius: 0 }}>
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="submit" disabled={processing || !stripe} className="w-full bg-amber-500 text-white py-2 rounded-none font-bold mt-2">
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function MoreRollsPage() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'crypto'>('card');
  const [selectedPackage, setSelectedPackage] = useState<PaymentOption | null>(null);
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRolls, setSuccessRolls] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDaimoPay, setShowDaimoPay] = useState(false);
  const daimoPayRef = useRef<any>(null);
  const [daimoKey, setDaimoKey] = useState(0);

  // Debug logging for DaimoPay
  useEffect(() => {
    if (selectedPackage && selectedPayment === 'crypto') {
      console.log('DaimoPay Debug:', {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        toUnits: selectedPackage.price.toString(),
        key: `daimo-${selectedPackage.id}-${selectedPackage.price}-${daimoKey}`
      });
      // Force DaimoPay to re-render by updating the key
      setDaimoKey(prev => prev + 1);
    }
  }, [selectedPackage, selectedPayment]); // eslint-disable-line react-hooks/exhaustive-deps

  // Package options matching the screenshot
  const packages: PaymentOption[] = [
    {
      id: 'cosmic-starter',
      name: 'Cosmic Starter',
      currency: 'USD',
      price: 2.99,
      rolls: 5,
      icon: '⭐',
      color: 'bg-white'
    },
    {
      id: 'solar-seeker',
      name: 'Solar Seeker',
      currency: 'USD',
      price: 7.99,
      rolls: 15,
      popular: true,
      icon: '☀️',
      color: 'bg-white'
    },
    {
      id: 'galactic-guide',
      name: 'Galactic Guide',
      currency: 'USD',
      price: 14.99,
      rolls: 30,
      icon: '🌌',
      color: 'bg-white'
    }
  ];

  const getCtaLabel = () => {
    if (!selectedPackage) return 'SELECT PACKAGE';
    return 'SELECT PACKAGE';
  };

  const handleCtaClick = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Only handle card payments here - crypto is handled by DaimoPayButton
      setShowFiatModal(true);
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  function handleFiatSuccess(rolls: number) {
    setShowFiatModal(false);
    setSuccessRolls(rolls);
    setShowSuccessModal(true);
  }

  return (
    <Elements stripe={stripePromise}>
      <>
        <div className="relative z-10 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          {/* Header with Back and Info (Asterisk) Icon */}
          <div className="w-full bg-none border-b border-gray-200 mt-24 px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.push('/surprise-me')}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors font-mono text-sm uppercase tracking-wide"
            >
              <span>←</span>
              <span>BACK</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="font-serif font-bold text-xl text-gray-800">buy cosmic rolls</h1>
            </div>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center justify-center w-8 h-8 ml-2"
              aria-label="Information"
              style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <Image src="/asterisk_icon.svg" alt="Info" width={24} height={24} className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto px-4 py-8">
            {/* Payment Method Selection */}
            <div className="mb-8">
              <h2 className="font-serif italic text-lg text-gray-800 mb-4 text-center">
                Payment method
              </h2>
              <div className="flex border border-gray-300">
                <button
                  onClick={() => setSelectedPayment('card')}
                  className={`flex-1 py-3 px-4 font-base uppercase font-mono ${
                    selectedPayment === 'card' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-white text-gray-700 border-r border-gray-300'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  CARD
                </button>
                <button
                  onClick={() => setSelectedPayment('crypto')}
                  className={`flex-1 py-3 px-4 font-base uppercase font-mono ${
                    selectedPayment === 'crypto' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-white text-gray-700'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  CRYPTO
                </button>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-8">
              <h2 className="font-serif italic text-lg text-gray-800 mb-4 text-center">
                Select your package
              </h2>
              <div className="space-y-3">
                {packages.map((option) => (
                  <div
                    key={option.id}
                    className={`relative border border-yellow-300 p-4 cursor-pointer ${
                      selectedPackage?.id === option.id ? 'bg-yellow-50' : 'bg-white'
                    }`}
                    onClick={() => setSelectedPackage(option)}
                    style={{ borderRadius: 0 }}
                  >
                    {option.popular && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-xs font-bold uppercase">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{option.icon}</div>
                        <div>
                          <div className="font-serif font-bold text-lg text-gray-800">{option.name}</div>
                          <div className="text-sm text-gray-600 uppercase font-mono">{option.rolls} ROLLS</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif font-bold text-lg text-gray-800">{option.price} USD</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Main CTA Button - Only show for CARD payment */}
            {selectedPayment === 'card' && (
              <button
                className={`w-full py-4 bg-yellow-500 text-black font-base uppercase text-lg font-mono ${
                  !selectedPackage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ borderRadius: 0 }}
                disabled={!selectedPackage || isProcessing}
                onClick={handleCtaClick}
              >
                {isProcessing ? 'Processing...' : 'SELECT PACKAGE'}
              </button>
            )}
            
            {/* DaimoPay Button - Only show for CRYPTO payment */}
            {selectedPayment === 'crypto' && selectedPackage && (
              <DaimoPayButton.Custom
                key={`daimo-${selectedPackage.id}-${selectedPackage.price}-${daimoKey}`}
                appId="pay-demo" // Replace with your real App ID
                toAddress={process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`}
                toChain={8453} // Base mainnet
                toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // USDC on Base
                toUnits={selectedPackage.price.toString()}
                intent="Purchase"
                externalId={selectedPackage.id}
                onPaymentCompleted={(e) => {
                  setShowSuccessModal(true);
                  setSuccessRolls(selectedPackage.rolls);
                }}
              >
                {({ show }) => (
                  <button
                    onClick={show}
                    className={`w-full py-4 bg-yellow-500 text-black font-base uppercase text-lg font-mono ${
                      !selectedPackage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                    disabled={!selectedPackage || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'SELECT PACKAGE'}
                  </button>
                )}
              </DaimoPayButton.Custom>
            )}
          </div>

          {/* FIAT Payment Modal */}
          <ConfirmationModal
            isOpen={showFiatModal}
            onClose={() => setShowFiatModal(false)}
            onConfirm={() => {}}
            title="Enter Card Details"
            message={selectedPackage ? `Pay ${selectedPackage.price} USD for ${selectedPackage.rolls} rolls` : ''}
            confirmText=""
            cancelText="Cancel"
            hideConfirmButton
          >
            <FiatPaymentForm selectedPackage={selectedPackage} onSuccess={handleFiatSuccess} />
          </ConfirmationModal>

          {/* Success Modal */}
          <ConfirmationModal
            isOpen={showSuccessModal}
            onClose={() => { setShowSuccessModal(false); router.push('/surprise-me'); }}
            onConfirm={() => { setShowSuccessModal(false); router.push('/surprise-me'); }}
            title="Payment Successful!"
            message={successRolls ? `You purchased ${successRolls} rolls. Enjoy your cosmic journey!` : 'Payment complete.'}
            confirmText="Go to Surprise Me"
            cancelText="Close"
            hideConfirmButton={false}
          />

          {/* Payment Processing Spinner/Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
              {/* Spinner or animation */}
            </div>
          )}

          {/* Info Modal */}
          {showInfoModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 z-[99999] bg-solara-sunrise" style={{ opacity: 0.6 }} />
              <div className="relative z-[100000] w-full">
                <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-8 max-w-[360px] mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>About Cosmic Rolls</div>
                    <button onClick={() => setShowInfoModal(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
                  </div>
                  <div className="text-base font-serif text-gray-700 mb-8 leading-relaxed">
                    Purchase additional cosmic rolls to expand your oracle guidance. Each roll provides unique cosmic wisdom tailored to your journey. Rolls are used daily and reset each day.
                  </div>
                  <div className="flex justify-center">
                    <button
                      className="px-8 py-3 bg-[#d4af37] text-black font-mono text-sm font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37] uppercase tracking-widest"
                      onClick={() => setShowInfoModal(false)}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </Elements>
  );
}