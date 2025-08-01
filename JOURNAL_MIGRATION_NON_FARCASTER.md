# Journal Migration for Non-Farcaster Users

This document describes the implementation of journal migration support for non-Farcaster users in the Solara application.

## Overview

Previously, journal migrations required a Farcaster user ID (userFid) to move local entries from browser storage to the database. This feature extends the system to support non-Farcaster users through a unified user identification system.

## Architecture

### Unified User Identification System

The new system uses two main approaches for user identification:

1. **Farcaster Users**: Continue using `userFid` for backward compatibility
2. **Non-Farcaster Users**: Use `userAccountId` with email-based account creation

### Database Schema

#### User Accounts Table
```sql
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) DEFAULT 'non_farcaster',
  farcaster_fid INTEGER NULL,
  platform VARCHAR(50) NOT NULL,
  sol_age INTEGER,
  archetype VARCHAR(100),
  wallet_address VARCHAR(42),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### User Identifiers Mapping
```sql
CREATE TABLE IF NOT EXISTS user_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID NOT NULL,
  identifier_type VARCHAR(20) NOT NULL,
  identifier_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(identifier_type, identifier_value)
);
```

### Database Functions

- `get_unified_user_id_from_fid(farcaster_fid)`: Get unified ID from Farcaster FID
- `get_unified_user_id_from_account(account_id)`: Get unified ID from account ID
- `create_user_account_with_unified_id()`: Create new user with unified identification

## API Changes

### Journal Entries API (`/api/journal/entries`)

**GET Request**: Now accepts either `userFid` or `userAccountId` parameters
```
GET /api/journal/entries?userFid=123
GET /api/journal/entries?userAccountId=uuid-string
```

**POST Request**: Request body now supports both user identification methods
```json
{
  "content": "Journal entry content",
  "sol_day": 1,
  "userFid": 123,           // For Farcaster users
  "userAccountId": "uuid",  // For non-Farcaster users
  "parent_entry_id": "optional",
  "parent_share_id": "optional"
}
```

### New User Account API (`/api/user-account`)

**POST**: Create new user account
```json
{
  "email": "user@example.com",
  "platform": "web",
  "sol_age": 123,
  "archetype": "optional"
}
```

**GET**: Retrieve user account
```
GET /api/user-account?email=user@example.com
GET /api/user-account?accountId=uuid-string
```

## Frontend Changes

### useJournal Hook

All hook functions now accept both user identification methods:

```typescript
// Migration
migrateLocalEntries(userFid?: number, userAccountId?: string)

// Entry operations
createEntry(data: CreateJournalEntryRequest, userFid?: number, userAccountId?: string)
updateEntry(id: string, data: UpdateJournalEntryRequest, userFid?: number, userAccountId?: string)
deleteEntry(id: string, userFid?: number, userAccountId?: string)
loadEntries(filters?: JournalFilters, userFid?: number, userAccountId?: string)
```

### Journal Component

**New State Variables**:
- `userAccountId`: Stores the account ID for non-Farcaster users
- `showAccountCreation`: Controls account creation modal visibility
- `userEmail`: Stores email input for account creation

**New Functions**:
- `handleCreateUserAccount()`: Creates user account and triggers migration

**UI Updates**:
- Account creation modal for non-Farcaster users
- Updated migration UI to support both user types
- Enhanced error messages and user guidance

## User Flows

### Farcaster Users (Existing Flow)
1. User creates journal entries locally
2. User connects via Farcaster
3. Migration UI appears with "MIGRATE" button
4. Entries are migrated using `userFid`

### Non-Farcaster Users (New Flow)
1. User creates journal entries locally
2. User sees migration prompt with "CREATE ACCOUNT" button
3. User clicks "CREATE ACCOUNT" and enters email
4. System creates user account with unified ID
5. Entries are migrated using `userAccountId`
6. User can continue using the account for future entries

## Technical Implementation Details

### User Identification Resolution

The system uses a helper function to resolve user identification:

```typescript
async function getUnifiedUserIdForQuery(
  supabase: any, 
  userFid?: number, 
  userAccountId?: string
): Promise<{ userFid: number, unifiedUserId?: string }>
```

- For Farcaster users: Uses existing `userFid`, tries to get unified ID
- For non-Farcaster users: Uses `userAccountId` to get unified ID, sets `userFid` to 0

### Data Migration Strategy

- Existing Farcaster user data remains unchanged
- Non-Farcaster users get `user_fid: 0` in journal entries
- Unified ID system allows future consolidation if users link accounts

### Security Considerations

- Row Level Security (RLS) policies support both user types
- Service role client used for API operations
- Email validation and uniqueness enforcement
- Proper error handling for account creation edge cases

## Testing

To test the implementation:

1. **Farcaster User Flow**:
   - Create local entries in Farcaster frame
   - Verify migration works with existing userFid

2. **Non-Farcaster User Flow**:
   - Create local entries outside Farcaster frame
   - Click "CREATE ACCOUNT" button
   - Enter email and verify account creation
   - Verify entries are migrated successfully

3. **API Testing**:
   - Test user account creation endpoint
   - Test journal entries API with both user types
   - Verify database functions work correctly

## Future Enhancements

1. **Account Linking**: Allow Farcaster users to link email accounts
2. **Social Login**: Support additional authentication providers
3. **Wallet Integration**: Add wallet-based authentication for non-Farcaster users
4. **Account Recovery**: Implement email-based account recovery
5. **Profile Management**: Allow users to update account details

## Migration Guide

### Database Setup

1. Run the user accounts schema:
```bash
psql -d your_database -f database/user_accounts_schema.sql
```

2. Verify tables are created:
```sql
\dt user_accounts
\dt user_identifiers
```

### Environment Variables

No additional environment variables are required for basic functionality.

### Deployment

The implementation is backward compatible and doesn't require data migration for existing users. New functionality will be available immediately after deployment.