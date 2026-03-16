# 서비스 상태 공유 전략

**Single WebView 구조 전환에 따른 React Query + Persist 캐싱 전략**  
**작성일**: 2026년 3월  
**대상**: 프론트엔드 개발자 (경력 5년 이상, React Query Persist 경험 없음)  
**목적**: Single WebView + SPA Routing 환경에서 **안전하고 빠른** 상태 공유 및 캐싱 전략 정의

---

## 1. 배경

기존 서비스는 네이티브 앱 내 **서비스 단위 WebView Stack** 구조로 운영되었습니다.  
A 서비스와 B 서비스는 각각 독립적인 WebView에서 실행되었으며,  
서비스 이동 시 **새로운 WebView가 생성**되고 기존 WebView는 background로 유지되었습니다.

이로 인해:

- JS/React/React Query/Browser Storage/Memory가 완전히 분리
- 서비스 간 상태 공유 불가능
- react-query 캐싱 전략이 사실상 무의미 → **no-store** 전략만 사용

**리뉴얼 후 구조**  
**서비스 이동 = Route Transition**  
Native App → Single WebView (Shell) → SPA Routing

이 변화로 **런타임 공유**와 **클라이언트 캐싱**이 현실적으로 가능해졌습니다.

---

## 2. 기존 구조의 한계 (요약)

| 항목        | 기존 WebView Stack | 문제점                |
| ----------- | ------------------ | --------------------- |
| 런타임      | 완전 분리          | 상태 공유 불가        |
| 이동 방식   | 새 WebView 생성    | React Query 캐시 무효 |
| 데이터 전략 | no-store           | 매번 API 호출 + 로딩  |

---

## 3. 전략 목표

1. 초기 렌더링 UX 개선 (스피너 최소화)
2. 불필요한 API 요청 감소
3. 네트워크 트래픽 감소
4. 서비스 간 상태 공유 실현

---

## 4. 상태 관리 계층 구조

```
Route Handler (Truth)
↓
React Query (Runtime Cache)
↓
Persist Layer (Boot Cache)
```

- **Route Handler**: 서버 상태의 **단일 진실 공급원** (항상 최신)
- **React Query**: 앱 실행 중 캐시 + refetch 관리
- **Persist Layer**: 앱 재진입 시 즉시 렌더링을 위한 Boot Cache

---

## 5. 상세 설계 (신규 핵심 섹션)

### 5.1 Cache Key Strategy & Factory

모든 queryKey는 **중앙 집중 관리**합니다.

```tsx
// lib/queryKeys.ts
export const queryKeys = {
  serviceAccess: (serviceId: string) => ["service-access", serviceId] as const,
  userProfile: () => ["user", "profile"] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
} as const;
```

### 5.2 Invalidation Patterns

```tsx
// mutation 예시
onSuccess: (data) => {
  // 1. 특정 키 무효화
  queryClient.invalidateQueries({
    queryKey: queryKeys.serviceAccess(serviceId)
  });

  // 2. 태그 기반 무효화 (v5 추천)
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'user'
  });
},
```

글로벌 기본 설정 (QueryClient 생성 시):

```tsx
defaultOptions: {
  queries: {
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
}
```

### 5.3 Persist Configuration

```tsx
const Providers = ({ children }: PropsWithChildren) => {
  const [{ queryClient, persister }] = useState(() => ({
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 1000 * 60 * 60 * 24, // 24시간 <로컬스토리지에 저장된 정보가 stale 되는 시간 설정>
          refetchOnWindowFocus: "always",
          refetchOnReconnect: true,
          refetchOnMount: true,
        },
      },
    }),
    persister: createAsyncStoragePersister({
      storage:
        typeof window !== "undefined" ? window.localStorage : (null as any),
      key: "RQ_PERSIST_CACHE",
    }),
  }));

  // ==================== 선택적 Persist 핵심 로직 ====================
  const shouldPersistQuery = (query: Query) => {
    const persistFlag = query.meta?.persist;

    // 명시적으로 true/false 설정된 경우 그 값을 존중
    if (persistFlag === true) return !query.isDisabled();
    if (persistFlag === false) return false;

    // meta를 안 붙인 쿼리는 기본적으로 persist 안 함 (안전 우선)
    return false;
  };
  // ============================================================

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (이 부분은 정책에 맞게 수정)
        buster: import.meta.env.NEXT_PUBLIC_BUILD_HASH, // ← 배포 시 자동 무효화 (필수!)
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <UnauthorizedHandlerBridge />
      {children}
    </PersistQueryClientProvider>
  );
};

export default Providers;
```

#### 5.3.1 refetchOnMount 정책

모든 쿼리는 `refetchOnMount: true`를 기본으로 유지합니다.  
Persist 캐시 히트는 초기 렌더링 속도만 제공하고,  
실제 데이터 최신화는 항상 background에서 수행합니다.

