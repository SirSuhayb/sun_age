"use client";

import { Suspense } from "react";
import WagmiProvider from "~/components/providers/WagmiProvider";
// import { useEffect, useState } from "react";
// import posthog from "posthog-js";
// import { PostHogProvider as PHProvider } from "posthog-js/react";
// import { getUUID } from "~/lib/utils";

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
        <WagmiProvider>
            {/* <PostHogProvider> */}
                {children}
            {/* </PostHogProvider> */}
        </WagmiProvider>
    </Suspense>
  );
}
