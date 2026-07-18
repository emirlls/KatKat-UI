import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/Button';
import { useActiveComplex } from '../context/ActiveComplexContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { Permissions } from '../types/permissions';
import './layouts.css';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  /** Shown only if the user holds this permission (managers/admin). Omit for everyone. */
  permission?: string;
  /** Shown only to the host "admin" superuser. */
  adminOnly?: boolean;
}

// One nav list for everyone; visibility is decided per item by permission/role so each role sees
// exactly the pages it can use. Admin holds every permission, so it sees the whole list.
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Panel', end: true },
  { to: '/leaderboard', label: 'Liderlik Tablosu' },
  { to: '/complexes', label: 'Sitem', permission: Permissions.Complexes.Update },
  { to: '/buildings', label: 'Bloklar & Daireler', permission: Permissions.Buildings.Create },
  { to: '/expenses', label: 'Giderler' },
  { to: '/issues', label: 'Arızalar' },
  { to: '/p2p-requests', label: 'Komşu Talepleri' },
  { to: '/reservations', label: 'Rezervasyonlar' },
  { to: '/sos', label: 'SOS' },
  { to: '/preferences', label: 'Bildirim Ayarları' },
  { to: '/admin/managers', label: 'Yöneticiler', adminOnly: true },
  { to: '/admin/sites', label: 'Tüm Siteler', adminOnly: true },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermission();
  const { activeComplexId, activeComplexName } = useActiveComplex();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.roles.includes('admin') ?? false;

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

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
          {activeComplexId ? (
            <span className="badge">Site: {activeComplexName ?? activeComplexId}</span>
          ) : (
            !isAdmin && <span className="badge">Henüz bir site oluşturulmadı</span>
          )}
          <div className="row">
            <span>{user?.userName}</span>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? 'Koyu Tema' : 'Açık Tema'}
            </Button>
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
