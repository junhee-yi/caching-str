"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUserId,
  getUserOptions,
  setCurrentUserId,
} from "@/lib/fakeServer";
import type { UserId, UserProfile } from "@/lib/types";

type CurrentUserContextValue = {
  currentUserId: UserId;
  setCurrentUser: (userId: UserId) => void;
  users: UserProfile[];
};

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(
  null,
);

const USER_FALLBACK = getCurrentUserId();

export const CurrentUserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUserId, setCurrentUserIdState] =
    useState<UserId>(USER_FALLBACK);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCurrentUserIdState(getCurrentUserId());
    setIsHydrated(true);
  }, []);

  const users = getUserOptions();

  const setCurrentUser = (userId: UserId) => {
    setCurrentUserId(userId);
    setCurrentUserIdState(userId);
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <CurrentUserContext.Provider
      value={{ currentUserId, setCurrentUser, users }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
