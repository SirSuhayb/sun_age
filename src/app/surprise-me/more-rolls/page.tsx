'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

export default function MoreRollsPage() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<'usdc' | 'solar' | 'fiat'>('fiat');
  const [selectedPackage, setSelectedPackage] = useState<PaymentOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentOptions: Record<string, PaymentOption[]> = {
    fiat: [
      {
        id: 'fiat-basic',
        name: 'Cosmic Starter',
        currency: 'USD',
        price: 2.99,
        rolls: 5,
        icon: '🌟',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'fiat-premium',
        name: 'Solar Seeker',
        currency: 'USD',
        price: 7.99,
        rolls: 15,
        popular: true,
        icon: '☀️',
        color: 'bg-yellow-100 border-yellow-300'
      },
      {
        id: 'fiat-ultimate',
        name: 'Galactic Guide',
        currency: 'USD',
        price: 14.99,
        rolls: 30,
        icon: '🌌',
        color: 'bg-purple-100 border-purple-300'
      }
    ],
    usdc: [
      {
        id: 'usdc-basic',
        name: 'Cosmic Starter',
        currency: 'USDC',
        price: 2.5,
        rolls: 5,
        icon: '🌟',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'usdc-premium',
        name: 'Solar Seeker',
        currency: 'USDC',
        price: 7.0,
        rolls: 15,
        popular: true,
        icon: '☀️',
        color: 'bg-yellow-100 border-yellow-300'
      },
      {
        id: 'usdc-ultimate',
        name: 'Galactic Guide',
        currency: 'USDC',
        price: 13.0,
        rolls: 30,
        icon: '🌌',
        color: 'bg-purple-100 border-purple-300'
      }
    ],
    solar: [
      {
        id: 'solar-basic',
        name: 'Cosmic Starter',
        currency: 'SOLAR',
        price: 100,
        rolls: 5,
        icon: '🌟',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'solar-premium',
        name: 'Solar Seeker',
        currency: 'SOLAR',
        price: 250,
        rolls: 15,
        popular: true,
        icon: '☀️',
        color: 'bg-yellow-100 border-yellow-300'
      },
      {
        id: 'solar-ultimate',
        name: 'Galactic Guide',
        currency: 'SOLAR',
        price: 450,
        rolls: 30,
        icon: '🌌',
        color: 'bg-purple-100 border-purple-300'
      }
    ]
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add rolls to user's account
      const today = new Date().toDateString();
      const currentRolls = localStorage.getItem(`dailyRolls_${today}`);
      let rollData = currentRolls ? JSON.parse(currentRolls) : { remaining: 0, history: [] };
      
      rollData.remaining += selectedPackage.rolls;
      localStorage.setItem(`dailyRolls_${today}`, JSON.stringify(rollData));
      
      // Redirect back to surprise me page
      router.push('/surprise-me');
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle payment failure
    } finally {
      setIsProcessing(false);
    }
  };

  const currentOptions = paymentOptions[selectedPayment];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative z-10">
      {/* Header */}
      <div className="w-full bg-white border-b border-amber-200 px-4 py-6 relative z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>←</span>
            <span className="font-mono text-sm uppercase tracking-wide">Back</span>
          </button>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl text-amber-800">More Rolls</h1>
            <p className="font-mono text-xs uppercase text-amber-600 tracking-wide">Expand Your Cosmic Journey</p>
          </div>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8 relative z-20">
        {/* Payment Method Selection */}
        <div className="mb-8">
          <h2 className="font-serif font-bold text-lg text-amber-800 mb-4 text-center">
            Choose Your Payment Method
          </h2>
          <div className="flex rounded-lg border border-amber-200 bg-white p-1">
            {[
              { id: 'fiat', label: 'Fiat', icon: '💳' },
              { id: 'usdc', label: 'USDC', icon: '💰' },
              { id: 'solar', label: 'Solar', icon: '☀️' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-mono text-sm uppercase tracking-wide transition-all duration-200 ${
                  selectedPayment === method.id
                    ? 'bg-amber-400 text-amber-900 shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Package Selection */}
        <div className="mb-8">
          <h2 className="font-serif font-bold text-lg text-amber-800 mb-4 text-center">
            Select Your Package
          </h2>
          <div className="space-y-4">
            {currentOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                  selectedPackage?.id === option.id
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${option.color}`}
                onClick={() => setSelectedPackage(option)}
              >
                {option.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{option.icon}</div>
                    <div>
                      <div className="font-serif font-bold text-lg text-gray-800">{option.name}</div>
                      <div className="font-mono text-sm text-gray-600">
                        {option.rolls} rolls
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif font-bold text-xl text-gray-800">
                      {option.price} {option.currency}
                    </div>
                    <div className="font-mono text-xs text-gray-600">
                      {(option.price / option.rolls).toFixed(2)} per roll
                    </div>
                  </div>
                </div>
                {selectedPackage?.id === option.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-amber-900 text-sm">✓</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg border border-amber-200 p-6">
              <h3 className="font-serif font-bold text-lg text-amber-800 mb-4 text-center">
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-gray-600">Package:</span>
                  <span className="font-serif font-bold text-gray-800">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-gray-600">Rolls:</span>
                  <span className="font-serif font-bold text-gray-800">{selectedPackage.rolls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-gray-600">Payment Method:</span>
                  <span className="font-serif font-bold text-gray-800">{selectedPayment.toUpperCase()}</span>
                </div>
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-sm text-gray-600">Total:</span>
                    <span className="font-serif font-bold text-xl text-gray-800">
                      {selectedPackage.price} {selectedPackage.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Button */}
        {selectedPackage && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-serif font-bold text-lg transition-all duration-200 ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-400 text-amber-900 hover:bg-amber-500 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"
                />
                <span>Processing...</span>
              </div>
            ) : (
              `Purchase ${selectedPackage.rolls} Rolls`
            )}
          </motion.button>
        )}

        {/* Information */}
        <div className="mt-8 bg-white rounded-lg border border-amber-200 p-6">
          <h3 className="font-serif font-bold text-lg text-amber-800 mb-4 text-center">
            How It Works
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-amber-600">🎲</span>
              <div>
                <strong>Daily Rolls:</strong> You get 3 free rolls every day to discover personalized activities, items, and experiences.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600">✨</span>
              <div>
                <strong>Personalized:</strong> All reveals are tailored to your Solar Archetype for maximum relevance and growth.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600">🌟</span>
              <div>
                <strong>Rarity System:</strong> Common, rare, and legendary reveals offer different levels of cosmic guidance.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600">🔄</span>
              <div>
                <strong>Unlimited Storage:</strong> Your purchased rolls never expire and carry over each day.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}