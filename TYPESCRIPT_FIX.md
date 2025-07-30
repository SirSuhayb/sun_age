# TypeScript Build Fix

## Issue
The build failed with a TypeScript error:
```
Type error: Argument of type 'number | null' is not assignable to parameter of type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
```

## Root Cause
The `getUnifiedUserIdForQuery` function expects optional parameters (`userFid?: number`, `userAccountId?: string`), which in TypeScript means they can be `undefined` but not `null`.

However, the variables were declared as:
```typescript
let userFid: number | null = null;
let userAccountId: string | null = null;
```

## Fix Applied
1. Changed variable declarations to use `undefined` instead of `null`:
```typescript
let userFid: number | undefined;
let userAccountId: string | undefined;
```

2. Added explicit conversion when calling the function:
```typescript
const userQuery = await getUnifiedUserIdForQuery(
  supabase, 
  userFid || undefined, 
  userAccountId || undefined
);
```

## Why This Works
- TypeScript distinguishes between `null` and `undefined`
- Optional parameters (`?`) expect `undefined`, not `null`
- The `|| undefined` conversion ensures we pass `undefined` instead of `null`
- This maintains backward compatibility while fixing the type error

## No Other Changes Needed
- The `useWebUserIdentity` hook correctly uses `null` for its internal state
- The Journal component properly handles both `null` and `undefined` values
- All other type definitions are consistent

The build should now succeed! 🚀