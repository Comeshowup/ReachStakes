import { useSearchParams } from "react-router-dom";
import { useCallback, useDeferredValue, useState, useEffect } from "react";

/**
 * Manages all activity filter state, synced to URL query params.
 * Search is debounced 300ms before being committed to URL.
 */
export const useActivityFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local (immediate) search value for the input
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || ""
  );

  // Debounce: push to URL after 300ms idle
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) {
          next.set("search", searchInput);
        } else {
          next.delete("search");
        }
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = {
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    entityType: searchParams.get("entityType") || "",
    timeRange: searchParams.get("timeRange") || "",
  };

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // Reset pagination on filter change
        next.delete("cursor");
        return next;
      });
      // Sync local search input if filter key is search
      if (key === "search") setSearchInput(value);
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams({});
    setSearchInput("");
  }, [setSearchParams]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return {
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    resetFilters,
    activeCount,
  };
};
