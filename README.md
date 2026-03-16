# React Query Persist 캐싱 전략 예제

Single WebView + SPA Routing 환경을 가정하고, `React Query + Persist` 전략을 어떻게 적용할 수 있는지 보여주는 Next.js 예제 프로젝트입니다.

이 저장소는 두 가지를 함께 보여주기 위해 만들어졌습니다.

- 전략 문서로 설계 의도를 설명하기
- 실제 예제 코드로 그 전략이 어떻게 적용되는지 확인하기

전략 자체에 대한 자세한 설명은 [docs/strategy.md](/Users/junhee.yi/Desktop/nosync.study/caching-str/docs/strategy.md)에서 볼 수 있습니다.

## 이 프로젝트가 보여주는 것

- `Route Handler = Truth`
- `React Query = Runtime Cache`
- `Persist = Boot Cache`
- 모든 데이터를 persist하지 않고 `meta.persist` 기준으로 선택적으로 저장하는 방식
- 권한 판단은 persist된 캐시가 아니라 route handler 호출 결과를 기준으로 해야 한다는 원칙
- 같은 서비스라도 유저가 바뀌면 접근 결과가 달라지는 시나리오

## 주요 시나리오

이 예제에서는 상단에서 현재 유저를 바꿀 수 있습니다.

- `Alex`
  - `billing`: 접근 가능
  - `support`: 접근 가능
  - `admin`: 접근 불가
- `Buck`
  - `billing`: 접근 불가
  - `support`: 접근 가능
  - `admin`: 접근 불가
- `Jack`
  - `billing`: 접근 가능
  - `support`: 접근 가능
  - `admin`: 접근 가능

이렇게 구성한 이유는 `admin`을 단순히 고정 `allowed: false`로 두는 대신, 같은 서비스에 대해 유저 컨텍스트가 바뀌면 권한 결과도 바뀌는 흐름을 보여주기 위해서입니다.

## 화면에서 확인할 수 있는 포인트

### 1. Dashboard

- `user profile`: persist 대상
- `dashboard`: persist 대상
- `live stats`: persist 제외

persist 대상 데이터는 앱 재진입 시 boot cache로 빠르게 렌더링될 수 있고, 이후 background refetch로 최신화됩니다.

### 2. Service Access

- `billing`
- `support`
- `admin`

서비스 접근 여부는 현재 유저와 서비스 조합으로 조회됩니다.  
즉, query key도 단순히 `serviceId`만 쓰지 않고 `userId + serviceId` 조합을 사용합니다.

## 실행 방법

```bash
npm install
npm run dev
```

그 뒤 브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 됩니다.

## 프로젝트 구조

```text
app/
  layout.tsx
  page.tsx
  services/[serviceId]/page.tsx

src/
  components/
    AppShell.tsx
    QueryStateCard.tsx
  hooks/
    useAppQueries.ts
    useCurrentUser.ts
    useStableQuery.ts
  lib/
    fakeServer.ts
    queryKeys.ts
    types.ts
  providers/
    AppProviders.tsx
  screens/
    DashboardPage.tsx
    ServicePage.tsx
```

## 코드에서 먼저 보면 좋은 파일

- [src/providers/AppProviders.tsx](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/providers/AppProviders.tsx)
  - React Query와 persist 설정이 들어 있습니다.
- [src/hooks/useStableQuery.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/hooks/useStableQuery.ts)
  - 안정 데이터용 query wrapper입니다.
- [src/hooks/useAppQueries.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/hooks/useAppQueries.ts)
  - 실제 예제에서 사용하는 query hook이 모여 있습니다.
- [src/lib/queryKeys.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/lib/queryKeys.ts)
  - query key factory가 정의되어 있습니다.
- [src/lib/fakeServer.ts](/Users/junhee.yi/Desktop/nosync.study/caching-str/src/lib/fakeServer.ts)
  - mock route handler 역할을 합니다.

## 이 README와 전략 문서의 차이

이 README는 프로젝트를 빠르게 이해하고 실행하기 위한 문서입니다.

- 무엇을 보여주는 프로젝트인지
- 어떻게 실행하는지
- 어디를 보면 되는지
- 어떤 시나리오를 검증할 수 있는지

반면 [docs/strategy.md](/Users/junhee.yi/Desktop/nosync.study/caching-str/docs/strategy.md)는 왜 이런 구조를 택했는지 설명하는 문서입니다.

- 왜 Single WebView 전환에서 캐싱 전략이 다시 중요해졌는지
- 왜 persist를 선택적으로만 써야 하는지
- 왜 권한 판단을 persisted cache에 의존하면 안 되는지
- 어떤 트레이드오프를 감수하는지

## 참고

이 프로젝트는 실제 API 대신 mock route handler를 사용합니다.  
목표는 서버 통신 자체보다 캐싱 계층과 권한 검증 원칙을 이해하기 쉽게 보여주는 데 있습니다.
