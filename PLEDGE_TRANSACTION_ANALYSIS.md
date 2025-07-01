# Pledge Transaction Issues Analysis

## Problem Summary

The pledging system has a critical routing issue that prevents users from successfully completing the ceremony flow when they navigate from the interstitial page through the "Make a sacred vow" option.

## Root Cause Analysis

### 1. Broken Flow Path
The current user journey when clicking "Make a sacred vow" from the interstitial:

```
Interstitial → "Make a sacred vow" → /soldash?tab=sol%20vows → "Make Your Solar Vow" → /ceremony (NO PARAMS)
```

### 2. Missing Required Parameters
The ceremony page (`src/app/ceremony/page.tsx`) expects three critical URL parameters:
- `days` - User's solar age in days
- `birthDate` - User's birth date  
- `approxYears` - Approximate years (calculated from days)

**Evidence in ceremony/page.tsx (lines 47-52):**
```typescript
useEffect(() => {
  if (!urlDays || !urlBirthDate) {
    alert('No calculation data found. Please calculate your Sol Age first.');
    router.push('/');
  }
}, [urlDays, urlBirthDate, router]);
```

### 3. Current Routing Issues

**Interstitial Page (lines 200-210):**
```typescript
onClick={() => {
  handleBookmark();
  router.push('/soldash?tab=sol%20vows');  // ❌ No params passed
}}
```

**SolDash "Make Your Solar Vow" Button (line 329):**
```typescript
onClick={() => window.location.href = '/ceremony'}  // ❌ No params passed
```

**Working Example from Results Page (lines 313-318):**
```typescript
router.push(`/ceremony?days=${targetDays}&birthDate=${targetBirthDate}&approxYears=${targetApproxYears}`);
```

## Impact

1. **Transaction Failures**: Users get redirected away from ceremony before they can pledge
2. **Lost User Journey**: Users lose their calculation data and have to start over
3. **Poor UX**: Alert popup with "No calculation data found" breaks the flow

## Bookmark System Analysis

While the ceremony page has fallback logic to use localStorage bookmark data, it **prioritizes URL parameters first**:

```typescript
// Always prioritize URL params, fallback to bookmark
const days = urlDays ? Number(urlDays) : bookmark?.days;
const birth = urlBirthDate || bookmark?.birthDate;
const approx = urlApproxYears ? Number(urlApproxYears) : bookmark?.approxYears;
```

The bookmark data exists but isn't used because the validation happens before the fallback logic.

## Recommended Solutions

### Option 1: Direct Ceremony Routing (Recommended)
Modify the interstitial "Make a sacred vow" button to route directly to ceremony with proper parameters.

**Change in `src/app/interstitial/page.tsx`:**
```typescript
onClick={() => {
  handleBookmark();
  if (days && birthDate && approxYears) {
    router.push(`/ceremony?days=${days}&birthDate=${birthDate}&approxYears=${approxYears}`);
  } else {
    router.push('/soldash?tab=sol%20vows');
  }
}}
```

### Option 2: Fix SolDash Routing
Update the soldash "Make Your Solar Vow" button to pass bookmark data as URL parameters.

**Change in `src/components/SunCycleAge.tsx`:**
```typescript
onClick={() => {
  const params = new URLSearchParams({
    days: bookmark.days.toString(),
    birthDate: bookmark.birthDate,
    approxYears: bookmark.approxYears.toString()
  });
  window.location.href = `/ceremony?${params.toString()}`;
}}
```

### Option 3: Improve Ceremony Fallback Logic
Modify ceremony page to check localStorage before showing the error.

## Files Requiring Changes

1. `src/app/interstitial/page.tsx` - Main routing fix
2. `src/components/SunCycleAge.tsx` - Secondary routing fix
3. `src/app/ceremony/page.tsx` - Optional fallback improvements

## Testing Requirements

After implementing fixes, test these flows:
1. Interstitial → "Make a sacred vow" → Ceremony completion
2. SolDash → "Make Your Solar Vow" → Ceremony completion  
3. Bookmark data persistence and fallback usage
4. Error handling when no data is available

## Priority: HIGH

This is blocking the core pledge functionality and should be fixed immediately to prevent user frustration and lost transactions.