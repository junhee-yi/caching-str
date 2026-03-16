"use client";

import { useState, type PropsWithChildren } from "react";
import {
  PersistQueryClientProvider,
  type Persister,
} from "@tanstack/react-query-persist-client";
import { QueryClient, type Query } from "@tanstack/react-query";
import { CurrentUserProvider } from "@/providers/CurrentUserProvider";

const PERSIST_KEY = "RQ_PERSIST_CACHE";
const BUSTER = "build-2026-03";

function createLocalStoragePersister(): Persister {
  return {
    persistClient: async (client) => {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(client));
    },
    restoreClient: async () => {
      const cached = localStorage.getItem(PERSIST_KEY);
      return cached ? JSON.parse(cached) : undefined;
    },
    removeClient: async () => {
      localStorage.removeItem(PERSIST_KEY);
    },
  };
}

function shouldPersistQuery(query: Query) {
  const persistFlag = query.meta?.persist;

  if (persistFlag === true) return !query.isDisabled();

  if (persistFlag === false) return false;

  return false;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: "always",
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
        },
      }),
  );

  const [persister] = useState(() => createLocalStoragePersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        buster: BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <CurrentUserProvider>{children}</CurrentUserProvider>
    </PersistQueryClientProvider>
  );
}
