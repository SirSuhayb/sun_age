import { ethers } from 'ethers';

// Payment method types
export type PaymentMethod = 'fiat' | 'usdc' | 'solar';

// Payment package interface
export interface PaymentPackage {
  id: string;
  name: string;
  currency: string;
  price: number;
  rolls: number;
  popular?: boolean;
  icon: string;
  color: string;
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  rollsAdded: number;
}

// Contract addresses
const SOLAR_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS as `0x${string}`;
const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;

// Stripe product IDs
const STRIPE_PRODUCTS = {
  '5_ROLLS': process.env.STRIPE_PRODUCT_5_ROLLS,
  '15_ROLLS': process.env.STRIPE_PRODUCT_15_ROLLS,
  '50_ROLLS': process.env.STRIPE_PRODUCT_50_ROLLS,
} as const;

// Contract ABIs
const SOLAR_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

const USDC_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export class PaymentProcessor {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Process fiat payment via Stripe
   */
  async processFiatPayment(
    packageData: PaymentPackage,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      // Get the appropriate Stripe product ID based on rolls
      const productKey = `${packageData.rolls}_ROLLS` as keyof typeof STRIPE_PRODUCTS;
      const stripeProductId = STRIPE_PRODUCTS[productKey];
      
      if (!stripeProductId) {
        throw new Error(`No Stripe product configured for ${packageData.rolls} rolls`);
      }

      // Call Stripe API to process payment
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          amount: packageData.price * 100, // Convert to cents
          currency: 'usd',
          packageId: packageData.id,
          rolls: packageData.rolls,
          stripeProductId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return {
        success: true,
        rollsAdded: packageData.rolls,
        transactionHash: result.paymentIntentId
      };
    } catch (error) {
      console.error('Fiat payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        rollsAdded: 0
      };
    }
  }

  /**
   * Process USDC payment
   */
  async processUSDCPayment(
    packageData: PaymentPackage,
    userAddress: string,
    signature: string
  ): Promise<PaymentResult> {
    try {
      // Verify user has sufficient USDC balance
      const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, USDC_TOKEN_ABI, this.provider);
      const userBalance = await usdcContract.balanceOf(userAddress);
      const requiredAmount = ethers.parseUnits(packageData.price.toString(), 6); // USDC has 6 decimals

      if (userBalance < requiredAmount) {
        throw new Error('Insufficient USDC balance');
      }

      // Call API to process USDC payment
      const response = await fetch('/api/payments/usdc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          amount: packageData.price,
          packageId: packageData.id,
          rolls: packageData.rolls,
          signature
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'USDC payment failed');
      }

      return {
        success: true,
        transactionHash: result.transactionHash,
        rollsAdded: packageData.rolls
      };
    } catch (error) {
      console.error('USDC payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'USDC payment failed',
        rollsAdded: 0
      };
    }
  }

  /**
   * Process SOLAR token payment
   */
  async processSolarPayment(
    packageData: PaymentPackage,
    userAddress: string,
    signature: string
  ): Promise<PaymentResult> {
    try {
      // Verify user has sufficient SOLAR balance
      const solarContract = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, this.provider);
      const userBalance = await solarContract.balanceOf(userAddress);
      const requiredAmount = ethers.parseUnits(packageData.price.toString(), 18); // SOLAR has 18 decimals

      if (userBalance < requiredAmount) {
        throw new Error('Insufficient SOLAR balance');
      }

      // Call API to process SOLAR payment
      const response = await fetch('/api/payments/solar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          amount: packageData.price,
          packageId: packageData.id,
          rolls: packageData.rolls,
          signature
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'SOLAR payment failed');
      }

      return {
        success: true,
        transactionHash: result.transactionHash,
        rollsAdded: packageData.rolls
      };
    } catch (error) {
      console.error('SOLAR payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SOLAR payment failed',
        rollsAdded: 0
      };
    }
  }

  /**
   * Main payment processing method
   */
  async processPayment(
    paymentMethod: PaymentMethod,
    packageData: PaymentPackage,
    userAddress?: string,
    paymentMethodId?: string,
    signature?: string
  ): Promise<PaymentResult> {
    switch (paymentMethod) {
      case 'fiat':
        if (!paymentMethodId) {
          throw new Error('Payment method ID required for fiat payments');
        }
        return await this.processFiatPayment(packageData, paymentMethodId);

      case 'usdc':
        if (!userAddress || !signature) {
          throw new Error('User address and signature required for USDC payments');
        }
        return await this.processUSDCPayment(packageData, userAddress, signature);

      case 'solar':
        if (!userAddress || !signature) {
          throw new Error('User address and signature required for SOLAR payments');
        }
        return await this.processSolarPayment(packageData, userAddress, signature);

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }

  /**
   * Get user's token balances
   */
  async getUserBalances(userAddress: string): Promise<{
    solar: number;
    usdc: number;
  }> {
    try {
      const solarContract = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, this.provider);
      const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, USDC_TOKEN_ABI, this.provider);

      const [solarBalance, usdcBalance] = await Promise.all([
        solarContract.balanceOf(userAddress),
        usdcContract.balanceOf(userAddress)
      ]);

      return {
        solar: Number(ethers.formatUnits(solarBalance, 18)),
        usdc: Number(ethers.formatUnits(usdcBalance, 6))
      };
    } catch (error) {
      console.error('Error fetching balances:', error);
      return { solar: 0, usdc: 0 };
    }
  }
}

export const paymentProcessor = new PaymentProcessor(); 