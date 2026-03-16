"use client";

import { QueryStateCard } from "@/components/QueryStateCard";
import { useServiceAccess } from "@/hooks/useAppQueries";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { ServiceType } from "@/lib/types";

type ServicePageProps = {
  serviceId: ServiceType;
};

export function ServicePage({ serviceId }: ServicePageProps) {
  const { currentUserId } = useCurrentUser();
  const accessQuery = useServiceAccess(serviceId);

  return (
    <QueryStateCard title={`Service Access: ${serviceId}`} persist="no">
      <p className="caption">
        현재 유저는 {currentUserId}이며, persist된 값만으로 권한을 판단하지 않고
        route handler를 호출해 매번 검증합니다.
      </p>

      {accessQuery.isPending && <p>Checking access...</p>}

      {accessQuery.isSuccess && (
        <pre>{JSON.stringify(accessQuery.data, null, 2)}</pre>
      )}

      {accessQuery.isError && (
        <div className="error-box">
          <strong>접근 차단</strong>
          <p>{accessQuery.error.message}</p>
        </div>
      )}
    </QueryStateCard>
  );
}
