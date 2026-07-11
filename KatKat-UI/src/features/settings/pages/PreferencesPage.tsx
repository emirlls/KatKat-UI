import { useState } from 'react';
import { Card } from '../../../components/Card';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import { userPreferenceService } from '../services/userPreferenceService';

export function PreferencesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: preference, error, loading } = useAsync(() => userPreferenceService.getMine(), [refreshKey]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function toggle() {
    if (!preference) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await userPreferenceService.setMine({
        receiveNeighborRequestNotifications: !preference.receiveNeighborRequestNotifications,
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Bildirim Ayarları</h1>
      </div>
      <Card className="stack">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {saveError && <ErrorBanner message={saveError} />}
        {preference && (
          <label className="row">
            <input
              type="checkbox"
              checked={preference.receiveNeighborRequestNotifications}
              disabled={isSaving}
              onChange={toggle}
            />
            Komşu yardım taleplerinde bildirim al
            {isSaving && <Spinner />}
          </label>
        )}
      </Card>
    </div>
  );
}
