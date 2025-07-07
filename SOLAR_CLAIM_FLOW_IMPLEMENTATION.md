# $SOLAR Claim Flow Implementation Guide

## Overview

This document outlines the implementation of the $SOLAR token claim flow for users sharing their Sol Age. The system supports both Farcaster native users and non-Farcaster users sharing to other platforms.

## Architecture

### Key Components

1. **ShareSelectionModal** (`src/components/ShareSelectionModal.tsx`)
   - Allows users to choose sharing platforms (Farcaster, Twitter, LinkedIn, Copy)
   - Generates unique share IDs for tracking
   - Stores share data locally for claim verification

2. **SolAgeClaimModal** (`src/components/SolAgeClaimModal.tsx`)
   - Handles the claim process for Sol Age shares
   - Supports both wallet connection and account creation
   - Includes Privy integration for non-Farcaster users

3. **SunMenu** (`src/components/SunMenu.tsx`)
   - Dropdown menu from the Sun ☀️ icon in header
   - Shows wallet connection status and token balance
   - Displays pending claims and allows claiming

4. **API Routes**
   - `/api/solage/claim` - Handles claim requests
   - `/api/tokens/balance` - Fetches user's $SOLAR token balance

## User Flows

### Flow 1: Farcaster Native Users

1. User calculates their Sol Age in the app
2. User clicks "Share Sol Age" button
3. ShareSelectionModal opens with platform options
4. User selects "Farcaster" 
5. System uses existing Farcaster sharing logic
6. Tokens are automatically queued for their Farcaster wallet
7. User can view balance in Sun Menu

### Flow 2: Non-Farcaster Users

1. User calculates their Sol Age in the app
2. User clicks "Share Sol Age" button
3. ShareSelectionModal opens with platform options
4. User selects Twitter/LinkedIn/Copy
5. Share data is stored locally with unique ID
6. User shares content on chosen platform
7. User returns to app and clicks Sun ☀️ icon
8. Sun Menu shows pending claim notification
9. User clicks "Claim Now"
10. SolAgeClaimModal opens
11. User can either:
    - Connect existing wallet
    - Create new account with email (Privy integration)
12. Tokens are queued for distribution

## Integration Instructions

### 1. Install Dependencies

```bash
npm install @privy-io/react-auth
```

### 2. Update Existing Components

#### SunCycleAge Component Integration

Add the share selection modal to your existing SunCycleAge component:

```tsx
import { ShareSelectionModal } from './ShareSelectionModal';
import { SolAgeClaimModal } from './SolAgeClaimModal';

// In your component state
const [showShareModal, setShowShareModal] = useState(false);
const [showClaimModal, setShowClaimModal] = useState(false);

// Replace existing share button with:
<button
  onClick={() => setShowShareModal(true)}
  className="your-existing-classes"
>
  SHARE SOL AGE
</button>

// Add modals to your JSX
<ShareSelectionModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  solAge={days}
  archetype={archetype}
  quote={quote}
  userName={userName}
  profilePicUrl={profilePicUrl}
  onShareComplete={(platform, shareId) => {
    console.log('Share completed:', platform, shareId);
  }}
/>

<SolAgeClaimModal
  isOpen={showClaimModal}
  onClose={() => setShowClaimModal(false)}
  solAge={days}
  archetype={archetype}
  claimAmount={1000}
/>
```

### 3. Update Header Component

The header has been updated to include the Sun menu. The Sun ☀️ icon now:
- Shows swap functionality for Farcaster mini app users
- Shows wallet menu for web users

### 4. Database Schema

You'll need to create database tables for:

```sql
-- Claims table
CREATE TABLE sol_age_claims (
  id VARCHAR(255) PRIMARY KEY,
  share_id VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  sol_age INTEGER NOT NULL,
  archetype VARCHAR(100),
  wallet_address VARCHAR(42),
  email VARCHAR(255),
  claim_amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  claim_type VARCHAR(20) DEFAULT 'solage_share',
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User accounts table (for non-Farcaster users)
CREATE TABLE user_accounts (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  sol_age INTEGER,
  archetype VARCHAR(100),
  wallet_address VARCHAR(42),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Token distributions table
CREATE TABLE token_distributions (
  id VARCHAR(255) PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  amount INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  claim_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'queued',
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL
);
```

