export const queryKeys = {
  userProfile: () => ["user", "profile"] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
  serviceAccess: (serviceId: string) => ["service-access", serviceId] as const,
  liveStats: () => ["live-stats"] as const,
} as const;
