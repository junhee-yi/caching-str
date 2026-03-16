import { PERSIST_TYPE } from "@/lib/types";
import type { ReactNode } from "react";

interface QueryStateCardProps {
  title: string;
  persist: (typeof PERSIST_TYPE)[keyof typeof PERSIST_TYPE];
  children: ReactNode;
}

export function QueryStateCard({
  title,
  persist,
  children,
}: QueryStateCardProps) {
  const { persistType, cacheType } =
    persist === PERSIST_TYPE.YES
      ? { persistType: "Persist 대상", cacheType: "Boot Cache" }
      : {
          persistType: "Persist 제외",
          cacheType: "Runtime Only",
        };

  return (
    <section className="card" style={{ width: "100%" }}>
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p>{persistType}</p>
        </div>
        <span className={`badge badge-${persist}`}>{cacheType}</span>
      </div>
      {children}
    </section>
  );
}
