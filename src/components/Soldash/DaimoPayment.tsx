import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface DaimoPaymentProps {
  amount: number;
  plan: 'monthly' | 'yearly';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const DaimoPayment: React.FC<DaimoPaymentProps> = ({
  amount,
  plan,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);

  const initiateDaimoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { DaimoPay } = await import('@daimo/pay');
      
      // Configure Daimo payment
      const daimoPay = new DaimoPay({
        // TODO: Add your Daimo configuration
        apiKey: process.env.NEXT_PUBLIC_DAIMO_API_KEY || '',
        network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
      });

      // Create payment request
      const paymentRequest = await daimoPay.createPayment({
        amount: amount, // Amount in USD
        currency: 'USD',
        description: `Sol Chart Pro - ${plan} subscription`,
        metadata: {
          plan: plan,
          feature: 'sol-chart-pro',
          timestamp: Date.now()
        },
        successUrl: `${window.location.origin}/soldash/you/expand/collect-data`,
        cancelUrl: `${window.location.origin}/soldash/you/expand`
      });

      setPaymentUrl(paymentRequest.paymentUrl);
      setPaymentStatus('pending');

      // Optionally open payment in new window/tab
      window.open(paymentRequest.paymentUrl, '_blank');

      // Poll for payment status
      pollPaymentStatus(paymentRequest.paymentId, daimoPay);

    } catch (error) {
      console.error('Daimo payment initiation failed:', error);
      setPaymentStatus('failed');
      if (onError) {
        onError('Failed to initiate crypto payment. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string, daimoPay: any) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await daimoPay.getPaymentStatus(paymentId);
        
        if (status.status === 'completed') {
          setPaymentStatus('completed');
          if (onSuccess) {
            onSuccess();
          }
          return;
        }
        
        if (status.status === 'failed' || status.status === 'cancelled') {
          setPaymentStatus('failed');
          if (onError) {
            onError('Payment was cancelled or failed.');
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          setPaymentStatus('failed');
          if (onError) {
            onError('Payment timeout. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          setPaymentStatus('failed');
          if (onError) {
            onError('Unable to verify payment status.');
          }
        }
      }
    };

    checkStatus();
  };

  const handleManualPayment = () => {
    // For development/testing without actual Daimo integration
    setIsProcessing(true);
    setTimeout(() => {
      setPaymentStatus('completed');
      setIsProcessing(false);
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);
  };

  if (paymentStatus === 'completed') {
    return (
      <motion.div
        className="text-center p-6 bg-[#E8F5E8] border border-[#A8D8A8] rounded"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-serif font-semibold text-green-800 mb-2">
          Payment Successful!
        </h3>
        <p className="text-sm text-green-700">
          Your crypto payment has been confirmed. Redirecting to chart setup...
        </p>
      </motion.div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <motion.div
        className="text-center p-6 bg-[#FFE8E8] border border-[#FFB3B3] rounded"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-serif font-semibold text-red-800 mb-2">
          Payment Failed
        </h3>
        <p className="text-sm text-red-700 mb-4">
          There was an issue processing your crypto payment.
        </p>
        <button
          onClick={() => {
            setPaymentStatus(null);
            setPaymentUrl(null);
          }}
          className="px-4 py-2 bg-[#E6B13A] text-black font-mono text-sm uppercase tracking-wide hover:bg-[#D4A02A] transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <motion.div
        className="text-center p-6 bg-[#FFF8E1] border border-[#FFE082] rounded"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-[#E6B13A] border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <h3 className="text-lg font-serif font-semibold text-[#444] mb-2">
          Waiting for Payment
        </h3>
        <p className="text-sm text-[#666] mb-4">
          Complete your payment in the Daimo app or browser window.
        </p>
        {paymentUrl && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#E6B13A] text-black font-mono text-sm uppercase tracking-wide hover:bg-[#D4A02A] transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Daimo Payment
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Wallet className="w-12 h-12 text-[#E6B13A] mx-auto mb-4" />
        <h3 className="text-lg font-serif font-semibold text-[#444] mb-2">
          Pay with Crypto
        </h3>
        <p className="text-sm text-[#666] mb-4">
          Use Daimo for secure cryptocurrency payments
        </p>
        <div className="bg-[#FCF6E5] border border-[#E5E1D8] p-4 rounded mb-4">
          <div className="text-2xl font-serif font-bold text-[#444] mb-1">
            ${amount}
          </div>
          <div className="text-sm text-[#666]">
            {plan === 'monthly' ? 'per month' : 'per year'}
          </div>
        </div>
      </div>

      <button
        onClick={process.env.NODE_ENV === 'development' ? handleManualPayment : initiateDaimoPayment}
        disabled={isProcessing}
        className={`w-full py-4 ${
          isProcessing 
            ? 'bg-[#D7D7D7] cursor-not-allowed' 
            : 'bg-[#E6B13A] hover:bg-[#D4A02A]'
        } text-black font-mono text-lg tracking-widest uppercase border-none transition-colors flex items-center justify-center space-x-2`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Pay with Crypto</span>
          </>
        )}
      </button>

      <div className="text-xs text-[#888] text-center">
        Secure payments powered by Daimo • USDC accepted
      </div>
    </div>
  );
};

export default DaimoPayment;