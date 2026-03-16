import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboard,
  fetchLiveStats,
  fetchServiceAccess,
  fetchUserProfile,
} from "@/lib/fakeServer";
import { queryKeys } from "@/lib/queryKeys";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ServiceType } from "@/lib/types";

export const useUserProfile = () => {
  return useStableQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: fetchUserProfile,
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
  return useQuery({
    queryKey: queryKeys.serviceAccess(serviceId),
    queryFn: () => fetchServiceAccess(serviceId),
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
