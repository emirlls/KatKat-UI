import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/Button';
import { useActiveComplex } from '../context/ActiveComplexContext';
import { useAuth } from '../hooks/useAuth';
import './layouts.css';

const NAV_ITEMS = [
  { to: '/', label: 'Panel', end: true },
  { to: '/leaderboard', label: 'Liderlik Tablosu' },
  { to: '/complexes', label: 'Sitem' },
  { to: '/buildings', label: 'Bloklar & Daireler' },
  { to: '/expenses', label: 'Giderler' },
  { to: '/issues', label: 'Arızalar' },
  { to: '/p2p-requests', label: 'Komşu Talepleri' },
  { to: '/reservations', label: 'Rezervasyonlar' },
  { to: '/sos', label: 'SOS' },
  { to: '/preferences', label: 'Bildirim Ayarları' },
];

// Admin is a host-level superuser with no site of their own - their only job here is
// provisioning Managers, so they get a dedicated nav instead of a mostly-empty version of
// everyone else's site-scoped pages.
const ADMIN_NAV_ITEMS = [{ to: '/admin/managers', label: 'Yöneticiler', end: false }];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { activeComplexId, activeComplexName } = useActiveComplex();
  const isAdmin = user?.roles.includes('admin') ?? false;

  const navItems = isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <div className="app-shell">
      <nav className="app-sidebar">
        <div className="brand">KatKat</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="app-main">
        <header className="app-header">
          {!isAdmin && (
            <span className="badge">
              {activeComplexId ? `Site: ${activeComplexName ?? activeComplexId}` : 'Henüz bir site oluşturulmadı'}
            </span>
          )}
          <div className="row">
            <span>{user?.userName}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Çıkış Yap
            </Button>
          </div>
        </header>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
