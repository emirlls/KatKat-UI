import { useState, type FormEvent } from 'react';
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
import { ApiError } from '../../../services/api';
import { IssueStatusLabels } from '../../../types/enums';
import { issueService } from '../services/issueService';

export function IssuesPage() {
  const { activeComplexId } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: issues,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? issueService.listByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId) return;
    setCreateError(null);
    try {
      await issueService.create({ complexId: activeComplexId, title, description: description || undefined });
      setTitle('');
      setDescription('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Arıza bildirilemedi.');
    }
  }

  async function handleStartProgress(id: string) {
    try {
      await issueService.startProgress(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'İşlem başarısız.');
    }
  }

  async function handleResolve(id: string) {
    try {
      await issueService.resolve(id);
      setRefreshKey((k) => k + 1);
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
        <h1>Arızalar</h1>
      </div>

      <Card className="stack">
        <h2>Arıza Bildir</h2>
        <form className="stack" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <Button type="submit">Bildir</Button>
          </div>
        </form>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {issues && issues.length === 0 && <EmptyState message="Henüz arıza bildirilmemiş." />}
      <div className="stack">
        {issues?.map((issue) => (
          <Card key={issue.id} className="page-header">
            <div>
              <strong>{issue.title}</strong>
              {issue.description && <p>{issue.description}</p>}
              <Badge tone={issue.statuses === 2 ? 'success' : issue.statuses === 1 ? 'default' : 'danger'}>
                {IssueStatusLabels[issue.statuses]}
              </Badge>
            </div>
            <div className="row">
              {issue.statuses === 0 && (
                <Button size="sm" variant="secondary" onClick={() => handleStartProgress(issue.id)}>
                  İşleme Al
                </Button>
              )}
              {issue.statuses === 1 && (
                <Button size="sm" variant="secondary" onClick={() => handleResolve(issue.id)}>
                  Çözüldü
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
