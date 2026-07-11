import { useEffect, useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import type { ComplexDto } from '../../../types/complex';
import { LocationSearchFilter, type LocationFilterValue } from '../components/LocationSearchFilter';
import { NeighborhoodPicker } from '../components/NeighborhoodPicker';
import { complexService } from '../services/complexService';

const EMPTY_LOCATION_FILTER: LocationFilterValue = { cityId: null, districtId: null, neighborhoodId: null };

function complexFormFromDto(complex: ComplexDto) {
  return {
    name: complex.name,
    neighborhoodId: complex.neighborhood.id as number | null,
    address: complex.address ?? '',
    latitude: String(complex.latitude),
    longitude: String(complex.longitude),
  };
}

export function ComplexPage() {
  const { activeComplexId, setActiveComplex } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);

  const [locationFilter, setLocationFilter] = useState<LocationFilterValue>(EMPTY_LOCATION_FILTER);
  const [nameFilter, setNameFilter] = useState('');
  const [searchResults, setSearchResults] = useState<ComplexDto[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: complex,
    error: complexError,
    loading: complexLoading,
  } = useAsync(async () => {
    if (!activeComplexId) return null;
    try {
      return await complexService.get(activeComplexId);
    } catch (err) {
      // A stale/deleted active Complex reference shouldn't surface as a dead-end error - drop it
      // and let the user pick again from the search results below.
      if (err instanceof ApiError && err.status === 404) {
        setActiveComplex(null);
        return null;
      }
      throw err;
    }
  }, [activeComplexId, refreshKey]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => (complex ? complexFormFromDto(complex) : null));
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setEditForm(complex ? complexFormFromDto(complex) : null);
  }, [complex]);

  const [createForm, setCreateForm] = useState({
    name: '',
    neighborhoodId: null as number | null,
    address: '',
    latitude: '',
    longitude: '',
    subscriptionStartDate: new Date().toISOString().slice(0, 10),
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSearchError(null);
    setIsSearching(true);
    try {
      const results = await complexService.search({
        cityId: locationFilter.cityId ?? undefined,
        districtId: locationFilter.districtId ?? undefined,
        neighborhoodId: locationFilter.neighborhoodId ?? undefined,
        name: nameFilter || undefined,
      });
      setSearchResults(results);
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : 'Arama yapılamadı.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    if (!createForm.neighborhoodId) {
      setCreateError('Lütfen il / ilçe / mahalle seçin.');
      return;
    }
    setIsCreating(true);
    try {
      const created = await complexService.create({
        name: createForm.name,
        neighborhoodId: createForm.neighborhoodId,
        address: createForm.address || undefined,
        latitude: Number(createForm.latitude),
        longitude: Number(createForm.longitude),
        subscriptionStartDate: createForm.subscriptionStartDate,
      });
      setActiveComplex(created.id, created.name);
      setCreateForm({
        name: '',
        neighborhoodId: null,
        address: '',
        latitude: '',
        longitude: '',
        subscriptionStartDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Site oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId || !editForm?.neighborhoodId) return;
    setEditError(null);
    setIsSaving(true);
    try {
      const updated = await complexService.update(activeComplexId, {
        name: editForm.name,
        neighborhoodId: editForm.neighborhoodId,
        address: editForm.address || undefined,
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
      });
      setActiveComplex(updated.id, updated.name);
      setIsEditing(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Site güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeComplexId || !complex) return;
    if (!window.confirm(`"${complex.name}" sitesini silmek istediğinize emin misiniz?`)) return;
    try {
      await complexService.delete(activeComplexId);
      setActiveComplex(null);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Site silinemedi.');
    }
  }

  async function handleExtendSubscription() {
    if (!activeComplexId || !complex) return;
    const newEndDate = window.prompt('Yeni abonelik bitiş tarihi (YYYY-AA-GG):');
    if (!newEndDate) return;
    try {
      await complexService.extendSubscription(activeComplexId, { newEndDate });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Abonelik uzatılamadı.');
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Siteler</h1>
      </div>

      <Card className="stack">
        <h2>Site Ara</h2>
        <form className="stack" onSubmit={handleSearch}>
          <LocationSearchFilter value={locationFilter} onChange={setLocationFilter} />
          <div className="row">
            <Input placeholder="Site adı" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Aranıyor…' : 'Ara'}
            </Button>
          </div>
          {searchError && <ErrorBanner message={searchError} />}
        </form>
        {searchResults && searchResults.length === 0 && <EmptyState message="Sonuç bulunamadı." />}
        {searchResults && searchResults.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Site</th>
                <th>Konum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.name}</td>
                  <td>
                    {result.city.name} / {result.district.name} / {result.neighborhood.name}
                  </td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => setActiveComplex(result.id, result.name)}>
                      Aktif Yap
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {activeComplexId && (
        <Card className="stack">
          <div className="page-header">
            <h2>Aktif Site Bilgileri</h2>
            {complex && !isEditing && (
              <div className="row">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  Sil
                </Button>
              </div>
            )}
          </div>
          {complexLoading && <Spinner />}
          {complexError && <ErrorBanner message={complexError} />}

          {complex && !isEditing && (
            <div className="stack">
              <p>
                <strong>{complex.name}</strong> — {complex.city.name} / {complex.district.name} /{' '}
                {complex.neighborhood.name}
              </p>
              {complex.address && <p>{complex.address}</p>}
              <p>
                Konum: {complex.latitude}, {complex.longitude}
              </p>
              <div className="row">
                <Badge>Abonelik başlangıcı: {complex.subscriptionStartDate.slice(0, 10)}</Badge>
                <Badge tone={complex.subscriptionEndDate ? 'default' : 'success'}>
                  Bitiş: {complex.subscriptionEndDate ? complex.subscriptionEndDate.slice(0, 10) : 'Süresiz'}
                </Badge>
              </div>
              <div>
                <Button variant="secondary" size="sm" onClick={handleExtendSubscription}>
                  Aboneliği Uzat
                </Button>
              </div>
            </div>
          )}

          {complex && isEditing && editForm && (
            <form className="stack" onSubmit={handleSaveEdit}>
              {editError && <ErrorBanner message={editError} />}
              <Input
                label="Site Adı"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <NeighborhoodPicker
                neighborhoodId={editForm.neighborhoodId}
                onChange={(neighborhoodId) => setEditForm({ ...editForm, neighborhoodId })}
              />
              <Input
                label="Adres"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
              <div className="row">
                <Input
                  label="Enlem (Latitude)"
                  type="number"
                  step="any"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                  required
                />
                <Input
                  label="Boylam (Longitude)"
                  type="number"
                  step="any"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                  required
                />
              </div>
              <div className="row">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Vazgeç
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <Card className="stack">
        <h2>Yeni Site Oluştur</h2>
        <form className="stack" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input
            label="Site Adı"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <NeighborhoodPicker
            neighborhoodId={createForm.neighborhoodId}
            onChange={(neighborhoodId) => setCreateForm({ ...createForm, neighborhoodId })}
          />
          <Input
            label="Adres"
            value={createForm.address}
            onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
          />
          <div className="row">
            <Input
              label="Enlem (Latitude)"
              type="number"
              step="any"
              value={createForm.latitude}
              onChange={(e) => setCreateForm({ ...createForm, latitude: e.target.value })}
              required
            />
            <Input
              label="Boylam (Longitude)"
              type="number"
              step="any"
              value={createForm.longitude}
              onChange={(e) => setCreateForm({ ...createForm, longitude: e.target.value })}
              required
            />
          </div>
          <Input
            label="Abonelik Başlangıç Tarihi"
            type="date"
            value={createForm.subscriptionStartDate}
            onChange={(e) => setCreateForm({ ...createForm, subscriptionStartDate: e.target.value })}
            required
          />
          <div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor…' : 'Site Oluştur'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
