"use client";

import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";
// import posthog from "posthog-js";
// import { PostHogProvider as PHProvider } from "posthog-js/react";
// import { getUUID } from "~/lib/utils";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { AuthKitProvider } from '@farcaster/auth-kit';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

// export function PostHogProvider({ children }: { children: React.ReactNode }) {
//   useEffect(() => {
//     if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

//     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//       api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
//       persistence: "memory",
//       person_profiles: "identified_only",
//       loaded: (ph) => {
//         // Generate anonymous session ID without identifying
//         const sessionId = ph.get_distinct_id() || getUUID();
//         ph.register({ session_id: sessionId });

//         // Temporary distinct ID that will be aliased later
//         if (!ph.get_distinct_id()) {
//           ph.reset(true); // Ensure clean state
//         }
//       },
//     });
//   }, []);

//   return <PHProvider client={posthog}>{children}</PHProvider>;
// }

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthKitProvider
      config={{
        // TODO: Fill in with your actual values:
        rpcUrl: "https://mainnet.optimism.io", // or your preferred chain
        // clientId: "YOUR_CLIENT_ID", // If using OAuth
        // redirectUri: "YOUR_REDIRECT_URI", // If using OAuth
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {/* <PostHogProvider> */}
            {children}
          {/* </PostHogProvider> */}
        </QueryClientProvider>
      </WagmiProvider>
    </AuthKitProvider>
  );
}
