import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  productName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  productName,
  onSuccess,
  onError,
  className = '',
  disabled = false,
  variant = 'primary'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // TODO: Integrate with Stripe Checkout
      // This is where you'd create a Stripe checkout session
      console.log(`Processing payment for ${productName}: $${amount}`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success for now
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Payment failed:', error);
      if (onError) {
        onError('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const baseClasses = `
    w-full py-4 font-mono text-lg tracking-widest uppercase border-none transition-all duration-200
    flex items-center justify-center space-x-2 relative overflow-hidden
  `;

  const variantClasses = {
    primary: `
      bg-[#E6B13A] text-black hover:bg-[#D4A02A] 
      ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `,
    secondary: `
      bg-white border border-[#D7D7D7] text-[#444] hover:bg-[#FCF6E5]
      ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `
  };

  return (
    <motion.button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={!disabled && !isProcessing ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isProcessing ? { scale: 0.98 } : {}}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>${amount} - {productName}</span>
          <Lock className="w-4 h-4 opacity-60" />
        </>
      )}
    </motion.button>
  );
};

export default PaymentButton;