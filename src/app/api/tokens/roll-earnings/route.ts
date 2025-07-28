import { NextRequest, NextResponse } from 'next/server';
import { tokenDistributor } from '~/lib/tokenDistributor';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, amount, rollTitle, rarity } = await req.json();

    // Validate required fields
    if (!walletAddress || !amount || !rollTitle || !rarity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Distribute tokens using the token distributor
    const distributionResult = await tokenDistributor.distributeRollEarnings(
      walletAddress,
      amount,
      rollTitle,
      rarity
    );

    if (distributionResult.success) {
      return NextResponse.json({
        success: true,
        transactionHash: distributionResult.transactionHash,
        amount: distributionResult.amount,
        recipientAddress: distributionResult.recipientAddress,
        message: `Successfully distributed ${amount} SOLAR tokens for your roll!`
      });
    } else {
      return NextResponse.json(
        { error: distributionResult.error || 'Token distribution failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Roll earnings distribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 