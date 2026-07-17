import { useEffect, useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import { NeighborhoodPicker } from '../components/NeighborhoodPicker';
import { complexService } from '../services/complexService';
import { complexFormFromDto } from '../utils/complexForm';

export function ComplexPage() {
  const { activeComplexId, setActiveComplex } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: complex,
    error: complexError,
    loading: complexLoading,
  } = useAsync(
    () => (activeComplexId ? complexService.get(activeComplexId) : Promise.resolve(null)),
    [activeComplexId, refreshKey],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => (complex ? complexFormFromDto(complex) : null));
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setEditForm(complex ? complexFormFromDto(complex) : null);
  }, [complex]);

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
      setActiveComplex(updated.id, updated.name, updated.city.id);
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
        <h1>Sitem</h1>
      </div>

      {activeComplexId && (
        <Card className="stack">
          <div className="page-header">
            <h2>Site Bilgileri</h2>
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

      {!activeComplexId && (
        <Card className="stack">
          <h2>Siteniz Bulunamadı</h2>
          <p>
            Bir sitenin oluşturulması yalnızca admin tarafından, yönetici hesabınızla birlikte yapılır. Sitenizin
            oluşturulması için lütfen sizi hesabınızı oluşturan admin ile iletişime geçin.
          </p>
        </Card>
      )}
    </div>
  );
}
