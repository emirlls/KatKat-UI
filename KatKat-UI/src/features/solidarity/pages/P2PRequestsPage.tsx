import { useCallback, useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { Textarea } from '../../../components/Textarea';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { useComplexGroup, useHubEvent } from '../../../hooks/useSignalR';
import { ApiError } from '../../../services/api';
import { KatKatHubEvents } from '../../../services/signalr-service';
import { P2PRequestStatusLabels } from '../../../types/enums';
import type { P2PRequestDto } from '../../../types/p2pRequest';
import { p2pRequestService } from '../services/p2pRequestService';

export function P2PRequestsPage() {
  const { activeComplexId } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);
  useComplexGroup(activeComplexId ?? undefined);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);
  useHubEvent<P2PRequestDto>(KatKatHubEvents.P2PRequestCreated, bump);
  useHubEvent<P2PRequestDto>(KatKatHubEvents.P2PRequestFulfilled, bump);
  useHubEvent<P2PRequestDto>(KatKatHubEvents.P2PRequestCancelled, bump);

  const {
    data: requests,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? p2pRequestService.listByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [neededUntil, setNeededUntil] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId) return;
    setCreateError(null);
    try {
      await p2pRequestService.create({
        complexId: activeComplexId,
        title,
        description: description || undefined,
        neededUntil: neededUntil || undefined,
      });
      setTitle('');
      setDescription('');
      setNeededUntil('');
      bump();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Talep oluşturulamadı.');
    }
  }

  async function handleFulfill(id: string) {
    try {
      await p2pRequestService.fulfill(id);
      bump();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız.');
    }
  }

  async function handleCancel(id: string) {
    try {
      await p2pRequestService.cancel(id);
      bump();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız.');
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
        <h1>Komşu Talepleri</h1>
      </div>

      <Card className="stack">
        <h2>Yardım/İhtiyaç Talebi Oluştur</h2>
        <form className="stack" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input
            label="İhtiyacın Bitiş Zamanı (opsiyonel)"
            type="datetime-local"
            value={neededUntil}
            onChange={(e) => setNeededUntil(e.target.value)}
          />
          <div>
            <Button type="submit">Talep Oluştur</Button>
          </div>
        </form>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {requests && requests.length === 0 && <EmptyState message="Henüz açık bir talep yok." />}
      <div className="stack">
        {requests?.map((request) => (
          <Card key={request.id} className="page-header">
            <div>
              <strong>{request.title}</strong>
              {request.description && <p>{request.description}</p>}
              <Badge tone={request.status === 1 ? 'success' : request.status === 2 ? 'danger' : 'default'}>
                {P2PRequestStatusLabels[request.status]}
              </Badge>
            </div>
            {request.status === 0 && (
              <div className="row">
                <Button size="sm" variant="secondary" onClick={() => handleFulfill(request.id)}>
                  Karşılıyorum
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleCancel(request.id)}>
                  İptal Et
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
