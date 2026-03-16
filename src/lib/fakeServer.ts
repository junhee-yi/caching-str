import {
  KEYS,
  SERVICE_ACCESS_ROLE,
  type DashboardData,
  type LiveStats,
  type ServiceAccess,
  USER_IDS,
  type ServiceType,
  type UserId,
  type UserProfile,
} from "@/lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const currentUserKey = "demo-current-user";

const usersById: Record<UserId, UserProfile> = {
  [USER_IDS.Alex]: {
    id: USER_IDS.Alex,
    name: USER_IDS.Alex,
    team: "Platform FE",
  },
  [USER_IDS.Buck]: {
    id: USER_IDS.Buck,
    name: USER_IDS.Buck,
    team: "Growth FE",
  },
  [USER_IDS.Jack]: {
    id: USER_IDS.Jack,
    name: USER_IDS.Jack,
    team: "Admin Ops",
  },
};

const dashboardByUser: Record<string, DashboardData> = {
  [USER_IDS.Alex]: {
    notices: [
      "Single WebView 전환 완료",
      "Persist 대상 쿼리만 localStorage 저장",
      "권한 체크는 항상 Route Handler 기준",
    ],
    pendingTasks: 3,
    refreshedAt: new Date().toISOString(),
  },
  [USER_IDS.Buck]: {
    notices: [
      "Growth 캠페인 대시보드 점검",
      "Support 서비스 접근 가능",
      "Admin 서비스는 권한 없음",
    ],
    pendingTasks: 5,
    refreshedAt: new Date().toISOString(),
  },
  [USER_IDS.Jack]: {
    notices: [
      "Admin 운영 배치 확인 필요",
      "전 서비스 접근 가능",
      "권한 변경 후 invalidate 시나리오 점검",
    ],
    pendingTasks: 1,
    refreshedAt: new Date().toISOString(),
  },
};

const accessByUser: Record<
  UserId,
  Record<ServiceType, Omit<ServiceAccess, "checkedAt">>
> = {
  [USER_IDS.Alex]: {
    [KEYS.BILLING]: {
      serviceId: KEYS.BILLING,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.EDITOR,
    },
    [KEYS.SUPPORT]: {
      serviceId: KEYS.SUPPORT,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.VIEWER,
    },
    [KEYS.ADMIN]: {
      serviceId: KEYS.ADMIN,
      allowed: false,
      role: SERVICE_ACCESS_ROLE.VIEWER,
    },
  },
  [USER_IDS.Buck]: {
    [KEYS.BILLING]: {
      serviceId: KEYS.BILLING,
      allowed: false,
      role: SERVICE_ACCESS_ROLE.VIEWER,
    },
    [KEYS.SUPPORT]: {
      serviceId: KEYS.SUPPORT,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.EDITOR,
    },
    [KEYS.ADMIN]: {
      serviceId: KEYS.ADMIN,
      allowed: false,
      role: SERVICE_ACCESS_ROLE.VIEWER,
    },
  },
  [USER_IDS.Jack]: {
    [KEYS.BILLING]: {
      serviceId: KEYS.BILLING,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.EDITOR,
    },
    [KEYS.SUPPORT]: {
      serviceId: KEYS.SUPPORT,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.EDITOR,
    },
    [KEYS.ADMIN]: {
      serviceId: KEYS.ADMIN,
      allowed: true,
      role: SERVICE_ACCESS_ROLE.EDITOR,
    },
  },
};

export const getCurrentUserId = (): UserId => {
  if (typeof window === "undefined") {
    return USER_IDS.Alex;
  }

  const savedUserId = localStorage.getItem(currentUserKey) as UserId | null;
  return savedUserId && savedUserId in usersById ? savedUserId : USER_IDS.Alex;
};

export const setCurrentUserId = (userId: UserId) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(currentUserKey, userId);
  }
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

export const fetchServiceAccess = async (
  userId: UserId,
  serviceId: ServiceType,
): Promise<ServiceAccess> => {
  await delay(400);

  const access = accessByUser[userId]?.[serviceId];
  if (!access) {
    throw new Error(`Unknown service: ${serviceId}`);
  }

  if (!access.allowed) {
    throw new Error(
      `403 Forbidden: ${usersById[userId].name} has no access to ${serviceId}`,
    );
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
