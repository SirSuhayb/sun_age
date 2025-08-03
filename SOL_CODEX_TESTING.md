# Sol Codex Testing Guide

## Testing Payment Override

You can bypass payment requirements for testing using these methods:

### Method 1: URL Parameter
Add `?test_access=true` to any Sol Codex page URL:
```
/soldash/you/expand/details?test_access=true
```

### Method 2: Browser Console
Open browser console and run:
```javascript
// Enable test access
localStorage.setItem('solCodexTestAccess', 'true');
window.location.reload();

// Disable test access
localStorage.removeItem('solCodexTestAccess');
window.location.reload();
```

### Method 3: Using Helper Functions
In the browser console:
```javascript
// Import and use helpers (if available in global scope)
import { enableTestAccess, disableTestAccess } from '~/lib/subscription';

enableTestAccess();  // Enables test access and reloads
disableTestAccess(); // Disables test access and reloads
```

## Daimo Payment Notes

- **Minimum Payment**: Daimo requires a $10 USD minimum
- **Monthly Plan**: When paying monthly with crypto, users are charged $10 (they get $2.23 credit)
- **Yearly Plan**: $77 works fine with Daimo

## Clear All Data
To reset everything:
```javascript
localStorage.removeItem('solCodexSubscription');
localStorage.removeItem('solCodexSolarAccess');
localStorage.removeItem('solCodexTestAccess');
localStorage.removeItem('chartData');
localStorage.removeItem('birthData');
```

## Wallet Connection Issues
If the "Connect Wallet" button doesn't work:
- The connector will try to find a ready wallet connector
- If no connectors are available, it will open Uniswap to swap for SOLAR

## SOLAR Token Info
- **Required Amount**: 500M SOLAR tokens
- **Current Value**: ~$183 USD
- **Swap Link**: [Uniswap SOLAR/USDC](https://app.uniswap.org/swap?outputCurrency=0x746042147240304098C837563aAEc0F671881B07&chain=base)
- Users with some SOLAR but not enough will see their balance and a swap link

## Test Flow
1. Go to `/soldash/you`
2. Click "Unlock Sol Codex"
3. Fill in birth data
4. View free chart
5. Add `?test_access=true` to URL or use console method
6. Click "Unlock Sol Codex Pro" - should go directly to advanced analysis