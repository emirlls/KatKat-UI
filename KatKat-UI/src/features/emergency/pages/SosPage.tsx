import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Select } from '../../../components/Select';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useToast } from '../../../context/ToastContext';
import { useAsync } from '../../../hooks/useAsync';
import { usePermission } from '../../../hooks/usePermission';
import { useComplexGroup, useHubEvent } from '../../../hooks/useSignalR';
import { ApiError } from '../../../services/api';
import { KatKatHubEvents } from '../../../services/signalr-service';
import { SosStatusLabels } from '../../../types/enums';
import { Permissions } from '../../../types/permissions';
import { flatService } from '../../management/services/flatService';
import { sosAlertService } from '../services/sosAlertService';

export function SosPage() {
  const { activeComplexId } = useActiveComplex();
  const { hasPermission } = usePermission();
  const { showToast } = useToast();
  const canMarkHelpArrived = hasPermission(Permissions.SosAlerts.Resolve);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportError, setReportError] = useState<string | null>(null);

  useComplexGroup(activeComplexId ?? undefined);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);
  useHubEvent(KatKatHubEvents.SosAlert, bump);
  useHubEvent(KatKatHubEvents.SosAlertResolved, bump);

  const { data: myFlats } = useAsync(
    () => (activeComplexId ? flatService.getMyFlats(activeComplexId) : Promise.resolve([])),
    [activeComplexId],
  );

  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFlatId(myFlats && myFlats.length === 1 ? myFlats[0].id : null);
  }, [myFlats]);

  const {
    data: alerts,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? sosAlertService.getActiveByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  async function report(status: 0 | 1) {
    if (!activeComplexId || !selectedFlatId) {
      setReportError('Daireniz belirlenemedi.');
      return;
    }
    setReportError(null);
    try {
      await sosAlertService.report({ complexId: activeComplexId, flatId: selectedFlatId, status });
      bump();
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : 'Durum bildirilemedi.');
    }
  }

  async function handleResolve(id: string) {
    try {
      await sosAlertService.resolve(id);
      bump();
      showToast('Sakinin durumu "yardım ulaştı" olarak işaretlendi.', 'success');
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
        {myFlats && myFlats.length === 0 && (
          <EmptyState message="Bu sitede bir daireniz bulunmuyor. Bina yöneticinizden sizi bir daireye eklemesini isteyin." />
        )}
        {myFlats && myFlats.length === 1 && (
          <p>
            Daireniz: <strong>{myFlats[0].flatNumber}</strong>
          </p>
        )}
        {myFlats && myFlats.length > 1 && (
          <Select
            label="Daireniz"
            value={selectedFlatId ?? ''}
            onChange={(e) => setSelectedFlatId(e.target.value || null)}
          >
            <option value="">Seçiniz</option>
            {myFlats.map((flat) => (
              <option key={flat.id} value={flat.id}>
                Daire {flat.flatNumber}
              </option>
            ))}
          </Select>
        )}
        {reportError && <ErrorBanner message={reportError} />}
        <div className="row">
          <Button variant="secondary" disabled={!selectedFlatId} onClick={() => report(0)}>
            Güvendeyim
          </Button>
          <Button variant="danger" disabled={!selectedFlatId} onClick={() => report(1)}>
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
              {canMarkHelpArrived && alert.status === 1 && (
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