### 5. Environment Variables

Add these to your `.env` file:

```env
# Token contract addresses
NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_BASE_NETWORK_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Privy configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Database
DATABASE_URL=your_database_url

# Token distribution
ADMIN_WALLET_PRIVATE_KEY=your_admin_wallet_private_key
```

### 6. Privy Integration

Update your app providers to include Privy:

```tsx
// src/app/providers.tsx
import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#d4af37',
        },
      }}
    >
      <Suspense fallback={null}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </Suspense>
    </PrivyProvider>
  );
}
```

### 7. Token Distribution System

Create a background job to process token distributions:

```typescript
// scripts/process-token-distributions.ts
import { ethers } from 'ethers';

async function processTokenDistributions() {
  // 1. Query pending distributions from database
  // 2. Batch process distributions
  // 3. Send tokens using admin wallet
  // 4. Update distribution status
  // 5. Handle failures and retries
}
```

## Claim Amount Configuration

Current configuration:
- **Sol Age Share**: 1,000 $SOLAR tokens
- **Maximum claim per share**: 5,000 $SOLAR tokens
- **Claim window**: 30 minutes after sharing

## Security Considerations

1. **Share verification**: Claims are validated against stored share data
2. **Duplicate prevention**: Share IDs are unique and checked for existing claims
3. **Rate limiting**: Implement rate limiting on claim endpoints
4. **Wallet validation**: Validate wallet addresses before processing
5. **Email verification**: Consider email verification for account creation

## Testing

1. Test both Farcaster and non-Farcaster user flows
2. Verify claim data is stored correctly
3. Test wallet connections and balance fetching
4. Verify token distribution process
5. Test error handling and edge cases

## Future Enhancements

1. **Referral system**: Award extra tokens for referrals
2. **Milestone rewards**: Bonus tokens for sharing milestones
3. **Social verification**: Verify that content was actually shared
4. **Cross-platform tracking**: Track shares across multiple platforms
5. **Staking mechanism**: Allow users to stake $SOLAR for additional rewards

## Troubleshooting

### Common Issues

1. **Wallet connection fails**: Check wagmi and provider configuration
2. **Claims not processing**: Verify database connectivity and schema
3. **Token balance not showing**: Check token contract address and RPC endpoint
4. **Privy integration issues**: Verify app ID and configuration

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API routes are responding correctly
3. Check database for claim records
4. Verify token contract interactions
5. Test with different wallet types

## API Documentation

### POST /api/solage/claim

Claims $SOLAR tokens for sharing Sol Age.

**Request Body:**
```json
{
  "solAge": 9847,
  "archetype": "Solar Mystic",
  "platform": "twitter",
  "shareId": "solage_1234567890_abc123",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4007b5C5b5c8B84",
  "email": "user@example.com",
  "claimAmount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "claimId": "claim_1234567890",
  "message": "Claim successful! Tokens will be distributed to your wallet."
}
```

### GET /api/tokens/balance

Fetches $SOLAR token balance for a wallet address.

**Query Parameters:**
- `address`: Wallet address (required)

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b8D4007b5C5b5c8B84",
  "balance": 1500,
  "symbol": "SOLAR",
  "decimals": 18
}
```

## Deployment Checklist

- [ ] Install required dependencies
- [ ] Update environment variables
- [ ] Set up database tables
- [ ] Configure Privy integration
- [ ] Update existing components
- [ ] Test all user flows
- [ ] Set up token distribution system
- [ ] Configure monitoring and alerts
- [ ] Deploy to production
- [ ] Monitor for issues

This implementation provides a solid foundation for the $SOLAR claim flow that can be extended with additional features and improvements over time.