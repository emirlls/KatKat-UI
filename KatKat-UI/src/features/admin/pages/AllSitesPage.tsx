import { useState } from 'react';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { complexService } from '../../management/services/complexService';
import { LocationFilter, type LocationFilterValue } from '../components/LocationFilter';

const EMPTY_LOCATION_FILTER: LocationFilterValue = { cityId: null, districtId: null, neighborhoodId: null };
const SEARCH_DEBOUNCE_MS = 400;

export function AllSitesPage() {
  const [nameFilter, setNameFilter] = useState('');
  const debouncedNameFilter = useDebouncedValue(nameFilter, SEARCH_DEBOUNCE_MS);
  const [locationFilter, setLocationFilter] = useState<LocationFilterValue>(EMPTY_LOCATION_FILTER);

  const {
    data: sites,
    error,
    loading,
  } = useAsync(
    () =>
      complexService.searchAcrossAllTenants({
        cityId: locationFilter.cityId ?? undefined,
        districtId: locationFilter.districtId ?? undefined,
        neighborhoodId: locationFilter.neighborhoodId ?? undefined,
        name: debouncedNameFilter || undefined,
      }),
    [locationFilter.cityId, locationFilter.districtId, locationFilter.neighborhoodId, debouncedNameFilter],
  );

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Tüm Siteler</h1>
      </div>

      <Card className="stack">
        <div className="row">
          <Input placeholder="Site adı ara" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
        </div>
        <LocationFilter value={locationFilter} onChange={setLocationFilter} />

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {sites && sites.length === 0 && <EmptyState message="Kriterlere uyan site bulunamadı." />}
        {sites && sites.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Site</th>
                <th>Konum</th>
                <th>Adres</th>
                <th>Abonelik</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(({ complex }) => (
                <tr key={complex.id}>
                  <td>{complex.name}</td>
                  <td>
                    {complex.city.name} / {complex.district.name} / {complex.neighborhood.name}
                  </td>
                  <td>{complex.address ?? '-'}</td>
                  <td>
                    {complex.subscriptionStartDate.slice(0, 10)}
                    {' – '}
                    {complex.subscriptionEndDate ? complex.subscriptionEndDate.slice(0, 10) : 'Süresiz'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
