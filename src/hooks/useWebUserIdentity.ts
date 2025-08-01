import { useState, useEffect, useCallback } from 'react';
import type { UserAccount } from '~/types/journal';

const WEB_USER_ID_KEY = 'solara_web_user_id';
const ANON_ID_KEY = 'sunCycleAnonId';

interface WebUserIdentity {
  userAccountId: string | null;
  anonId: string | null;
  isWebUser: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWebUserIdentity() {
  const [identity, setIdentity] = useState<WebUserIdentity>({
    userAccountId: null,
    anonId: null,
    isWebUser: false,
    isLoading: true,
    error: null
  });

  // Check if user is in a Farcaster frame
  const isInFrame = typeof window !== 'undefined' && window.parent !== window;

  // Initialize web user identity
  const initializeWebUser = useCallback(async () => {
    // Skip if in Farcaster frame
    if (isInFrame) {
      setIdentity(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setIdentity(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get existing anon_id (used for Sol Age bookmarking)
      let anonId = localStorage.getItem(ANON_ID_KEY);
      if (!anonId) {
        anonId = crypto.randomUUID();
        localStorage.setItem(ANON_ID_KEY, anonId);
        console.log('[WebUserIdentity] Generated new anon_id:', anonId);
      }

      // Check if we already have a user account ID
      let userAccountId = localStorage.getItem(WEB_USER_ID_KEY);

      if (userAccountId) {
        // Verify the account still exists
        try {
          const response = await fetch(`/api/user-account?accountId=${userAccountId}`);
          if (response.ok) {
            console.log('[WebUserIdentity] Found existing user account:', userAccountId);
            setIdentity({
              userAccountId,
              anonId,
              isWebUser: true,
              isLoading: false,
              error: null
            });
            return;
          } else {
            // Account doesn't exist anymore, clear it
            localStorage.removeItem(WEB_USER_ID_KEY);
            userAccountId = null;
          }
        } catch (err) {
          console.warn('[WebUserIdentity] Failed to verify existing account:', err);
          localStorage.removeItem(WEB_USER_ID_KEY);
          userAccountId = null;
        }
      }

      // Set initial state with anon_id
      setIdentity({
        userAccountId: null,
        anonId,
        isWebUser: true,
        isLoading: false,
        error: null
      });

    } catch (err) {
      console.error('[WebUserIdentity] Failed to initialize web user:', err);
      setIdentity(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize user identity'
      }));
    }
  }, [isInFrame]);

  // Create user account for web user
  const createUserAccount = useCallback(async (email: string, additionalData?: {
    sol_age?: number;
    archetype?: string;
  }) => {
    if (isInFrame) {
      throw new Error('Account creation not available in Farcaster frame');
    }

    setIdentity(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[WebUserIdentity] Creating user account for:', email);

      // Get Sol Age data from bookmark if available
      let solAge = additionalData?.sol_age;
      let archetype = additionalData?.archetype;

      // Try to get Sol Age from existing bookmark
      if (!solAge) {
        try {
          const bookmarkData = localStorage.getItem('sunCycleBookmark');
          if (bookmarkData) {
            const bookmark = JSON.parse(bookmarkData);
            solAge = bookmark.days;
            
            // Get archetype from Sol Age if we have birth date
            if (bookmark.birthDate && !archetype) {
              const { getSolarArchetype } = await import('~/lib/solarIdentity');
              archetype = getSolarArchetype(bookmark.birthDate);
            }
          }
        } catch (err) {
          console.warn('[WebUserIdentity] Failed to get Sol Age from bookmark:', err);
        }
      }

      const response = await fetch('/api/user-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          platform: 'web',
          sol_age: solAge,
          archetype,
          anon_id: identity.anonId // Include anon_id for linking
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const { account } = await response.json();
      console.log('[WebUserIdentity] User account created:', account);

      // Store user account ID
      localStorage.setItem(WEB_USER_ID_KEY, account.id);

      setIdentity(prev => ({
        ...prev,
        userAccountId: account.id,
        isLoading: false,
        error: null
      }));

      return account;

    } catch (err: any) {
      console.error('[WebUserIdentity] Account creation failed:', err);
      setIdentity(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to create account'
      }));
      throw err;
    }
  }, [isInFrame, identity.anonId]);

  // Link existing anon_id to a user account (for users who already calculated Sol Age)
  const linkExistingData = useCallback(async (userAccountId: string) => {
    try {
      console.log('[WebUserIdentity] Linking existing data to account:', userAccountId);
      
      // Update bookmark API to associate anon_id with user account
      if (identity.anonId) {
        await fetch('/api/user-account/link-anon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAccountId,
            anonId: identity.anonId
          })
        });
      }

      setIdentity(prev => ({
        ...prev,
        userAccountId
      }));

    } catch (err) {
      console.error('[WebUserIdentity] Failed to link existing data:', err);
      throw err;
    }
  }, [identity.anonId]);

  // Get user account details
  const getUserAccount = useCallback(async (): Promise<UserAccount | null> => {
    if (!identity.userAccountId) return null;

    try {
      const response = await fetch(`/api/user-account?accountId=${identity.userAccountId}`);
      if (!response.ok) return null;
      
      const { account } = await response.json();
      return account;
    } catch (err) {
      console.error('[WebUserIdentity] Failed to get user account:', err);
      return null;
    }
  }, [identity.userAccountId]);

  // Clear user identity (logout)
  const clearIdentity = useCallback(() => {
    localStorage.removeItem(WEB_USER_ID_KEY);
    setIdentity(prev => ({
      ...prev,
      userAccountId: null
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeWebUser();
  }, [initializeWebUser]);

  return {
    ...identity,
    createUserAccount,
    linkExistingData,
    getUserAccount,
    clearIdentity,
    refresh: initializeWebUser
  };
}