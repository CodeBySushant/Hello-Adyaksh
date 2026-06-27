"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { LanguageProvider } from "@/lib/language-context";
import { swrFetcher } from "@/lib/fetcher";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        // Don't hammer the API every time the tab regains focus.
        revalidateOnFocus: false,
        // Collapse duplicate requests for the same key within a minute.
        dedupingInterval: 60_000,
        // Retry transient failures with backoff instead of giving up.
        errorRetryCount: 3,
        errorRetryInterval: 3_000,
        // Keep showing the last good data while revalidating.
        keepPreviousData: true,
      }}
    >
      <LanguageProvider>{children}</LanguageProvider>
      {/* Mounts the toast portal so toast.success/error calls actually render. */}
      <Toaster richColors position="top-right" />
    </SWRConfig>
  );
}