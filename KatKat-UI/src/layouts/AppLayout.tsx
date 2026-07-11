import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/Button';
import { useActiveComplex } from '../context/ActiveComplexContext';
import { useAuth } from '../hooks/useAuth';
import './layouts.css';

const NAV_ITEMS = [
  { to: '/', label: 'Panel', end: true },
  { to: '/leaderboard', label: 'Liderlik Tablosu' },
  { to: '/complexes', label: 'Siteler' },
  { to: '/buildings', label: 'Bloklar & Daireler' },
  { to: '/expenses', label: 'Giderler' },
  { to: '/issues', label: 'Arızalar' },
  { to: '/p2p-requests', label: 'Komşu Talepleri' },
  { to: '/reservations', label: 'Rezervasyonlar' },
  { to: '/sos', label: 'SOS' },
  { to: '/preferences', label: 'Bildirim Ayarları' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { activeComplexId, activeComplexName } = useActiveComplex();

  return (
    <div className="app-shell">
      <nav className="app-sidebar">
        <div className="brand">KatKat</div>
        {NAV_ITEMS.map((item) => (
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
          <span className="badge">{activeComplexId ? `Aktif Site: ${activeComplexName ?? activeComplexId}` : 'Site seçilmedi'}</span>
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
