import { NextRequest, NextResponse } from 'next/server';

interface ClaimRequest {
  solAge: number;
  archetype?: string;
  platform: string;
  shareId: string;
  walletAddress?: string;
  email?: string;
  claimAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();
    const { solAge, archetype, platform, shareId, walletAddress, email, claimAmount } = body;

    // Validate required fields
    if (!solAge || !platform || !shareId || !claimAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that user has either wallet or email
    if (!walletAddress && !email) {
      return NextResponse.json(
        { error: 'Either wallet address or email is required' },
        { status: 400 }
      );
    }

    // Check if this share has already been claimed
    const existingClaim = await checkExistingClaim(shareId);
    if (existingClaim) {
      return NextResponse.json(
        { error: 'This share has already been claimed' },
        { status: 409 }
      );
    }

    // Validate claim amount (prevent abuse)
    if (claimAmount > 5000) {
      return NextResponse.json(
        { error: 'Claim amount exceeds maximum allowed' },
        { status: 400 }
      );
    }

    // For farcaster users, tokens go to their farcaster wallet
    if (platform === 'farcaster' && walletAddress) {
      const claimRecord = await createClaimRecord({
        shareId,
        platform,
        solAge,
        archetype,
        walletAddress,
        claimAmount,
        status: 'pending',
        claimType: 'solage_share'
      });

      // Queue the token distribution (this would integrate with your token distribution system)
      await queueTokenDistribution({
        walletAddress,
        amount: claimAmount,
        reason: 'Sol Age Share',
        platform: 'farcaster',
        claimId: claimRecord.id
      });

      return NextResponse.json({
        success: true,
        claimId: claimRecord.id,
        message: 'Claim successful! Tokens will be distributed to your Farcaster wallet.'
      });
    }

    // For non-farcaster users, create account via email and prepare wallet
    if (platform !== 'farcaster' && email) {
      // Create user account record
      const userRecord = await createUserAccount({
        email,
        platform,
        solAge,
        archetype
      });

      const claimRecord = await createClaimRecord({
        shareId,
        platform,
        solAge,
        archetype,
        email,
        walletAddress, // might be null initially
        claimAmount,
        status: 'pending_wallet',
        claimType: 'solage_share',
        userId: userRecord.id
      });

      // If wallet is provided, queue distribution
      if (walletAddress) {
        await queueTokenDistribution({
          walletAddress,
          amount: claimAmount,
          reason: 'Sol Age Share',
          platform,
          claimId: claimRecord.id
        });
      }

      return NextResponse.json({
        success: true,
        claimId: claimRecord.id,
        message: walletAddress 
          ? 'Claim successful! Tokens will be distributed to your wallet.'
          : 'Account created! Connect a wallet to receive your tokens.'
      });
    }

    return NextResponse.json(
      { error: 'Invalid claim configuration' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Sol Age claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions (these would integrate with your database)
async function checkExistingClaim(shareId: string) {
  // This would check your database for existing claims
  // For now, return false to allow claims
  return false;
}

async function createClaimRecord(data: {
  shareId: string;
  platform: string;
  solAge: number;
  archetype?: string;
  walletAddress?: string;
  email?: string;
  claimAmount: number;
  status: string;
  claimType: string;
  userId?: string;
}) {
  // This would create a record in your database
  // For now, return a mock record
  return {
    id: `claim_${Date.now()}`,
    ...data,
    createdAt: new Date()
  };
}

async function createUserAccount(data: {
  email: string;
  platform: string;
  solAge: number;
  archetype?: string;
}) {
  // This would create a user account in your database
  // For now, return a mock record
  return {
    id: `user_${Date.now()}`,
    ...data,
    createdAt: new Date()
  };
}

async function queueTokenDistribution(data: {
  walletAddress: string;
  amount: number;
  reason: string;
  platform: string;
  claimId: string;
}) {
  // This would queue the token distribution
  // You could integrate with your existing token distribution system
  console.log('Queueing token distribution:', data);
  
  // For now, just log the distribution
  // In a real implementation, you would:
  // 1. Add to a queue/database
  // 2. Process distributions in batches
  // 3. Handle failures and retries
  
  return { success: true };
}