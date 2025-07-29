# Web User Identity System

This document describes the comprehensive web user identity system that establishes proper user identification when users visit the Solara app and ensures their Sol Age data is correctly linked to user accounts for journal migrations.

## Overview

The web user identity system addresses the need to establish user identity for non-Farcaster users from the moment they visit the site, ensuring seamless linkage between Sol Age calculations, bookmarking, and journal migrations.

## Key Components

### 1. useWebUserIdentity Hook (`src/hooks/useWebUserIdentity.ts`)

**Purpose**: Automatically detects and manages web user identity
**Features**:
- Generates anonymous ID (`anon_id`) on first visit
- Manages user account creation and linking
- Automatically extracts Sol Age data from existing bookmarks
- Handles account verification and data persistence

**Key Functions**:
```typescript
// Initialize web user (automatic on mount)
initializeWebUser()

// Create user account with Sol Age linking
createUserAccount(email: string, additionalData?: { sol_age?: number, archetype?: string })

// Link existing anon_id to user account
linkExistingData(userAccountId: string)

// Get full user account details
getUserAccount(): Promise<UserAccount | null>
```

### 2. Enhanced User Account API (`src/app/api/user-account/`)

**Main Endpoint**: `/api/user-account`
- **POST**: Creates user accounts with automatic Sol Age linking
- **GET**: Retrieves user account details

**Linking Endpoint**: `/api/user-account/link-anon`
- **POST**: Links existing `anon_id` to user accounts retroactively

### 3. Database Integration

**Enhanced Tables**:
- `user_accounts`: Stores email-based user accounts
- `user_identifiers`: Unified user identification mapping
- `user_notification_details`: Extended with `anon_id` and `user_account_id` linking

## User Flow Integration

### Web User Journey

1. **First Visit**
   ```
   User visits site → useWebUserIdentity initializes → anon_id generated
   ```

2. **Sol Age Calculation**
   ```
   User calculates Sol Age → Bookmark stored with anon_id → Data linked to anonymous identity
   ```

3. **Journal Creation**
   ```
   User creates journal entries → Stored locally → Ready for migration
   ```

4. **Account Creation & Migration**
   ```
   User wants to migrate → Creates account with email → Sol Age data automatically linked → Migration proceeds
   ```

### Identity States

| State | Anonymous ID | User Account | Sol Age Data | Migration Ready |
|-------|-------------|--------------|--------------|-----------------|
| New Visitor | ✓ Generated | ✗ | ✗ | ✗ |
| Calculated Sol Age | ✓ | ✗ | ✓ Linked | ✗ |
| Created Account | ✓ | ✓ Created | ✓ Auto-linked | ✓ |
| Post-Migration | ✓ | ✓ | ✓ | ✓ Complete |

## Technical Implementation

### Automatic Sol Age Linking

When a user creates an account, the system:

1. **Detects existing Sol Age data** from `localStorage` bookmark
2. **Extracts archetype** using `getSolarArchetype(birthDate)`
3. **Links `anon_id`** to the new user account
4. **Stores complete profile** with Sol Age and archetype

```typescript
// Automatic Sol Age extraction during account creation
const bookmarkData = localStorage.getItem('sunCycleBookmark');
if (bookmarkData) {
  const bookmark = JSON.parse(bookmarkData);
  solAge = bookmark.days;
  
  if (bookmark.birthDate) {
    const { getSolarArchetype } = await import('~/lib/solarIdentity');
    archetype = getSolarArchetype(bookmark.birthDate);
  }
}
```

### Database Linkage

The system maintains data integrity through:

```sql
-- Link anon_id to user account
UPDATE user_notification_details 
SET user_account_id = $1, linked_at = NOW() 
WHERE anon_id = $2;

-- Create unified user identification
INSERT INTO user_identifiers (unified_user_id, identifier_type, identifier_value)
VALUES ($1, 'account_id', $2);
```

### Enhanced Journal Component

The Journal component now:
- Uses `useWebUserIdentity()` for automatic user detection
- Shows appropriate UI based on user state
- Handles account creation with Sol Age linking
- Supports both Farcaster and web user migrations

