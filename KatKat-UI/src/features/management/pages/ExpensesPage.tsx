import { useState, type FormEvent } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Spinner } from '../../../components/Spinner';
import { Textarea } from '../../../components/Textarea';
import { useActiveComplex } from '../../../context/ActiveComplexContext';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import { ExpenseDistributionModeLabels } from '../../../types/enums';
import { expenseService } from '../services/expenseService';

function ExpenseShares({ expenseId }: { expenseId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: shares, error, loading } = useAsync(() => expenseService.getSharesByExpense(expenseId), [
    expenseId,
    refreshKey,
  ]);

  async function handlePay(shareId: string) {
    try {
      await expenseService.payShare(shareId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Ödeme kaydedilemedi.');
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!shares || shares.length === 0) return <EmptyState message="Pay bulunamadı." />;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Daire</th>
          <th>Tutar</th>
          <th>Durum</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {shares.map((share) => (
          <tr key={share.id}>
            <td>{share.flatNumber}</td>
            <td>{share.amount.toFixed(2)} ₺</td>
            <td>
              <Badge tone={share.isPaid ? 'success' : 'danger'}>{share.isPaid ? 'Ödendi' : 'Bekliyor'}</Badge>
            </td>
            <td>
              {!share.isPaid && (
                <Button size="sm" variant="secondary" onClick={() => handlePay(share.id)}>
                  Öde
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExpensesPage() {
  const { activeComplexId } = useActiveComplex();
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  const {
    data: expenses,
    error,
    loading,
  } = useAsync(
    () => (activeComplexId ? expenseService.listByComplex(activeComplexId) : Promise.resolve([])),
    [activeComplexId, refreshKey],
  );

  const [form, setForm] = useState({
    title: '',
    description: '',
    totalAmount: '',
    distributionModes: '0',
    issuedAt: new Date().toISOString().slice(0, 10),
  });
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!activeComplexId) return;
    setCreateError(null);
    try {
      await expenseService.create({
        complexId: activeComplexId,
        title: form.title,
        description: form.description || undefined,
        totalAmount: Number(form.totalAmount),
        distributionModes: Number(form.distributionModes) as 0 | 1,
        issuedAt: form.issuedAt,
      });
      setForm({ title: '', description: '', totalAmount: '', distributionModes: '0', issuedAt: form.issuedAt });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Gider oluşturulamadı.');
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
        <h1>Giderler</h1>
      </div>

      <Card className="stack">
        <h2>Yeni Gider Ekle</h2>
        <form className="stack" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input label="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea
            label="Açıklama"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="row">
            <Input
              label="Toplam Tutar"
              type="number"
              step="any"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              required
            />
            <Select
              label="Dağıtım Şekli"
              value={form.distributionModes}
              onChange={(e) => setForm({ ...form, distributionModes: e.target.value })}
            >
              <option value="0">{ExpenseDistributionModeLabels[0]}</option>
              <option value="1">{ExpenseDistributionModeLabels[1]}</option>
            </Select>
            <Input
              label="Tarih"
              type="date"
              value={form.issuedAt}
              onChange={(e) => setForm({ ...form, issuedAt: e.target.value })}
              required
            />
          </div>
          <div>
            <Button type="submit">Gider Ekle</Button>
          </div>
        </form>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {expenses && expenses.length === 0 && <EmptyState message="Henüz gider eklenmemiş." />}
      <div className="stack">
        {expenses?.map((expense) => (
          <Card key={expense.id} className="stack">
            <div className="page-header">
              <div>
                <strong>{expense.title}</strong> — {expense.totalAmount.toFixed(2)} ₺
                <div>
                  <Badge>{ExpenseDistributionModeLabels[expense.distributionModes]}</Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setExpandedExpenseId(expandedExpenseId === expense.id ? null : expense.id)}
              >
                {expandedExpenseId === expense.id ? 'Gizle' : 'Payları Gör'}
              </Button>
            </div>
            {expandedExpenseId === expense.id && <ExpenseShares expenseId={expense.id} />}
          </Card>
        ))}
      </div>
    </div>
  );
}
