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
              {buildings.map((building) => (
                <tr key={building.id}>
                  <td>{building.name}</td>
                  <td>{building.floorCount ?? '-'}</td>
                  <td>
                    <Link to={`/buildings/${building.id}/flats`}>Daireleri Gör</Link>
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
