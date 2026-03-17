import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, fetchLiveStats, fetchUserProfile } from "@/lib/fakeServer";

import { queryKeys } from "@/lib/queryKeys";
import { useStableQuery } from "@/hooks/useStableQuery";
import type { ServiceAccess, ServiceType } from "@/lib/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const fetchServiceAccessFromRouteHandler = async (
  userId: string,
  serviceId: ServiceType,
): Promise<ServiceAccess> => {
  if (!userId) {
    throw new Error("Missing userId before calling route handler");
  }

  const response = await fetch(
    `/api/services/${serviceId}/access?userId=${encodeURIComponent(userId)}`,
  );

  if (!response.ok) {
    const errorBody = (await response.json()) as { message?: string };
    throw new Error(
      errorBody.message ?? "Failed to validate service access on the server",
    );
  }

  return (await response.json()) as ServiceAccess;
};

export const useUserProfile = () => {
  const { currentUserId } = useCurrentUser();

  return useStableQuery({
    queryKey: queryKeys.userProfile(currentUserId),
    queryFn: () => fetchUserProfile(currentUserId),
  });
};

export const useDashboard = (userId?: string) => {
  return useStableQuery({
    queryKey: queryKeys.dashboard(userId ?? "guest"),
    queryFn: () => fetchDashboard(userId ?? "guest"),
    enabled: Boolean(userId),
  });
};

export const useServiceAccess = (serviceId: ServiceType) => {
  const { currentUserId } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.serviceAccess(currentUserId, serviceId),
    queryFn: () => fetchServiceAccessFromRouteHandler(currentUserId, serviceId),
    enabled: Boolean(currentUserId),
    staleTime: 1000 * 20,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: true,
    meta: {
      persist: false,
    },
  });
};

export const useLiveStats = () => {
  return useQuery({
    queryKey: queryKeys.liveStats(),
    queryFn: fetchLiveStats,
    staleTime: 0,
    refetchOnMount: true,
    meta: {
      persist: false,
    },
  });
};
