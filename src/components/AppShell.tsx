"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { browserStorage } from "@/lib/browserStorage";
import type { UserId } from "@/lib/types";
import { dashboardByUser, usersById } from "@/lib/demoData";

const isActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
};

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUserId, setCurrentUser, users } = useCurrentUser();

  const handleLogout = () => {
    queryClient.clear();
    browserStorage.clear();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Single WebView + SPA Routing</p>
          <h2>React Query Persist 예시 프로젝트</h2>
          <p className="hero-copy">
            Route Handler를 truth로 두고, React Query는 runtime cache,
            browserStorage persist는 boot cache로만 활용하는 흐름을 화면에서
            바로 확인할 수 있습니다.
          </p>
          <div className="user-switcher">
            <label htmlFor="user-select">현재 유저</label>
            <select
              id="user-select"
              value={currentUserId}
              onChange={(event) => {
                queryClient.clear();
                setCurrentUser(event.target.value as UserId);
                router.refresh();
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.team})
                </option>
              ))}
            </select>
            <label htmlFor="user-select">접근 권한</label>
            <div>
              {dashboardByUser[currentUserId].notices.map((noti) => (
                <div>{noti}</div>
              ))}
            </div>
          </div>
        </div>
        <button className="ghost-button" onClick={handleLogout}>
          Logout / Cache Clear
        </button>
      </header>

      <nav className="tabs">
        <Link className={isActive(pathname, "/") ? "active" : ""} href="/">
          Dashboard
        </Link>
        <Link
          className={isActive(pathname, "/services/billing") ? "active" : ""}
          href="/services/billing"
        >
          Billing
        </Link>
        <Link
          className={isActive(pathname, "/services/support") ? "active" : ""}
          href="/services/support"
        >
          Support
        </Link>
        <Link
          className={isActive(pathname, "/services/admin") ? "active" : ""}
          href="/services/admin"
        >
          Admin
        </Link>
      </nav>

      <main className="content">{children}</main>

      <footer className="footer">
        <Link href="/">홈으로</Link>
        <span>foreground 복귀 시 refetchOnWindowFocus 동작</span>
      </footer>
    </div>
  );
};
