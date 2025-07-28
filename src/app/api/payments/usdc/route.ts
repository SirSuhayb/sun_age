import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract addresses
const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;

// USDC Token ABI
const USDC_TOKEN_ABI = [
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
    const { userAddress, amount, packageId, rolls, signature, txHash } = body;

    // Validate required fields
    if (!userAddress || !amount || !packageId || !rolls || !signature || !txHash) {
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

    // Fetch and verify the transaction
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org');
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 400 }
      );
    }
    // Wait for confirmation
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return NextResponse.json(
        { error: 'Transaction not confirmed or failed' },
        { status: 400 }
      );
    }
    // Check that the transaction is a USDC transfer to the treasury
    // This is an ERC20 transfer, so check data and to address
    const usdcIface = new ethers.Interface(USDC_TOKEN_ABI);
    // ERC20 transfer selector: a9059cbb
    const transferSelector = usdcIface.getFunction('transfer').selector;
    if (!tx.to || tx.to.toLowerCase() !== USDC_TOKEN_ADDRESS.toLowerCase()) {
      return NextResponse.json(
        { error: 'Transaction not sent to USDC contract' },
        { status: 400 }
      );
    }
    if (!tx.data.startsWith(transferSelector)) {
      return NextResponse.json(
        { error: 'Transaction is not a USDC transfer' },
        { status: 400 }
      );
    }
    // Decode transfer params
    let decoded;
    try {
      decoded = usdcIface.decodeFunctionData('transfer', tx.data);
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to decode transfer data' },
        { status: 400 }
      );
    }
    const [to, value] = decoded;
    if (to.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      return NextResponse.json(
        { error: 'Transfer not sent to treasury address' },
        { status: 400 }
      );
    }
    const requiredAmount = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    if (!value.eq(requiredAmount)) {
      return NextResponse.json(
        { error: 'Transfer amount does not match package price' },
        { status: 400 }
      );
    }
    if (!tx.from || tx.from.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Transaction not sent from user address' },
        { status: 400 }
      );
    }

    // TODO: Prevent double-spending by checking if txHash already used

    // Record the purchase in database
    await recordPurchase({
      packageId,
      rolls,
      amount,
      currency: 'USDC',
      transactionHash: txHash,
      status: 'confirmed',
      paymentMethod: 'usdc',
      userAddress
    });

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      status: 'confirmed',
      rollsAdded: rolls
    });

  } catch (error) {
    console.error('USDC payment error:', error);
    return NextResponse.json(
      { error: 'USDC payment processing failed' },
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
  console.log('Recording USDC purchase:', data);
} 