import { useCallback, useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useComplexGroup, useHubEvent } from '../../../hooks/useSignalR';
import { ApiError } from '../../../services/api';
import { KatKatHubEvents } from '../../../services/signalr-service';
import { ReservationStatusLabels, ResourceTypeLabels } from '../../../types/enums';
import { Permissions } from '../../../types/permissions';
import type { ResourceReservationDto } from '../../../types/resource';
import { reservationService } from '../services/reservationService';
import { resourceService } from '../services/resourceService';

// Mirrors the backend ReservationStatus enum.
const RESERVATION_STATUS = { Confirmed: 0, Cancelled: 1, Pending: 2, Rejected: 3 } as const;

function statusTone(status: number): 'success' | 'default' | 'danger' {
  if (status === RESERVATION_STATUS.Confirmed) return 'success';
  if (status === RESERVATION_STATUS.Pending) return 'default';
  return 'danger';
}

function ResourceReservations({
  resourceId,
  refreshKey,
  canApprove,
  currentUserId,
}: {
  resourceId: string;
  refreshKey: number;
  canApprove: boolean;
  currentUserId: string | undefined;
}) {
  const [localRefresh, setLocalRefresh] = useState(0);
  const {
    data: reservations,
    error,
    loading,
  } = useAsync(() => reservationService.listByResource(resourceId), [resourceId, refreshKey, localRefresh]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    try {
      await reservationService.create({ resourceId, startTime, endTime });
      setStartTime('');
      setEndTime('');
      setLocalRefresh((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Rezervasyon oluşturulamadı.');
    }
  }

  async function runAction(action: () => Promise<unknown>) {
    try {
      await action();
      setLocalRefresh((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız.');
    }
  }

  function handleReject(reservationId: string) {
    const reason = window.prompt('Reddetme sebebini yazın:');
    if (!reason) return;
    void runAction(() => reservationService.reject(reservationId, { reason }));
  }

  return (
    <div className="stack">
      <form className="row" onSubmit={handleCreate}>
        {createError && <ErrorBanner message={createError} />}
        <Input
          label="Başlangıç"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input label="Bitiş" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        <Button type="submit">Rezerve Et</Button>
      </form>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {reservations && reservations.length === 0 && <EmptyState message="Rezervasyon yok." />}
      {reservations && reservations.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Sakin</th>
              <th>Başlangıç</th>
              <th>Bitiş</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation: ResourceReservationDto) => {
              const isOwner = currentUserId != null && reservation.reservedByUserId === currentUserId;
              const isPending = reservation.status === RESERVATION_STATUS.Pending;
              const isConfirmed = reservation.status === RESERVATION_STATUS.Confirmed;
              return (
                <tr key={reservation.id}>
                  <td>
                    {reservation.buildingName && reservation.flatNumber
                      ? `${reservation.buildingName} - Daire ${reservation.flatNumber}`
                      : '-'}
                  </td>
                  <td>{new Date(reservation.startTime).toLocaleString('tr-TR')}</td>
                  <td>{new Date(reservation.endTime).toLocaleString('tr-TR')}</td>
                  <td>
                    <Badge tone={statusTone(reservation.status)}>{ReservationStatusLabels[reservation.status]}</Badge>
                    {reservation.rejectionReason && (
                      <div>
                        <small>Sebep: {reservation.rejectionReason}</small>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="row">
                      {canApprove && isPending && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => runAction(() => reservationService.approve(reservation.id))}>
                            Onayla
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleReject(reservation.id)}>
                            Reddet
                          </Button>
                        </>
                      )}
                      {isOwner && (isPending || isConfirmed) && (
                        <Button size="sm" variant="danger" onClick={() => runAction(() => reservationService.cancel(reservation.id))}>
                          İptal Et
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function ReservationsPage() {
  const { activeComplexId } = useActiveComplex();
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const canManageResources = hasPermission(Permissions.Resources.Create);
  const canApprove = hasPermission(Permissions.ResourceReservations.Approve);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(null);
  useComplexGroup(activeComplexId ?? undefined);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);
  useHubEvent(KatKatHubEvents.ResourceReservationCreated, bump);
  useHubEvent(KatKatHubEvents.ResourceReservationCancelled, bump);
  useHubEvent(KatKatHubEvents.ResourceReservationApproved, bump);
  useHubEvent(KatKatHubEvents.ResourceReservationRejected, bump);

  const {
    data: resources,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? resourceService.listByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  const [name, setName] = useState('');
  const [type, setType] = useState('0');
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreateResource(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId) return;
    setCreateError(null);
    try {
      await resourceService.create({ complexId: activeComplexId, name, type: Number(type) as 0 | 1 });
      setName('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Kaynak oluşturulamadı.');
    }
  }

  if (!activeComplexId) {
    return (
      <div className="page">
        <EmptyState message="Bu hesaba bağlı bir site bulunamadı." />
      </div>
    );
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Otopark &amp; Ortak Alan Rezervasyonları</h1>
      </div>

      {canManageResources && (
        <Card className="stack">
          <h2>Yeni Kaynak Ekle</h2>
          <form className="row" onSubmit={handleCreateResource}>
            {createError && <ErrorBanner message={createError} />}
            <Input placeholder="Kaynak adı (örn. Misafir Otoparkı 3)" value={name} onChange={(e) => setName(e.target.value)} required />
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="0">{ResourceTypeLabels[0]}</option>
              <option value="1">{ResourceTypeLabels[1]}</option>
            </Select>
            <Button type="submit">Ekle</Button>
          </form>
        </Card>
      )}

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {resources && resources.length === 0 && <EmptyState message="Henüz kaynak eklenmemiş." />}
      <div className="stack">
        {resources?.map((resource) => (
          <Card key={resource.id} className="stack">
            <div className="page-header">
              <div>
                <strong>{resource.name}</strong> <Badge>{ResourceTypeLabels[resource.type]}</Badge>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setExpandedResourceId(expandedResourceId === resource.id ? null : resource.id)}
              >
                {expandedResourceId === resource.id ? 'Gizle' : 'Rezervasyonları Gör'}
              </Button>
            </div>
            {expandedResourceId === resource.id && (
              <ResourceReservations
                resourceId={resource.id}
                refreshKey={refreshKey}
                canApprove={canApprove}
                currentUserId={user?.id}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
