import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Spinner } from '../../../components/Spinner';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { ApiError } from '../../../services/api';
import { complexService } from '../../management/services/complexService';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { NearbyMap } from '../components/NearbyMap';
import { leaderboardService } from '../services/leaderboardService';

const DEFAULT_CENTER: [number, number] = [41.0082, 28.9784]; // İstanbul
const DEFAULT_RADIUS_KM = 5;
const RADIUS_DEBOUNCE_MS = 400;

type Tab = 'overall' | 'district' | 'neighborhood' | 'nearby';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overall', label: 'Şehrim' },
  { key: 'district', label: 'İlçe Bazlı' },
  { key: 'neighborhood', label: 'Mahalle Bazlı' },
  { key: 'nearby', label: 'Yakınımdakiler (Harita)' },
];

function OverallTab() {
  const { activeComplexCityId } = useActiveComplex();
  const { data, error, loading } = useAsync(
    () => (activeComplexCityId ? leaderboardService.getLeaderboard(activeComplexCityId) : Promise.resolve(null)),
    [activeComplexCityId],
  );
  if (!activeComplexCityId) {
    return <EmptyState message="Bu liderlik tablosunu görebilmek için bir siteniz olmalı." />;
  }
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  return <LeaderboardTable entries={data ?? []} />;
}

function DistrictTab() {
  const { data, error, loading } = useAsync(() => leaderboardService.getAllDistrictLeaderboards(), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.length === 0) return <EmptyState message="Henüz puanlanmış ilçe yok." />;
  return (
    <div className="stack">
      {data.map((group) => (
        <Card key={group.district.id} className="stack">
          <h3>{group.district.name}</h3>
          <LeaderboardTable entries={group.entries} />
        </Card>
      ))}
    </div>
  );
}

function NeighborhoodTab() {
  const { data, error, loading } = useAsync(() => leaderboardService.getAllNeighborhoodLeaderboards(), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.length === 0) return <EmptyState message="Henüz puanlanmış mahalle yok." />;
  return (
    <div className="stack">
      {data.map((group) => (
        <Card key={`${group.district.id}-${group.neighborhood.id}`} className="stack">
          <h3>
            {group.neighborhood.name} <small>({group.district.name})</small>
          </h3>
          <LeaderboardTable entries={group.entries} />
        </Card>
      ))}
    </div>
  );
}

function NearbyTab() {
  const { activeComplexId, setActiveComplex } = useActiveComplex();
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  const { data: activeComplex } = useAsync(async () => {
    if (!activeComplexId) return null;
    try {
      return await complexService.get(activeComplexId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setActiveComplex(null);
        return null;
      }
      throw err;
    }
  }, [activeComplexId]);

  const center: [number, number] = activeComplex ? [activeComplex.latitude, activeComplex.longitude] : DEFAULT_CENTER;
  // Dragging the slider fires onChange on every tick; debounce so it settles into ONE request
  // per pause instead of one per pixel (which otherwise trips the per-endpoint rate limit).
  const debouncedRadiusKm = useDebouncedValue(radiusKm, RADIUS_DEBOUNCE_MS);

  const { data, error, loading } = useAsync(
    () => leaderboardService.getNearbyLeaderboard(center[0], center[1], debouncedRadiusKm),
    [center[0], center[1], debouncedRadiusKm],
  );

  return (
    <div className="stack">
      {!activeComplexId && (
        <ErrorBanner message="Aktif bir site seçilmedi - İstanbul merkezli varsayılan konum kullanılıyor." />
      )}
      <div className="field">
        <label htmlFor="radius">Arama Yarıçapı: {radiusKm} km</label>
        <input
          id="radius"
          type="range"
          min={1}
          max={50}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
        />
      </div>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {data && (
        <NearbyMap
          center={center}
          entries={data}
          selfComplex={activeComplex ? { id: activeComplex.id, name: activeComplex.name, latitude: activeComplex.latitude, longitude: activeComplex.longitude } : null}
        />
      )}
      {data && <LeaderboardTable entries={data} />}
    </div>
  );
}

export function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('overall');
  const [recalcKey, setRecalcKey] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [recalcMessage, setRecalcMessage] = useState<string | null>(null);

  async function handleRecalculate() {
    setIsRecalculating(true);
    setRecalcError(null);
    setRecalcMessage(null);
    try {
      await complexService.recalculateScores();
      setRecalcMessage('Puanlar yeniden hesaplandı.');
      setRecalcKey((k) => k + 1);
    } catch (err) {
      setRecalcError(err instanceof ApiError ? err.message : 'Puanlar hesaplanamadı.');
    } finally {
      setIsRecalculating(false);
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>KatKat Score Liderlik Tablosu</h1>
        <Button variant="secondary" size="sm" onClick={handleRecalculate} disabled={isRecalculating}>
          {isRecalculating ? 'Hesaplanıyor…' : 'Şimdi Hesapla'}
        </Button>
      </div>
      {recalcError && <ErrorBanner message={recalcError} />}
      {recalcMessage && <p>{recalcMessage}</p>}
      <div className="row">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card key={recalcKey}>
        {tab === 'overall' && <OverallTab />}
        {tab === 'district' && <DistrictTab />}
        {tab === 'neighborhood' && <NeighborhoodTab />}
        {tab === 'nearby' && <NearbyTab />}
      </Card>
    </div>
  );
}
