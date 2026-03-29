import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchActivityPage } from "../api/activityApi";

/**
 * useActivityFeed — infinite scroll feed powered by TanStack Query v5
 * Query key includes all active filters so refetch is automatic on filter change.
 */
export const useActivityFeed = (filters = {}) => {
  const queryKey = ["admin", "activity", filters];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchActivityPage({
        cursor: pageParam,
        limit: 20,
        type: filters.type || undefined,
        status: filters.status || undefined,
        entityType: filters.entityType || undefined,
        search: filters.search || undefined,
        timeRange: filters.timeRange || undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Flatten all pages into a single event array
  const events = query.data?.pages?.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages?.[0]?.total ?? 0;

  return {
    events,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    queryKey,
  };
};
