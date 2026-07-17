import { useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { ApiError } from '../../../services/api';
import type { ManagerListItemDto, UpdateManagerDto } from '../../../types/admin';
import { LocationFilter, type LocationFilterValue } from '../components/LocationFilter';
import { managerService } from '../services/managerService';

const EMPTY_LOCATION_FILTER: LocationFilterValue = { cityId: null, districtId: null, neighborhoodId: null };
const EMPTY_EDIT_FORM: UpdateManagerDto = { userName: '', email: '', phoneNumber: '' };
const SEARCH_DEBOUNCE_MS = 400;

function ManagerRow({ manager, onSaved }: { manager: ManagerListItemDto; onSaved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateManagerDto>(EMPTY_EDIT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function startEdit() {
    setError(null);
    setForm({ userName: manager.userName, email: manager.email, phoneNumber: manager.phoneNumber ?? '' });
    setIsEditing(true);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await managerService.update(manager.tenantId, form);
      setIsEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yönetici güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `"${manager.userName}" yöneticisini silmek istediğinize emin misiniz? Bu işlem yöneticinin kiracısını ve içindeki tüm kullanıcıları (sakinler dahil) kalıcı olarak siler.`,
      )
    )
      return;
    try {
      await managerService.delete(manager.tenantId);
      onSaved();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Yönetici silinemedi.');
    }
  }

  async function handleToggleActive() {
    if (
      manager.isActive &&
      !window.confirm(
        `"${manager.userName}" yöneticisini pasifleştirmek istediğinize emin misiniz? Bu işlem yöneticinin ve kiracısındaki tüm kullanıcıların giriş yapmasını engeller.`,
      )
    )
      return;
    try {
      await managerService.setActive(manager.tenantId, !manager.isActive);
      onSaved();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Yönetici durumu güncellenemedi.');
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4}>
          <form className="stack" onSubmit={handleSave}>
            {error && <ErrorBanner message={error} />}
            <div className="row">
              <Input
                placeholder="Kullanıcı Adı"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                required
              />
              <Input
                placeholder="E-posta"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                placeholder="Telefon"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
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
      <td>
        <strong>{manager.userName}</strong>{' '}
        <Badge tone={manager.isActive ? 'success' : 'danger'}>{manager.isActive ? 'Aktif' : 'Pasif'}</Badge>
        <div>{manager.email}</div>
        {manager.phoneNumber && <div>{manager.phoneNumber}</div>}
      </td>
      <td>{manager.complexName ?? <em>Henüz site oluşturmadı</em>}</td>
      <td>
        {manager.city && manager.district && manager.neighborhood
          ? `${manager.city.name} / ${manager.district.name} / ${manager.neighborhood.name}`
          : '-'}
      </td>
      <td>
        <div className="row">
          <Button size="sm" variant="secondary" onClick={startEdit}>
            Düzenle
          </Button>
          <Button size="sm" variant="secondary" onClick={handleToggleActive}>
            {manager.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function ManagersPage() {
  const [form, setForm] = useState({ userName: '', email: '', phoneNumber: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [nameFilter, setNameFilter] = useState('');
  const debouncedNameFilter = useDebouncedValue(nameFilter, SEARCH_DEBOUNCE_MS);
  const [locationFilter, setLocationFilter] = useState<LocationFilterValue>(EMPTY_LOCATION_FILTER);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: managers,
    error: listError,
    loading,
  } = useAsync(
    () =>
      managerService.list({
        cityId: locationFilter.cityId ?? undefined,
        districtId: locationFilter.districtId ?? undefined,
        neighborhoodId: locationFilter.neighborhoodId ?? undefined,
        name: debouncedNameFilter || undefined,
      }),
    [locationFilter.cityId, locationFilter.districtId, locationFilter.neighborhoodId, debouncedNameFilter, refreshKey],
  );

  function handleResetFilter() {
    setNameFilter('');
    setLocationFilter(EMPTY_LOCATION_FILTER);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsCreating(true);
    try {
      await managerService.create(form);
      setMessage(`"${form.userName}" yönetici hesabı oluşturuldu.`);
      setForm({ userName: '', email: '', phoneNumber: '', password: '' });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yönetici oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Yöneticiler</h1>
      </div>

      <Card className="stack">
        <h2>Yeni Yönetici Ekle</h2>
        <p>Her yönetici kendi sitesini yönetir; siteleri ve daireleri diğer yöneticilerden tamamen ayrıdır.</p>
        <form className="stack" onSubmit={handleCreate}>
          {error && <ErrorBanner message={error} />}
          {message && <p>{message}</p>}
          <Input
            label="Kullanıcı Adı"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
            required
          />
          <Input
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Telefon"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
          <Input
            label="Şifre"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor…' : 'Yönetici Oluştur'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="stack">
        <h2>Yöneticiler</h2>
        <div className="row">
          <Input placeholder="İsim veya e-posta ara" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
          <Button size="sm" variant="secondary" onClick={handleResetFilter}>
            Filtreyi Sıfırla
          </Button>
        </div>
        <LocationFilter value={locationFilter} onChange={setLocationFilter} />

        {loading && <Spinner />}
        {listError && <ErrorBanner message={listError} />}
        {managers && managers.length === 0 && <EmptyState message="Kriterlere uyan yönetici bulunamadı." />}
        {managers && managers.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Yönetici</th>
                <th>Site</th>
                <th>Konum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <ManagerRow key={manager.tenantId} manager={manager} onSaved={() => setRefreshKey((k) => k + 1)} />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
