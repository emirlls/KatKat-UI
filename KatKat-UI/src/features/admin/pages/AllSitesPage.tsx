import { useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Modal } from '../../../components/Modal';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { ApiError } from '../../../services/api';
import type { AdminComplexListItemDto } from '../../../types/complex';
import { FlatMemberRoleLabels } from '../../../types/enums';
import { NeighborhoodPicker } from '../../management/components/NeighborhoodPicker';
import { complexService } from '../../management/services/complexService';
import { complexFormFromDto } from '../../management/utils/complexForm';
import { LocationFilter, type LocationFilterValue } from '../components/LocationFilter';

const EMPTY_LOCATION_FILTER: LocationFilterValue = { cityId: null, districtId: null, neighborhoodId: null };
const SEARCH_DEBOUNCE_MS = 400;

function SiteDetailModal({ complexId, onClose }: { complexId: string; onClose: () => void }) {
  const {
    data: detail,
    error,
    loading,
  } = useAsync(() => complexService.getDetailAcrossAllTenants(complexId), [complexId]);

  return (
    <Modal title={detail?.complex.name ?? 'Site Detayı'} onClose={onClose}>
      <div className="stack">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {detail && (
          <div className="stack">
            <div className="stack">
              {detail.complex.address && <p>{detail.complex.address}</p>}
              <p>
                Konum: {detail.complex.latitude}, {detail.complex.longitude}
              </p>
              <div className="row">
                <Badge>Abonelik başlangıcı: {detail.complex.subscriptionStartDate.slice(0, 10)}</Badge>
                <Badge tone={detail.complex.subscriptionEndDate ? 'default' : 'success'}>
                  Bitiş:{' '}
                  {detail.complex.subscriptionEndDate ? detail.complex.subscriptionEndDate.slice(0, 10) : 'Süresiz'}
                </Badge>
              </div>
            </div>

            {detail.buildings.length === 0 && <EmptyState message="Bu sitede henüz blok yok." />}
            {detail.buildings.map((building) => (
              <Card key={building.id} className="stack">
                <h3>
                  {building.name}
                  {building.floorCount != null && <span> — {building.floorCount} Kat</span>}
                </h3>
                {building.flats.length === 0 && <EmptyState message="Bu blokta henüz daire yok." />}
                {building.flats.map((flat) => (
                  <div key={flat.id} className="stack">
                    <div>
                      <strong>Daire {flat.flatNumber}</strong>
                      {flat.floorNumber != null && <span> — Kat {flat.floorNumber}</span>}
                      <span> — Arsa Payı: {flat.shareFactor}</span>
                    </div>
                    {flat.residents.length === 0 ? (
                      <EmptyState message="Bu dairede henüz sakin yok." />
                    ) : (
                      <div className="row">
                        {flat.residents.map((resident) => (
                          <Badge key={resident.id}>
                            {resident.userName} — {FlatMemberRoleLabels[resident.role]}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function SiteRow({
  site,
  onSaved,
  onShowDetail,
}: {
  site: AdminComplexListItemDto;
  onSaved: () => void;
  onShowDetail: (complexId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => complexFormFromDto(site.complex));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function startEdit() {
    setError(null);
    setForm(complexFormFromDto(site.complex));
    setIsEditing(true);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!form.neighborhoodId) return;
    setError(null);
    setIsSaving(true);
    try {
      await complexService.updateAcrossAllTenants(site.complex.id, {
        name: form.name,
        neighborhoodId: form.neighborhoodId,
        address: form.address || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      setIsEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Site güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`"${site.complex.name}" sitesini silmek istediğinize emin misiniz?`)) return;
    try {
      await complexService.deleteAcrossAllTenants(site.complex.id);
      onSaved();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Site silinemedi.');
    }
  }

  async function handleToggleActive() {
    if (
      site.complex.isActive &&
      !window.confirm(
        `"${site.complex.name}" sitesini pasifleştirmek istediğinize emin misiniz? Bu işlem siteyi lider tablosu ve yakınımdaki siteler görünümünden kaldırır.`,
      )
    )
      return;
    try {
      await complexService.setActiveAcrossAllTenants(site.complex.id, !site.complex.isActive);
      onSaved();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Site durumu güncellenemedi.');
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={6}>
          <form className="stack" onSubmit={handleSave}>
            {error && <ErrorBanner message={error} />}
            <Input
              label="Site Adı"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <NeighborhoodPicker
              neighborhoodId={form.neighborhoodId}
              onChange={(neighborhoodId) => setForm({ ...form, neighborhoodId })}
            />
            <Input label="Adres" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="row">
              <Input
                label="Enlem (Latitude)"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                required
              />
              <Input
                label="Boylam (Longitude)"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                required
              />
            </div>
            <div className="row">
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                Vazgeç
              </Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{site.complex.name}</td>
      <td>
        {site.complex.city.name} / {site.complex.district.name} / {site.complex.neighborhood.name}
      </td>
      <td>{site.complex.address ?? '-'}</td>
      <td>
        {site.complex.subscriptionStartDate.slice(0, 10)}
        {' – '}
        {site.complex.subscriptionEndDate ? site.complex.subscriptionEndDate.slice(0, 10) : 'Süresiz'}
      </td>
      <td>
        <Badge tone={site.complex.isActive ? 'success' : 'danger'}>{site.complex.isActive ? 'Aktif' : 'Pasif'}</Badge>
      </td>
      <td>
        <div className="row">
          <Button size="sm" variant="secondary" onClick={() => onShowDetail(site.complex.id)}>
            Detay Gör
          </Button>
          <Button size="sm" variant="secondary" onClick={startEdit}>
            Düzenle
          </Button>
          <Button size="sm" variant="secondary" onClick={handleToggleActive}>
            {site.complex.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function AllSitesPage() {
  const [nameFilter, setNameFilter] = useState('');
  const debouncedNameFilter = useDebouncedValue(nameFilter, SEARCH_DEBOUNCE_MS);
  const [locationFilter, setLocationFilter] = useState<LocationFilterValue>(EMPTY_LOCATION_FILTER);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

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
    [locationFilter.cityId, locationFilter.districtId, locationFilter.neighborhoodId, debouncedNameFilter, refreshKey],
  );

  function resetFilters() {
    setNameFilter('');
    setLocationFilter(EMPTY_LOCATION_FILTER);
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Tüm Siteler</h1>
      </div>

      <Card className="stack">
        <div className="row">
          <Input placeholder="Site adı ara" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Filtreyi Sıfırla
          </Button>
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
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <SiteRow
                  key={site.complex.id}
                  site={site}
                  onSaved={() => setRefreshKey((k) => k + 1)}
                  onShowDetail={setSelectedSiteId}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {selectedSiteId && <SiteDetailModal complexId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />}
    </div>
  );
}
