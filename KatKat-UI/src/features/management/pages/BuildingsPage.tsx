import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import { buildingService } from '../services/buildingService';

export function BuildingsPage() {
  const { activeComplexId } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    data: buildings,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? buildingService.listByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  const [name, setName] = useState('');
  const [floorCount, setFloorCount] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', floorCount: '' });
  const [editError, setEditError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId) return;
    setCreateError(null);
    setIsCreating(true);
    try {
      await buildingService.create({
        complexId: activeComplexId,
        name,
        floorCount: floorCount ? Number(floorCount) : undefined,
      });
      setName('');
      setFloorCount('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Blok oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  }

  function startEdit(building: { id: string; name: string; floorCount?: number }) {
    setEditingBuildingId(building.id);
    setEditError(null);
    setEditForm({
      name: building.name,
      floorCount: building.floorCount != null ? String(building.floorCount) : '',
    });
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingBuildingId) return;
    setEditError(null);
    try {
      await buildingService.update(editingBuildingId, {
        name: editForm.name,
        floorCount: editForm.floorCount ? Number(editForm.floorCount) : undefined,
      });
      setEditingBuildingId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Blok güncellenemedi.');
    }
  }

  async function handleDelete(buildingId: string, buildingName: string) {
    if (!window.confirm(`"${buildingName}" bloğunu silmek istediğinize emin misiniz?`)) return;
    try {
      await buildingService.delete(buildingId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Blok silinemedi.');
    }
  }

  if (!activeComplexId) {
    return (
      <div className="page">
        <EmptyState message="Önce Siteler sayfasından bir site seçin." />
      </div>
    );
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Bloklar</h1>
      </div>

      <Card className="stack">
        <h2>Yeni Blok Ekle</h2>
        <form className="row" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input placeholder="Blok adı (örn. A Blok)" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            placeholder="Kat sayısı"
            type="number"
            value={floorCount}
            onChange={(e) => setFloorCount(e.target.value)}
          />
          <Button type="submit" disabled={isCreating}>
            Ekle
          </Button>
        </form>
      </Card>

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {buildings && buildings.length === 0 && <EmptyState message="Henüz blok eklenmemiş." />}
        {editError && <ErrorBanner message={editError} />}
        {buildings && buildings.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Blok</th>
                <th>Kat Sayısı</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {buildings.map((building) =>
                editingBuildingId === building.id ? (
                  <tr key={building.id}>
                    <td colSpan={3}>
                      <form className="row" onSubmit={handleSaveEdit}>
                        <Input
                          placeholder="Blok adı"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="Kat sayısı"
                          type="number"
                          value={editForm.floorCount}
                          onChange={(e) => setEditForm({ ...editForm, floorCount: e.target.value })}
                        />
                        <Button type="submit">Kaydet</Button>
                        <Button type="button" variant="secondary" onClick={() => setEditingBuildingId(null)}>
                          Vazgeç
                        </Button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={building.id}>
                    <td>{building.name}</td>
                    <td>{building.floorCount ?? '-'}</td>
                    <td>
                      <div className="row">
                        <Link to={`/buildings/${building.id}/flats`}>Daireleri Gör</Link>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(building)}>
                          Düzenle
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(building.id, building.name)}>
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
