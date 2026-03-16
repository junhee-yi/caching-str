export type UserProfile = {
  id: string;
  name: string;
  team: string;
};

export type DashboardData = {
  notices: string[];
  pendingTasks: number;
  refreshedAt: string;
};

export const SERVICE_ACCESS_ROLE = {
  VIEWR: "viewer",
  EDITOR: "editor",
} as const;

export type ServiceAccess = {
  serviceId: string;
  allowed: boolean;
  role: (typeof SERVICE_ACCESS_ROLE)[keyof typeof SERVICE_ACCESS_ROLE];
  checkedAt: string;
};

export type LiveStats = {
  activeUsers: number;
  queueSize: number;
  refreshedAt: string;
};

export const PERSIST_TYPE = {
  YES: "yes",
  NO: "no",
} as const;

export const KEYS = {
  BILLING: "billing",
  SUPPORT: "support",
  ADMIN: "admin",
} as const;

export type ServiceType = (typeof KEYS)[keyof typeof KEYS];
