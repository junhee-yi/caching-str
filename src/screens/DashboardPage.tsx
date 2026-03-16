"use client";

import { QueryStateCard } from "@/components/QueryStateCard";
import {
  useDashboard,
  useLiveStats,
  useUserProfile,
} from "@/hooks/useAppQueries";
import { PERSIST_TYPE } from "@/lib/types";

export const DashboardPage = () => {
  const profileQuery = useUserProfile();
  const dashboardQuery = useDashboard(profileQuery.data?.id);
  const liveStatsQuery = useLiveStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20 }}>
        <QueryStateCard title="User Profile" persist={PERSIST_TYPE.YES}>
          {profileQuery.isPending ? (
            <p>Loading profile...</p>
          ) : (
            <pre>{JSON.stringify(profileQuery.data, null, 2)}</pre>
          )}
        </QueryStateCard>

        <QueryStateCard title="Dashboard" persist={PERSIST_TYPE.YES}>
          {dashboardQuery.isPending ? (
            <p>Loading dashboard...</p>
          ) : (
            <pre>{JSON.stringify(dashboardQuery.data, null, 2)}</pre>
          )}
        </QueryStateCard>
      </div>
      <QueryStateCard title="Live Stats" persist={PERSIST_TYPE.NO}>
        {liveStatsQuery.isPending ? (
          <p>Loading live stats...</p>
        ) : (
          <>
            <pre>{JSON.stringify(liveStatsQuery.data, null, 2)}</pre>
            <p className="caption">
              이 데이터는 staleTime 0 / persist false라서 앱 재진입 시 boot
              cache를 사용하지 않습니다.
            </p>
          </>
        )}
      </QueryStateCard>
    </div>
  );
};
