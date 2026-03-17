import {
  KEYS,
  SERVICE_ACCESS_ROLE,
  USER_IDS,
  type DashboardData,
  type ServiceAccess,
  type ServiceType,
  type UserId,
  type UserProfile,
} from "@/lib/types";

export const usersById: Record<UserId, UserProfile> = {
  [USER_IDS.Alex]: {
    id: USER_IDS.Alex,
    name: "Alex",
    team: "Platform FE",
  },
  [USER_IDS.Buck]: {
    id: USER_IDS.Buck,
    name: "Buck",
    team: "Growth FE",
  },
  [USER_IDS.Jack]: {
    id: USER_IDS.Jack,
    name: "Jack",
    team: "Admin Ops",
  },
};

export const dashboardByUser: Record<string, DashboardData> = {
  [USER_IDS.Alex]: {
    notices: [
      "Single WebView 전환 완료",
      "Persist 대상 쿼리만 browserStorage 저장",
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

export const accessByUser: Record<
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

export const isUserId = (value: string): value is UserId => value in usersById;

export const isServiceType = (value: string): value is ServiceType =>
  (Object.values(KEYS) as string[]).includes(value);
