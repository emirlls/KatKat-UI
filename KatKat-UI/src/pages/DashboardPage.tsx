import { Link, Navigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { useActiveComplex } from '../context/ActiveComplexContext';
import { useAuth } from '../hooks/useAuth';

const SHORTCUTS = [
  { to: '/leaderboard', title: 'Liderlik Tablosu', description: 'KatKat Score sıralamalarını ve yakın çevre haritasını gör.' },
  { to: '/complexes', title: 'Siteler', description: 'Site oluştur, düzenle, aboneliği uzat.' },
  { to: '/expenses', title: 'Giderler', description: 'Ortak gider ekle ve daire paylarını takip et.' },
  { to: '/issues', title: 'Arızalar', description: 'Arıza bildir, işleme al, çözüldü olarak işaretle.' },
  { to: '/p2p-requests', title: 'Komşu Talepleri', description: 'Anlık yardımlaşma taleplerini gör ve karşıla.' },
  { to: '/reservations', title: 'Rezervasyonlar', description: 'Otopark ve ortak alan rezervasyonu yap.' },
  { to: '/sos', title: 'SOS', description: 'Kriz anında durum bildir ve kat matrisini izle.' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { activeComplexId } = useActiveComplex();

  if (user?.roles.includes('admin')) {
    return <Navigate to="/admin/managers" replace />;
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Hoş geldin, {user?.userName}</h1>
      </div>
      {!activeComplexId && (
        <Card>
          <p>
            Henüz bir site oluşturmadın. Başlamak için <Link to="/complexes">Sitem</Link> sayfasından siteni oluştur.
          </p>
        </Card>
      )}
      <div className="stack">
        {SHORTCUTS.map((shortcut) => (
          <Card key={shortcut.to}>
            <Link to={shortcut.to}>
              <h3>{shortcut.title}</h3>
            </Link>
            <p>{shortcut.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
