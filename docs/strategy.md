# 서비스 상태 공유 전략

Single WebView 구조 전환에 따라 `React Query + Persist`를 어떤 기준으로 적용할지 설명하는 문서입니다.  
이 문서는 예제 프로젝트의 배경과 설계 원칙을 설명하고, 실제 동작은 루트의 [README.md](/Users/junhee.yi/Desktop/nosync.study/caching-str/README.md)와 코드에서 확인할 수 있도록 구성했습니다.

## 1. 배경

기존 서비스는 네이티브 앱 안에서 서비스별 WebView Stack 구조로 운영된다고 가정합니다.

- A 서비스와 B 서비스는 서로 다른 WebView에서 실행됨
- 서비스 이동 시 새로운 WebView가 생성됨
- 이전 WebView는 background에 남아 있음

이 구조에서는 다음 문제가 생깁니다.

- JS 런타임이 분리됨
- React 상태가 분리됨
- React Query cache가 분리됨
- browser storage를 공유하더라도 메모리 캐시는 공유되지 않음

결과적으로 서비스 간 상태 공유가 어렵고, 캐시를 적극적으로 활용하기보다는 매 요청을 새로 보내는 `no-store` 성향의 전략이 자연스럽습니다.

## 2. 구조 변화

리뉴얼 후 구조는 다음과 같습니다.

```text
Native App
  -> Single WebView (Shell)
    -> SPA Routing
```

이 구조에서는 서비스 이동이 더 이상 WebView 생성이 아니라 route transition이 됩니다.

이 변화로 인해 같은 런타임 안에서 다음이 가능해집니다.

- React Query cache 공유
- 브라우저 저장소 기반 persist 활용
- 서비스 간 상태 공유
- 초기 렌더링 UX 개선

## 3. 핵심 원칙

이 전략의 핵심은 계층을 섞지 않는 것입니다.

```text
Route Handler = Truth
React Query = Runtime Cache
Persist = Boot Cache
```

각 계층의 역할은 다음과 같습니다.

### Route Handler

- 최신 서버 상태의 기준
- 권한 판단의 기준
- 최종 truth source

### React Query

- 앱 실행 중 캐시
- stale/fresh 판단
- refetch 제어
- 화면 간 이동 시 재사용되는 runtime cache

### Persist

- 앱 재진입 시 빠른 초기 렌더링을 위한 boot cache
- 최신 데이터 보장의 수단이 아니라 UX 개선 장치

즉, persist는 truth가 아니고 힌트에 가깝습니다.

## 4. 왜 모든 쿼리를 persist하지 않는가

persist는 편리하지만 무분별하게 사용하면 문제가 생깁니다.

- localStorage 오염
- 민감 데이터 저장 위험
- 오래된 데이터가 과하게 남는 문제
- 권한이나 인증 판단을 캐시에 의존하게 되는 실수

그래서 이 예제는 선택적 persist를 기준으로 삼습니다.

```text
meta.persist: true  -> persist 대상
meta.persist: false -> persist 제외
meta 미설정         -> 기본 persist 제외
```

이 방식은 “명시적으로 허용한 쿼리만 저장한다”는 안전한 기본값을 만듭니다.

## 5. 쿼리 분류 기준

### 안정 데이터

변화 주기가 길고, 앱 재진입 시 빠른 렌더링에 도움이 되는 데이터입니다.

예시:

- user profile
- dashboard summary

이런 데이터는 다음 전략을 사용합니다.

- `useStableQuery`
- `meta.persist: true`
- 짧지만 체감 가능한 `staleTime`
- mount 시 background refetch 유지

이 예제에서는 stale 여부를 쉽게 확인할 수 있도록 `20초`를 사용합니다.

### 비안정 데이터

자주 바뀌거나, 최신성이 더 중요하거나, persist하면 위험한 데이터입니다.

예시:

- live stats
- 권한/접근 제어 데이터

이런 데이터는 다음 전략을 사용합니다.

- `meta.persist: false`
- 필요 시 `staleTime: 0`
- route handler 재호출을 통한 최신성 보장

## 6. 권한 처리 원칙

이 문서에서 가장 중요한 원칙은 이것입니다.

**persist된 캐시만으로 권한을 판단하면 안 됩니다.**

이유는 간단합니다.

- persist는 오래됐을 수 있음
- 이전 유저 세션의 흔적일 수 있음
- 권한 변경이 반영되지 않았을 수 있음
- 로그아웃/로그인 경계에서 잘못된 화면을 잠깐 보여줄 수 있음

그래서 권한 관련 데이터는 route handler 호출 결과를 기준으로 판단해야 합니다.

이 예제에서도 `service access`는 persist 대상이 아닙니다.

## 7. 왜 유저 전환 시나리오가 중요한가

단순히 `admin = allowed: false`로 두면 “권한 실패 UI”는 보여줄 수 있어도, 실제 권한 검증 전략을 테스트했다고 보긴 어렵습니다.

실제 검증에 가까운 시나리오는 다음과 같습니다.

- 같은 서비스에 대해
- 유저가 바뀌면
- 응답 결과도 달라진다

그래서 예제 프로젝트는 다음을 포함합니다.

- 상단 유저 전환 UI
- 현재 유저에 따라 달라지는 접근 결과
- `userId + serviceId` 기반 query key

이렇게 해야 캐시 키 충돌 없이, 유저 컨텍스트별 접근 제어를 검증할 수 있습니다.

## 8. Query Key 전략

query key는 중앙에서 관리합니다.

```ts
export const queryKeys = {
  userProfile: (userId: string) => ["user", "profile", userId] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
  serviceAccess: (userId: string, serviceId: string) =>
    ["service-access", userId, serviceId] as const,
  liveStats: () => ["live-stats"] as const,
} as const;
```

특히 권한 데이터는 반드시 유저 맥락이 key에 포함되어야 합니다.

잘못된 예:

```ts
["service-access", "admin"]
```

올바른 예:

```ts
["service-access", "user-01", "admin"]
```

## 9. Refetch 정책

이 예제의 기본 방향은 “빠르게 보여주되, 최신화는 다시 한다”입니다.

- `refetchOnMount: true`
- `refetchOnWindowFocus: "always"`
- `refetchOnReconnect: true`

즉, persist cache hit는 초기 렌더링 속도에만 기여하고, 최신성은 refetch가 책임집니다.

## 10. 운영 관점에서 기억할 것

실서비스에서는 다음까지 같이 고려해야 합니다.

- build hash 기반 `buster`
- logout 시 query cache와 persist cache 제거
- foreground 복귀 시 selective invalidate
- 민감 데이터 persist 금지
- 스키마 변경 시 migration 고려

## 11. 이 전략 문서와 예제 코드의 관계

이 문서는 설계 의도를 설명합니다.  
실제 구현은 예제 프로젝트 코드가 담당합니다.

문서를 읽을 때는 이런 순서가 가장 이해하기 쉽습니다.

1. [README.md](/Users/junhee.yi/Desktop/nosync.study/caching-str/README.md)로 프로젝트 목적과 시나리오 파악
2. [src/providers/AppProviders.tsx](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/providers/AppProviders.tsx)에서 provider/persist 설정 확인
3. [src/hooks/useStableQuery.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/hooks/useStableQuery.ts)에서 안정 데이터 정책 확인
4. [src/hooks/useAppQueries.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/hooks/useAppQueries.ts)에서 실제 쿼리 구성 확인
5. [src/lib/fakeServer.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/lib/fakeServer.ts)에서 유저별 권한 매트릭스 확인

이렇게 보면 “전략”과 “코드”가 어떻게 연결되는지 훨씬 명확하게 보입니다.
