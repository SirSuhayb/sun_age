# 🏦 Treasury Setup Guide for $SOLAR Token Distribution

## Overview

This guide explains how to properly configure the treasury system for $SOLAR token distributions in the Solara application.

## Current Architecture

### Token Distribution Flow
```
Treasury Wallet (Holds SOLAR) → Admin Wallet (Approved Spender) → User Wallets
```

### Key Components
1. **Treasury Address**: `NEXT_PUBLIC_TREASURY_ADDRESS` - Holds the main SOLAR token supply
2. **Admin Wallet**: `ADMIN_WALLET_PRIVATE_KEY` - Authorized to distribute tokens from treasury
3. **SOLAR Token Contract**: ERC-20 token contract with standard transfer functions

## 🔧 Setup Instructions

### 1. Treasury Wallet Configuration

The treasury address is defined in your environment:
```bash
NEXT_PUBLIC_TREASURY_ADDRESS=0x9EeF19328828d918693Befe278dD052799B6A7AF
```

This wallet should:
- Hold the main supply of SOLAR tokens
- Be a secure multi-sig wallet in production
- Grant approval to the admin wallet for token distributions

### 2. Admin Wallet Setup

Generate an admin wallet for token distributions:

```bash
# Generate admin wallet
node scripts/create-admin-wallet.js

# Set up environment
node scripts/setup-env.js

# Test configuration
node scripts/test-admin-wallet.js
```

### 3. Treasury Approval Setup

**CRITICAL**: The treasury must approve the admin wallet to spend SOLAR tokens.

You can do this via:

#### Option A: Etherscan/Block Explorer
1. Go to the SOLAR token contract on Base Etherscan
2. Connect the treasury wallet
3. Call `approve(adminWalletAddress, amount)` where:
   - `adminWalletAddress` = your admin wallet address
   - `amount` = maximum tokens to allow (e.g., `1000000000000000000000000` for 1M SOLAR)

#### Option B: Script (Recommended)
Create a setup script:

```javascript
// scripts/setup-treasury-approval.js
const { ethers } = require('ethers');

async function setupTreasuryApproval() {
  const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY; // You need this
  const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
  const solarTokenAddress = process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS;
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const treasuryWallet = new ethers.Wallet(treasuryPrivateKey, provider);
  
  const solarContract = new ethers.Contract(
    solarTokenAddress,
    ['function approve(address spender, uint256 amount) returns (bool)'],
    treasuryWallet
  );
  
  // Approve admin wallet to spend 1M SOLAR tokens
  const approveAmount = ethers.parseUnits('1000000', 18);
  const tx = await solarContract.approve(adminWalletAddress, approveAmount);
  await tx.wait();
  
  console.log(`✅ Treasury approved admin wallet. TX: ${tx.hash}`);
}

setupTreasuryApproval().catch(console.error);
```

## 🚨 Critical Issues Fixed

### 1. Treasury Transaction Routing
**Issue**: Admin wallet was sending tokens from its own balance instead of treasury.

**Fix**: Updated `tokenDistributor.ts` to use `transferFrom(treasury, recipient, amount)` instead of `transfer(recipient, amount)`.

### 2. Wallet Connection for Web Users
**Issue**: Wallet connection was defaulting to Farcaster frame connector for web users.

**Fix**: Updated connector selection to prefer injected wallets (MetaMask, etc.) for web users:
- ✅ SunMenu component
- ✅ Surprise-me oracle tooltip

### 3. Balance Checking
**Issue**: System was checking admin wallet balance instead of treasury balance.

**Fix**: Added `getTreasuryBalance()` method and updated distribution logic.

## 📍 Token Award Areas Identified

The app awards $SOLAR tokens in these areas:

1. **Roll Earnings** (`/api/tokens/roll-earnings`)
   - Awards SOLAR for oracle rolls based on rarity
   - Amount varies by rarity level

2. **Journal Claims** (`/api/journal/claim`) 
   - Awards 10,000 SOLAR for journal sharing
   - One-time claim per user

3. **Sol Age Claims** (`/api/solage/claim`)
   - Awards 1,000 SOLAR for sol age sharing
   - One-time claim per share

4. **Guidance Completion** (`/surprise-me/guidance/[id]`)
   - Awards SOLAR for completing guidance based on rarity
   - Integrated with roll earnings system

5. **SOLAR Payments** (`/api/payments/solar`)
   - Processes SOLAR payments TO treasury (receives)
   - Used for purchasing additional rolls

## 🔍 Verification Steps

### Check Treasury Balance
```bash
node scripts/test-admin-wallet.js
```

### Test Token Distribution
1. Ensure treasury has SOLAR tokens
2. Ensure admin wallet has approval from treasury
3. Test distribution via any of the award endpoints
4. Verify tokens appear in recipient wallet
5. Check transaction hash on block explorer

### Monitor Distribution Logs
Look for these log messages:
```
[TokenDistributor] Treasury balance: X SOLAR
Successfully distributed X SOLAR from treasury to 0x...
Transaction hash: 0x...
```

## 🛡️ Security Best Practices

1. **Treasury Wallet**:
   - Use a multi-sig wallet in production
   - Regularly monitor balance and approvals
   - Set reasonable approval limits

2. **Admin Wallet**:
   - Keep private key secure
   - Rotate periodically
   - Monitor transaction activity

3. **Environment Variables**:
   - Never commit private keys to version control
   - Use secure secret management in production
   - Regularly audit access

## 🔄 Operational Procedures

### Daily Monitoring
- Check treasury balance
- Monitor distribution success rates
- Review transaction logs

### Weekly Tasks
- Audit admin wallet activity
- Check approval balances
- Update documentation if needed

### Monthly Tasks
- Consider rotating admin wallet
- Review security practices
- Plan for scaling if needed

## 🆘 Troubleshooting

### "Insufficient tokens in treasury"
- Check treasury SOLAR balance
- Ensure tokens are available for distribution

### "Transfer amount exceeds allowance"
- Treasury needs to approve admin wallet for more tokens
- Check current allowance with `allowance(treasury, admin)`

### "Failed to connect wallet"
- Ensure user has a compatible wallet installed
- Check connector configuration in WagmiProvider

### Distribution not working
1. Verify environment variables are set
2. Check admin wallet has proper approvals
3. Ensure RPC endpoint is working
4. Review logs for specific error messages

## 📞 Support

For issues with this setup:
1. Check the logs in the console
2. Verify all environment variables are properly set
3. Test each component individually
4. Review the troubleshooting section above