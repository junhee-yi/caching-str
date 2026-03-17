import {
  type DashboardData,
  type LiveStats,
  USER_IDS,
  type UserId,
  type UserProfile,
} from "@/lib/types";
import { browserStorage } from "@/lib/browserStorage";
import { dashboardByUser, usersById } from "@/lib/demoData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const currentUserKey = "demo-current-user";

export const getCurrentUserId = (): UserId => {
  const savedUserId = browserStorage.get(currentUserKey) as UserId | null;
  return savedUserId && savedUserId in usersById ? savedUserId : USER_IDS.Alex;
};

export const setCurrentUserId = (userId: UserId) => {
  browserStorage.set(currentUserKey, userId);
};

export const getUserOptions = () => Object.values(usersById);

export const fetchUserProfile = async (
  userId: UserId,
): Promise<UserProfile> => {
  await delay(300);
  return usersById[userId];
};

export const fetchDashboard = async (
  userId: string,
): Promise<DashboardData> => {
  await delay(450);
  return {
    ...dashboardByUser[userId],
    refreshedAt: new Date().toISOString(),
  };
};

export const fetchLiveStats = async (): Promise<LiveStats> => {
  await delay(700);
  return {
    activeUsers: 100 + Math.floor(Math.random() * 50),
    queueSize: 5 + Math.floor(Math.random() * 10),
    refreshedAt: new Date().toISOString(),
  };
};
