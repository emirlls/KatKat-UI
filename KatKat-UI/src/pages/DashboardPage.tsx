import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { useActiveComplex } from '../context/ActiveComplexContext';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { Permissions } from '../types/permissions';

interface Shortcut {
  to: string;
  title: string;
  description: string;
  /** Shown only if the user holds this permission; omit for everyone. */
  permission?: string;
}

const SHORTCUTS: Shortcut[] = [
  { to: '/leaderboard', title: 'Liderlik Tablosu', description: 'KatKat Score sıralamalarını ve yakın çevre haritasını gör.' },
  { to: '/complexes', title: 'Sitem', description: 'Siteni oluştur, düzenle, aboneliği uzat.', permission: Permissions.Complexes.Create },
  { to: '/expenses', title: 'Giderler', description: 'Ortak giderleri ve daire paylarını takip et.' },
  { to: '/issues', title: 'Arızalar', description: 'Arıza bildir, işleme al, çözüldü olarak işaretle.' },
  { to: '/p2p-requests', title: 'Komşu Talepleri', description: 'Anlık yardımlaşma taleplerini gör ve karşıla.' },
  { to: '/reservations', title: 'Rezervasyonlar', description: 'Otopark ve ortak alan rezervasyonu yap.' },
  { to: '/sos', title: 'SOS', description: 'Kriz anında durum bildir ve kat matrisini izle.' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { activeComplexId } = useActiveComplex();
  const isAdmin = user?.roles.includes('admin') ?? false;
  const canManageComplex = hasPermission(Permissions.Complexes.Create);

  const shortcuts = SHORTCUTS.filter((s) => !s.permission || hasPermission(s.permission));

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Hoş geldin, {user?.userName}</h1>
      </div>
      {isAdmin && (
        <Card>
          <p>
            Yönetici hesabı oluşturmak için <Link to="/admin/managers">Yöneticiler</Link> sayfasına git.
          </p>
        </Card>
      )}
      {canManageComplex && !activeComplexId && (
        <Card>
          <p>
            Henüz bir site oluşturmadın. Başlamak için <Link to="/complexes">Sitem</Link> sayfasından siteni oluştur.
          </p>
        </Card>
      )}
      <div className="stack">
        {shortcuts.map((shortcut) => (
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
