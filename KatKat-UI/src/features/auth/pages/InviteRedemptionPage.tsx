import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../services/api';
import { residentInvitationService } from '../../management/services/residentInvitationService';

export function InviteRedemptionPage() {
  const { code } = useParams<{ code: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', name: '', surname: '', email: '', phoneNumber: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await residentInvitationService.redeem({ code, ...form });
      await login(form.userName, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kayıt tamamlanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!code) {
    return (
      <AuthLayout>
        <ErrorBanner message="Geçersiz davet linki." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="stack" onSubmit={handleSubmit}>
        <h2>Daire Sakini Kaydı</h2>
        {error && <ErrorBanner message={error} />}
        <Input
          label="Ad"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoComplete="given-name"
          required
        />
        <Input
          label="Soyad"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
          autoComplete="family-name"
          required
        />
        <Input
          label="Kullanıcı Adı"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          autoComplete="username"
          required
        />
        <Input
          label="E-posta"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
        <Input
          label="Telefon"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          autoComplete="tel"
          required
        />
        <Input
          label="Parola"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor…' : 'Kaydı Tamamla'}
        </Button>
      </form>
    </AuthLayout>
  );
}
