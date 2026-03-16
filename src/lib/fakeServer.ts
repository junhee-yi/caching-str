import {
  KEYS,
  SERVICE_ACCESS_ROLE,
  ServiceType,
  type DashboardData,
  type LiveStats,
  type ServiceAccess,
  type UserProfile,
} from "@/lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const userProfile: UserProfile = {
  id: "user-01",
  name: "Junhee",
  team: "Platform FE",
};

const dashboardByUser: Record<string, DashboardData> = {
  "user-01": {
    notices: [
      "Single WebView 전환 완료",
      "Persist 대상 쿼리만 localStorage 저장",
      "권한 체크는 항상 Route Handler 기준",
    ],
    pendingTasks: 3,
    refreshedAt: new Date().toISOString(),
  },
};

const accessByService: Record<ServiceType, Omit<ServiceAccess, "checkedAt">> = {
  [KEYS.BILLING]: {
    serviceId: KEYS.BILLING,
    allowed: true,
    role: SERVICE_ACCESS_ROLE.EDITOR,
  },
  [KEYS.SUPPORT]: {
    serviceId: KEYS.SUPPORT,
    allowed: true,
    role: SERVICE_ACCESS_ROLE.VIEWR,
  },
  [KEYS.ADMIN]: {
    serviceId: KEYS.ADMIN,
    allowed: false,
    role: SERVICE_ACCESS_ROLE.VIEWR,
  },
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  await delay(300);
  return userProfile;
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

export const fetchServiceAccess = async (
  serviceId: ServiceType,
): Promise<ServiceAccess> => {
  await delay(400);

  const access = accessByService[serviceId];
  if (!access) {
    throw new Error(`Unknown service: ${serviceId}`);
  }

  if (!access.allowed) {
    throw new Error("403 Forbidden: route handler blocked the request");
  }

  return {
    ...access,
    checkedAt: new Date().toISOString(),
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
