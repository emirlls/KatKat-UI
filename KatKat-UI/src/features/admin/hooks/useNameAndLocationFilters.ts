import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { LocationFilterValue } from '../components/LocationFilter';

const SEARCH_DEBOUNCE_MS = 400;

/**
 * The name+location filter shape shared by ManagersPage and AllSitesPage, synced to the URL
 * query string (via `{ replace: true }`, so typing doesn't flood browser history) instead of
 * plain component state - otherwise navigating away and using the browser's back button loses
 * every filter, since a fresh page mount has no memory of the previous one's local state.
 */
export function useNameAndLocationFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const nameFilter = searchParams.get('name') ?? '';
  const debouncedNameFilter = useDebouncedValue(nameFilter, SEARCH_DEBOUNCE_MS);

  const locationFilter: LocationFilterValue = useMemo(
    () => ({
      cityId: toNumberOrNull(searchParams.get('cityId')),
      districtId: toNumberOrNull(searchParams.get('districtId')),
      neighborhoodId: toNumberOrNull(searchParams.get('neighborhoodId')),
    }),
    [searchParams],
  );

  const setNameFilter = useCallback(
    (name: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          setOrDelete(next, 'name', name || null);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setLocationFilter = useCallback(
    (value: LocationFilterValue) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          setOrDelete(next, 'cityId', value.cityId);
          setOrDelete(next, 'districtId', value.districtId);
          setOrDelete(next, 'neighborhoodId', value.neighborhoodId);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { nameFilter, debouncedNameFilter, locationFilter, setNameFilter, setLocationFilter, resetFilters };
}

function toNumberOrNull(value: string | null): number | null {
  return value ? Number(value) : null;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | number | null) {
  if (value != null && value !== '') {
    params.set(key, String(value));
  } else {
    params.delete(key);
  }
}
