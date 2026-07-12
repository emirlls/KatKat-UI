import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { ApiError } from '../../../services/api';
import { managerService } from '../services/managerService';

export function ManagersPage() {
  const [form, setForm] = useState({ userName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsCreating(true);
    try {
      await managerService.create(form);
      setMessage(`"${form.userName}" yönetici hesabı oluşturuldu.`);
      setForm({ userName: '', email: '', password: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yönetici oluşturulamadı.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Yöneticiler</h1>
      </div>

      <Card className="stack">
        <h2>Yeni Yönetici Ekle</h2>
        <p>Her yönetici kendi sitesini yönetir; siteleri ve daireleri diğer yöneticilerden tamamen ayrıdır.</p>
        <form className="stack" onSubmit={handleCreate}>
          {error && <ErrorBanner message={error} />}
          {message && <p>{message}</p>}
          <Input
            label="Kullanıcı Adı"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
            required
          />
          <Input
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Şifre"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Oluşturuluyor…' : 'Yönetici Oluştur'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
