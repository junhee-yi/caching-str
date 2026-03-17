import { useStableQuery } from "@/hooks/useStableQuery";
import { browserStorage } from "@/lib/browserStorage";
import type { ServiceAccess, ServiceType, UserId } from "@/lib/types";

const BAD_ACCESS_STORAGE_KEY = "bad-service-access";

async function fetchAccessAndPersistBadly(
  userId: UserId,
  serviceId: ServiceType,
): Promise<ServiceAccess> {
  const response = await fetch(
    `/api/services/${serviceId}/access?userId=${encodeURIComponent(userId)}`,
  );

  if (!response.ok) {
    throw new Error("Route handler error");
  }

  const data = (await response.json()) as ServiceAccess;
  browserStorage.setJSON(`${BAD_ACCESS_STORAGE_KEY}:${serviceId}`, data);
  return data;
}

export function useBadServiceAccess(userId: UserId, serviceId: ServiceType) {
  const cachedAccess = browserStorage.getJSON<ServiceAccess>(
    `${BAD_ACCESS_STORAGE_KEY}:${serviceId}`,
  );

  return useStableQuery({
    queryKey: ["service-access", serviceId],
    queryFn: () =>
      cachedAccess ?? fetchAccessAndPersistBadly(userId, serviceId),
    meta: {
      persist: true,
    },
  });
}

// 왜 나쁜 예시인가?
// 1. query key에 userId가 없어 다른 유저의 권한 캐시가 섞일 수 있습니다.
// 2. 권한 데이터를 persist해서 이전 세션 결과를 계속 신뢰하게 됩니다.
// 3. route handler를 다시 호출하지 않으면 최신 권한 변경을 놓칠 수 있습니다.
