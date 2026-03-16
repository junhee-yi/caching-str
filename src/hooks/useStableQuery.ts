import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

type StableQueryMeta = {
  persist?: boolean;
};

export function useStableQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    meta?: StableQueryMeta;
  },
) {
  return useQuery({
    ...options,
    staleTime: options.staleTime ?? 1000 * 20,
    refetchOnMount: true,
    meta: {
      ...options.meta,
      persist: true,
    },
  });
}
