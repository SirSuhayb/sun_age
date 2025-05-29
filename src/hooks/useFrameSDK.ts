import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-core/src/context";
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
    const initSDK = async () => {
      if (typeof window === "undefined") return;

      try {
        // Initialize SDK
        await sdk.actions.ready({ disableNativeGestures: true });
        setIsSDKLoaded(true);

        // Check frame context
        const frameContext = await sdk.context;
        if (frameContext) {
          setIsInFrame(true);
          setContext(frameContext);
          setIsFramePinned(frameContext.client.added);
        }

        // Set up frameSDK event listeners
        const frameSDK = (window as any).frameSDK;
        if (frameSDK) {
          frameSDK.on("frameAdded", () => setIsFramePinned(true));
          frameSDK.on("frameRemoved", () => setIsFramePinned(false));
        }

        // Only auto-connect if in a Farcaster frame
        if (frameContext && !isConnected && connectors.length > 0) {
          await connect({ connector: connectors[0] });
        }
      } catch (err) {
        console.error("Error initializing SDK:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initSDK();
  }, [isConnected, connect, connectors]);

  // Pin frame function
  const pinFrame = useCallback(async () => {
    if (!isSDKLoaded) return;

    try {
      setLoading(true);
      setError(null);

      // Use addMiniApp instead of addFrame (updated for latest SDK)
      await sdk.actions.addMiniApp();
      setIsFramePinned(true);

      // Send welcome notification if we have a user
      if (context?.user?.fid) {
        try {
          await fetch('/api/milestone-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: context.user.fid,
              type: 'welcome',
              message: `Welcome to Solara! You'll now receive milestone notifications as you journey around the sun.`,
              timestamp: new Date().toISOString()
            }),
          });
        } catch (err) {
          console.error("Error sending welcome notification:", err);
        }
      }
    } catch (err) {
      console.error("Error pinning frame:", err);
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('RejectedByUser')) {
          setError(new Error('You declined to add Solara to your apps.'));
        } else if (err.message.includes('InvalidDomainManifestJson')) {
          setError(new Error('Unable to add Solara: Invalid app configuration.'));
        } else {
          setError(err);
        }
      } else {
        setError(new Error('Failed to add Solara to your apps.'));
      }
    } finally {
      setLoading(false);
    }
  }, [isSDKLoaded, context]);

  return {
    isSDKLoaded,
    isInFrame,
    isFramePinned,
    context,
    pinFrame,
    loading,
    error,
    isConnected,
    address,
    sdk // Return the SDK instance for direct access
  };
}
