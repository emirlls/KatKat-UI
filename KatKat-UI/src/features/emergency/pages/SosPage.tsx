import { useCallback, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { useComplexGroup, useHubEvent } from '../../../hooks/useSignalR';
import { ApiError } from '../../../services/api';
import { KatKatHubEvents } from '../../../services/signalr-service';
import { SosStatusLabels } from '../../../types/enums';
import { sosAlertService } from '../services/sosAlertService';

const MY_FLAT_ID_KEY = 'katkat.myFlatId';

export function SosPage() {
  const { activeComplexId } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);
  const [myFlatId, setMyFlatId] = useState(() => localStorage.getItem(MY_FLAT_ID_KEY) ?? '');
  const [reportError, setReportError] = useState<string | null>(null);

  useComplexGroup(activeComplexId ?? undefined);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);
  useHubEvent(KatKatHubEvents.SosAlert, bump);
  useHubEvent(KatKatHubEvents.SosAlertResolved, bump);

  const {
    data: alerts,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? sosAlertService.getActiveByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  function persistMyFlatId(value: string) {
    setMyFlatId(value);
    localStorage.setItem(MY_FLAT_ID_KEY, value);
  }

  async function report(status: 0 | 1) {
    if (!activeComplexId || !myFlatId) {
      setReportError('Önce daire ID’nizi girin.');
      return;
    }
    setReportError(null);
    try {
      await sosAlertService.report({ complexId: activeComplexId, flatId: myFlatId, status });
      bump();
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : 'Durum bildirilemedi.');
    }
  }

  async function handleResolve(id: string) {
    try {
      await sosAlertService.resolve(id);
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
        <h1>SOS / Kriz Modu</h1>
      </div>

      <Card className="stack">
        <h2>Durumumu Bildir</h2>
        <Input
          label="Daire ID'm"
          value={myFlatId}
          onChange={(e) => persistMyFlatId(e.target.value)}
          placeholder="Daire GUID'i"
        />
        {reportError && <ErrorBanner message={reportError} />}
        <div className="row">
          <Button variant="secondary" onClick={() => report(0)}>
            Güvendeyim
          </Button>
          <Button variant="danger" onClick={() => report(1)}>
            Yardım Lazım
          </Button>
        </div>
      </Card>

      <Card className="stack">
        <h2>Canlı Kat Matrisi</h2>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {alerts && alerts.length === 0 && <EmptyState message="Aktif bir uyarı yok." />}
        <div className="stack">
          {alerts?.map((alert) => (
            <div key={alert.id} className="row page-header">
              <div>
                <span>Daire: {alert.flatNumber}</span>{' '}
                <Badge tone={alert.status === 1 ? 'danger' : 'success'}>{SosStatusLabels[alert.status]}</Badge>
              </div>
              {alert.status === 1 && !alert.resolvedAt && (
                <Button size="sm" variant="secondary" onClick={() => handleResolve(alert.id)}>
                  Yardım Ulaştı
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
