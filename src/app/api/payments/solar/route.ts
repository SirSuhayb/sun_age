import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract addresses
const SOLAR_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

// SOLAR Token ABI
const SOLAR_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, amount, packageId, rolls, signature } = body;

    // Validate required fields
    if (!userAddress || !amount || !packageId || !rolls || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate signature (you should implement proper signature verification)
    const isValidSignature = await verifySignature(userAddress, amount, packageId, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    let transactionHash: string;

    if (ADMIN_PRIVATE_KEY) {
      // Real blockchain transaction
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org');
      const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      
      const solarContract = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, adminWallet);
      
      // Check user's SOLAR balance
      const userBalance = await solarContract.balanceOf(userAddress);
      const requiredAmount = ethers.parseUnits(amount.toString(), 18); // SOLAR has 18 decimals
      
      if (userBalance < requiredAmount) {
        return NextResponse.json(
          { error: 'Insufficient SOLAR balance' },
          { status: 400 }
        );
      }

      // Transfer SOLAR from user to treasury
      const tx = await solarContract.transferFrom(userAddress, TREASURY_ADDRESS, requiredAmount);
      await tx.wait();
      
      transactionHash = tx.hash;
    } else {
      // Simulate transaction for development
      console.log('No admin wallet configured, simulating SOLAR transfer...');
      transactionHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
    }

    // Record the purchase in database
    await recordPurchase({
      packageId,
      rolls,
      amount,
      currency: 'SOLAR',
      transactionHash,
      status: 'confirmed',
      paymentMethod: 'solar',
      userAddress
    });

    return NextResponse.json({
      success: true,
      transactionHash,
      status: 'confirmed',
      rollsAdded: rolls
    });

  } catch (error) {
    console.error('SOLAR payment error:', error);
    
    return NextResponse.json(
      { error: 'SOLAR payment processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to verify signature
async function verifySignature(userAddress: string, amount: number, packageId: string, signature: string): Promise<boolean> {
  // TODO: Implement proper signature verification
  // This should verify that the user signed the payment details
  console.log('Verifying signature for:', { userAddress, amount, packageId, signature });
  return true; // For now, always return true
}

// Helper function to record purchase in database
async function recordPurchase(data: {
  packageId: string;
  rolls: number;
  amount: number;
  currency: string;
  transactionHash: string;
  status: string;
  paymentMethod: string;
  userAddress: string;
}) {
  // TODO: Implement database recording
  console.log('Recording SOLAR purchase:', data);
} 