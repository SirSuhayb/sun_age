import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-core/context";
import { useAccount, useConnect } from 'wagmi';
// import { updateUserConsent } from "~/lib/consent";

export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isFramePinned, setIsFramePinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Initialize SDK and check frame context
  useEffect(() => {
    let mounted = true;

    const initializeSDK = async () => {
      try {
        console.log('[useFrameSDK] Initializing SDK...');
        await sdk.actions.ready({ disableNativeGestures: true });
        
        if (mounted) {
          setIsSDKLoaded(true);
          console.log('[useFrameSDK] SDK initialized successfully');
        }

        // Get frame context
        const frameContext = await sdk.context;
        console.log('[useFrameSDK] Frame context:', {
          hasContext: !!frameContext,
          hasUser: !!frameContext?.user,
          fid: frameContext?.user?.fid,
          username: frameContext?.user?.username,
          displayName: frameContext?.user?.displayName,
          contextDetails: frameContext
        });

        if (mounted && frameContext) {
          setContext(frameContext);
          setIsInFrame(true);
          setIsFramePinned(frameContext.client.added);
        }
      } catch (err) {
        console.error('[useFrameSDK] SDK initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    initializeSDK();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-sync user profile when context loads with user data
  useEffect(() => {
    if (context?.user?.fid && context.user.username) {
      const syncUserProfile = async () => {
        try {
          console.log('[useFrameSDK] Auto-syncing user profile for FID:', context.user.fid);
          const response = await fetch(`/api/sync-profiles?fid=${context.user.fid}`);
          const data = await response.json();
          
          if (data.status === 'success') {
            console.log('[useFrameSDK] Profile synced successfully:', data);
          } else if (data.status === 'success_fallback') {
            console.log('[useFrameSDK] Profile synced with fallback:', data);
          } else {
            console.error('[useFrameSDK] Profile sync failed:', data);
          }
        } catch (err) {
          console.error('[useFrameSDK] Error syncing user profile:', err);
        }
      };

      syncUserProfile();
    }
  }, [context?.user?.fid, context?.user?.username]);

  // Separate effect for wallet connection
  useEffect(() => {
    let mounted = true;

    const connectWallet = async () => {
      // Only auto-connect if we're in a frame and have a Farcaster connector
      const farcasterConnector = connectors.find(
        (c) => c.id === "farcaster" || c.name.toLowerCase().includes("frame")
      );
      
      console.log('[useFrameSDK] Wallet connection check:', {
        isSDKLoaded,
        isConnected,
        isInFrame,
        hasFarcasterConnector: !!farcasterConnector,
        connectorId: farcasterConnector?.id,
        connectorName: farcasterConnector?.name,
        availableConnectors: connectors.map(c => ({ id: c.id, name: c.name }))
      });
      
      if (!isSDKLoaded || isConnected || !isInFrame || !farcasterConnector) return;

      try {
        if (mounted) setLoading(true);
        if (mounted) setError(null);
        console.log('[useFrameSDK] Attempting to connect wallet...');
        await connect({ connector: farcasterConnector });
        console.log('[useFrameSDK] Wallet connected successfully');
      } catch (err) {
        console.error("Error connecting wallet:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    connectWallet();

    return () => {
      mounted = false;
    };
  }, [isSDKLoaded, isConnected, isInFrame, connect, connectors]);

  // Pin frame function
  const pinFrame = useCallback(async () => {
    try {
      console.log('[useFrameSDK] Attempting to pin frame...');
      await sdk.actions.ready({ disableNativeGestures: true });
      console.log('[useFrameSDK] Frame pinned successfully');
      setIsFramePinned(true);
    } catch (err) {
      console.error('[useFrameSDK] Error pinning frame:', err);
      throw err;
    }
  }, []);

  // Manual connection function
  const connectManually = useCallback(async () => {
    const farcasterConnector = connectors.find(
      (c) => c.id === "farcaster" || c.name.toLowerCase().includes("frame")
    );
    
    if (!farcasterConnector) {
      throw new Error('No Farcaster connector available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[useFrameSDK] Manual connection attempt...');
      await connect({ connector: farcasterConnector });
      console.log('[useFrameSDK] Manual connection successful');
    } catch (err) {
      console.error("Error in manual connection:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connect, connectors]);

  // Manual context refresh function
  const refreshContext = useCallback(async () => {
    try {
      console.log('[useFrameSDK] Manually refreshing context...');
      const frameContext = await sdk.context;
      console.log('[useFrameSDK] Refreshed context:', {
        hasContext: !!frameContext,
        hasUser: !!frameContext?.user,
        fid: frameContext?.user?.fid,
        contextDetails: frameContext
      });
      
      if (frameContext) {
        setContext(frameContext);
        setIsInFrame(true);
        setIsFramePinned(frameContext.client.added);
      }
      
      return frameContext;
    } catch (err) {
      console.error('[useFrameSDK] Error refreshing context:', err);
      throw err;
    }
  }, []);

  return {
    isSDKLoaded,
    isInFrame,
    isFramePinned,
    context,
    pinFrame,
    connectManually,
    refreshContext,
    loading,
    error,
    isConnected,
    address,
    sdk
  };
}
