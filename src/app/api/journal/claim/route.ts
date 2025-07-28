import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';
import { tokenDistributor } from '~/lib/tokenDistributor';

export async function POST(req: NextRequest) {
  const { userFid, entryId, shareId, walletAddress } = await req.json();
  const supabase = await createClient();

  // Accept both checksummed and lowercase addresses
  let normalizedAddress;
  try {
    // Simple address validation - you can use ethers.getAddress if ethers is imported
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      throw new Error('Invalid wallet address format');
    }
    normalizedAddress = walletAddress.toLowerCase();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  // Double-check eligibility
  const { data: claim } = await supabase
    .from('token_claims')
    .select('id')
    .eq('user_fid', userFid)
    .single();

  if (claim) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  // Verify entry and share exist
  const { data: entry } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_fid', userFid)
    .single();

  const { data: share } = await supabase
    .from('journal_shares')
    .select('id')
    .eq('id', shareId)
    .eq('user_fid', userFid)
    .single();

  if (!entry || !share) {
    return NextResponse.json({ error: 'Entry or share not found' }, { status: 404 });
  }

  let txHash: string;
  let status: string;

  try {
    // Use the token distributor for real token distribution
    const distributionResult = await tokenDistributor.distributeJournalClaim(
      userFid,
      normalizedAddress,
      entryId,
      shareId
    );

    if (distributionResult.success) {
      txHash = distributionResult.transactionHash || '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
      status = 'confirmed';
      console.log(`Successfully distributed ${distributionResult.amount} SOLAR tokens to ${normalizedAddress}`);
    } else {
      return NextResponse.json({ 
        error: distributionResult.error || 'Token distribution failed' 
      }, { status: 500 });
    }

    // Record claim in database
    const { error: insertError } = await supabase
      .from('token_claims')
      .insert({
        user_fid: userFid,
        amount: 10000,
        transaction_hash: txHash,
        trigger_entry_id: entryId,
        trigger_share_id: shareId,
        wallet_address: normalizedAddress,
        status: status
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Could not record claim', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      amount: 10000,
      status: status
    });

  } catch (error: any) {
    console.error('Token transfer error:', error);
    return NextResponse.json({ 
      error: 'Token transfer failed', 
      details: error.message 
    }, { status: 500 });
  }
}