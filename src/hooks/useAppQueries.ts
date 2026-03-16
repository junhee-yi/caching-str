import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboard,
  fetchLiveStats,
  fetchServiceAccess,
  fetchUserProfile,
} from "@/lib/fakeServer";

import { queryKeys } from "@/lib/queryKeys";
import { useStableQuery } from "@/hooks/useStableQuery";
import type { ServiceType } from "@/lib/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
    queryFn: () => fetchServiceAccess(currentUserId, serviceId),
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
