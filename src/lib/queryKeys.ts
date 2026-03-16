export const queryKeys = {
  userProfile: (userId: string) => ["user", "profile", userId] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
  serviceAccess: (userId: string, serviceId: string) =>
    ["service-access", userId, serviceId] as const,
  liveStats: () => ["live-stats"] as const,
} as const;
