import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../services/api';
import { accountService } from '../services/accountService';

export function RegisterPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await accountService.register({ userName, email, password, isManager });
      await login(userName, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kayıt oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form className="stack" onSubmit={handleSubmit}>
        {error && <ErrorBanner message={error} />}
        <Input
          label="Kullanıcı Adı"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="E-posta"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Parola"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
        <label className="row">
          <input type="checkbox" checked={isManager} onChange={(e) => setIsManager(e.target.checked)} />
          Site yöneticisi olarak kayıt ol (site/blok/daire oluşturma yetkisi)
        </label>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kayıt olunuyor…' : 'Kayıt Ol'}
        </Button>
        <p>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