## Integration Points

### SunCycleAge Component
- Continues using `anon_id` for bookmarking
- Web identity system tracks this automatically
- Data links to user accounts when created

### Bookmark API
- Enhanced to support user account linking
- Maintains backward compatibility
- Associates `anon_id` with user accounts

### Journal Migration API
- Accepts both `userFid` and `userAccountId`
- Uses unified user identification system
- Handles both user types seamlessly

## Security & Privacy

### Data Protection
- Anonymous IDs are locally generated UUIDs
- Email validation and uniqueness enforcement
- Secure linking prevents data leakage
- Row Level Security policies support both user types

### User Control
- Users control when to create accounts
- Anonymous browsing supported until account creation
- Clear data linkage and migration processes

## Development Features

### WebUserIdentityIndicator Component
For development and debugging:
```typescript
<WebUserIdentityIndicator />
```
Shows real-time user identity status:
- Anonymous ID status
- User account status
- Current identifiers

## Testing Strategy

### Manual Testing Flow

1. **New User Flow**:
   ```
   Visit site → Check anon_id generated → Calculate Sol Age → Create journal entries → Create account → Verify migration
   ```

2. **Existing User Flow**:
   ```
   Return to site → Verify anon_id persisted → Check Sol Age data → Test migration
   ```

3. **Account Linking**:
   ```
   Multiple sessions → Verify data consistency → Test account recovery
   ```

### Automated Tests

```typescript
// Test anon_id generation
expect(localStorage.getItem('sunCycleAnonId')).toBeTruthy();

// Test Sol Age linking
const account = await webIdentity.createUserAccount('test@example.com');
expect(account.sol_age).toBeDefined();

// Test migration readiness
expect(webIdentity.userAccountId).toBeTruthy();
```

## Configuration

### Environment Setup
No additional environment variables required.

### Database Setup
```bash
# Apply enhanced schema
psql -d your_database -f database/user_accounts_schema.sql
```

### Feature Flags
The system is designed to work alongside existing Farcaster functionality without feature flags.

## Migration Guide

### From Previous System
- Existing `anon_id` data is preserved
- Farcaster users continue working normally
- No data migration required

### New Installations
- Full system available immediately
- All user types supported from first deployment

## Future Enhancements

### Planned Features
1. **Profile Management**: Edit Sol Age and archetype data
2. **Account Recovery**: Email-based account recovery
3. **Multi-Device Sync**: Sync anon_id across devices
4. **Social Login**: OAuth integration for easier account creation

### Potential Improvements
1. **Offline Support**: Cache account data for offline use
2. **Progressive Enhancement**: Gradual account feature unlocking
3. **Analytics Integration**: Track user journey stages
4. **Backup System**: Automatic data backup for account users

## Troubleshooting

### Common Issues

**Anonymous ID not generated**:
- Check localStorage support
- Verify crypto.randomUUID() availability
- Check browser compatibility

**Sol Age data not linking**:
- Verify bookmark exists in localStorage
- Check anon_id consistency
- Verify API endpoint connectivity

**Migration not working**:
- Confirm user account creation
- Check userAccountId in local storage
- Verify API authentication

### Debug Tools

```typescript
// Check user identity state
console.log('Web Identity:', webIdentity);

// Verify Sol Age bookmark
console.log('Bookmark:', localStorage.getItem('sunCycleBookmark'));

// Check anon_id
console.log('Anon ID:', localStorage.getItem('sunCycleAnonId'));
```

## Performance Considerations

### Optimization Strategies
- Lazy loading of Sol Age calculation library
- Efficient localStorage usage
- Minimal API calls for identity verification
- Debounced account creation to prevent duplicates

### Monitoring
- Track identity initialization time
- Monitor account creation success rates
- Measure Sol Age linking accuracy
- Track migration completion rates

This system ensures that web users have a seamless experience from their first visit through Sol Age calculation to journal migration, with proper identity management and data linking throughout their journey.