업데이트 거의 없는 데이터 (service-access, user-profile 등) → `useStableQuery 사용 (persist + 긴 staleTime)`
자주 변하는 데이터 → `meta.persist: false + staleTime: 0`

```ts
//업데이트 거의 없는 부분만 hit 활용

export const useStableQuery = <T = unknown>(
  options: UseQueryOptions<T> & { meta?: { persist?: boolean } },
) => {
  return useQuery({
    ...options,
    refetchOnMount: true, // 항상 background refetch
    staleTime: options.staleTime ?? 1000 * 60 * 10, // 10분 (안정 데이터용)
    meta: { ...options.meta, persist: true }, // 강제 persist
  });
};
```

```tsx
// 안정 데이터 (업데이트 거의 없음)
const { data: access } = useStableQuery({
  queryKey: queryKeys.serviceAccess(serviceId),
  queryFn: fetchServiceAccess,
});

// 자주 변하는 데이터 (hit 거의 안 쓰고 refetch 위주)
const { data: realtimeData } = useQuery({
  queryKey: queryKeys.liveStats(),
  queryFn: fetchLiveStats,
  meta: { persist: false },
  staleTime: 0, // 항상 fresh
});

// 캐싱 사용 시
const { data: realtimeData } = useQuery({
  queryKey: queryKeys.lists(),
  queryFn: fetchLists,
  meta: { persist: true },
});
```

### 5.4 인증/권한 처리 원칙 & Custom Hook (가장 중요)

절대 Persist된 캐시만으로 권한 판단 금지!

```tsx
// hooks/useServiceAccess.ts
export const useServiceAccess = (serviceId: string) => {
  return useQuery({
    queryKey: queryKeys.serviceAccess(serviceId),
    queryFn: () => fetchServiceAccess(serviceId), // Route Handler만 호출
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    // Route Handler 강제 호출 보장
  });
};
```

사용 예시

```tsx
const { data: access } = useServiceAccess("service-a");
// access가 undefined면 Route Handler에서 이미 403 처리됨
```

### 5.5 WebView Lifecycle 대응

onResume (foreground 복귀): queryClient.invalidateQueries({ predicate: () => true }) 또는 selective refetch
onPause (background): 불필요한 refetch 중지
Native Bridge와 연동하여 WebView kill 시 persister.removeClient() 호출

### 5.6 Selective Persistence 전략

모든 쿼리를 persist하지 않고, 필요한 쿼리만 선택적으로 persist합니다.

- 정책

```
meta.persist: true → persist 대상
meta.persist: false → persist 제외
meta 미설정 → 기본적으로 persist 안 함 (안전 최우선)
```

- 왜 이 방식인가?

localStorage 오염 방지  
민감 데이터(인증, 결제) 보호  
개발자가 의도적으로 결정하게 함

### 6. 데이터 흐름

최초 진입

```
Browser Storage (Persist)
↓
Persisted Cache 복원 (buster 체크)
↓
React Query Cache 초기화
↓
UI 즉시 렌더링 (스피너 최소)
↓
Background refetch (Route Handler)
```

페이지 이동 (Route Change)

```
Route Change
       ↓
React Query Cache 확인
       ↓
Cache Hit → 즉시 렌더링
Cache Miss → Route Handler 호출
```

### 7. 인증 데이터 처리 원칙

Browser Storage에 저장된 데이터는 UI 힌트 용도로만 사용
모든 권한 판단은 Route Handler에서 수행
Logout 시 반드시 아래 절차 실행 (8.2 참조)

### 8. 리스크 완화 전략 (운영 안정성 핵심)

#### 8.1 Cache Versioning & Migration

- buster: PUBLIC_NEXT_BUILD_HASH 사용 → 배포 시 자동 전체 캐시 무효화
- 스키마 변경 시 별도 migration 함수 작성 가능

#### 8.2 Logout / Cache Clear 전략

```tsx
const handleLogout = async () => {
  await queryClient.clear();
  await persister.removeClient();
  localStorage.clear();
  sessionStorage.clear();
  // Native Bridge 호출 (WebView 재시작 권장)
};
```

#### 8.3 Multi-tab / Multi-session 대응

- localStorage 사용 + buster로 동기화
- 필요 시 focus 이벤트에서 queryClient.invalidateQueries() 호출

### 9. 기대 효과

- 초기 렌더링 UX 개선
- Boot Cache + Persist로 스피너는 최초 진입 시에만 발생
- 네트워크 트래픽 감소
- 서비스 간 상태 공유 완전 실현

### 10. 핵심 원칙

```
    textRoute Handler = Truth
    React Query = Runtime Cache
    Persist = Boot Cache
```

    역할을 철저히 분리함으로써
    데이터 정확성 + 성능 + 안정성을 동시에 확보합니다.
