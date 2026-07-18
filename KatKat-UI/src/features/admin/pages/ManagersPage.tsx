import { useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import type { ManagerListItemDto, UpdateManagerDto } from '../../../types/admin';
import { NeighborhoodPicker } from '../../management/components/NeighborhoodPicker';
import { LocationFilter } from '../components/LocationFilter';
import { useNameAndLocationFilters } from '../hooks/useNameAndLocationFilters';
import { managerService } from '../services/managerService';

const EMPTY_EDIT_FORM: UpdateManagerDto = { userName: '', email: '', phoneNumber: '' };

function createEmptyForm() {
  return {
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    siteName: '',
    siteNeighborhoodId: null as number | null,
    siteAddress: '',
    siteLatitude: '',
    siteLongitude: '',
    siteSubscriptionStartDate: new Date().toISOString().slice(0, 10),
  };
}

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
  const [form, setForm] = useState(createEmptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const { nameFilter, debouncedNameFilter, locationFilter, setNameFilter, setLocationFilter, resetFilters } =
    useNameAndLocationFilters();

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

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.siteNeighborhoodId) {
      setError('Lütfen sitenin il / ilçe / mahallesini seçin.');
      return;
    }
    setIsCreating(true);
    try {
      await managerService.create({
        userName: form.userName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        site: {
          name: form.siteName,
          neighborhoodId: form.siteNeighborhoodId,
          address: form.siteAddress || undefined,
          latitude: Number(form.siteLatitude),
          longitude: Number(form.siteLongitude),
          subscriptionStartDate: form.siteSubscriptionStartDate,
        },
      });
      setMessage(`"${form.userName}" yönetici hesabı ve sitesi oluşturuldu.`);
      setForm(createEmptyForm());
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
        <p>
          Bir yönetici, sitesiyle birlikte oluşturulur; siteler ve daireler diğer yöneticilerden tamamen ayrıdır.
          Yönetici kendi sitesini oluşturamaz - sitesi burada, hesabıyla birlikte oluşturulur.
        </p>
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

          <h3>Site Bilgileri</h3>
          <Input
            label="Site Adı"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            required
          />
          <NeighborhoodPicker
            neighborhoodId={form.siteNeighborhoodId}
            onChange={(siteNeighborhoodId) => setForm({ ...form, siteNeighborhoodId })}
          />
          <Input
            label="Adres"
            value={form.siteAddress}
            onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
          />
          <div className="row">
            <Input
              label="Enlem (Latitude)"
              type="number"
              step="any"
              value={form.siteLatitude}
              onChange={(e) => setForm({ ...form, siteLatitude: e.target.value })}
              required
            />
            <Input
              label="Boylam (Longitude)"
              type="number"
              step="any"
              value={form.siteLongitude}
              onChange={(e) => setForm({ ...form, siteLongitude: e.target.value })}
              required
            />
          </div>
          <Input
            label="Abonelik Başlangıç Tarihi"
            type="date"
            value={form.siteSubscriptionStartDate}
            onChange={(e) => setForm({ ...form, siteSubscriptionStartDate: e.target.value })}
            required
          />

          <div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor…' : 'Yönetici ve Site Oluştur'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="stack">
        <h2>Yöneticiler</h2>
        <div className="row">
          <Input placeholder="İsim veya e-posta ara" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
          <Button size="sm" variant="secondary" onClick={resetFilters}>
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
