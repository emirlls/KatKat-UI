import { Navigate, Route, Routes } from 'react-router-dom';
import { AllSitesPage } from '../features/admin/pages/AllSitesPage';
import { ManagersPage } from '../features/admin/pages/ManagersPage';
import { InviteRedemptionPage } from '../features/auth/pages/InviteRedemptionPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SosPage } from '../features/emergency/pages/SosPage';
import { LeaderboardPage } from '../features/gamification/pages/LeaderboardPage';
import { BuildingsPage } from '../features/management/pages/BuildingsPage';
import { ComplexPage } from '../features/management/pages/ComplexPage';
import { ExpensesPage } from '../features/management/pages/ExpensesPage';
import { FlatsPage } from '../features/management/pages/FlatsPage';
import { IssuesPage } from '../features/management/pages/IssuesPage';
import { ReservationsPage } from '../features/reservation/pages/ReservationsPage';
import { PreferencesPage } from '../features/settings/pages/PreferencesPage';
import { P2PRequestsPage } from '../features/solidarity/pages/P2PRequestsPage';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Permissions } from '../types/permissions';
import { AdminRoute } from './AdminRoute';
import { PermissionRoute } from './PermissionRoute';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:code" element={<InviteRedemptionPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* Site management is manager-only; a resident deep-linking these is redirected home. */}
          <Route element={<PermissionRoute permission={Permissions.Complexes.Update} />}>
            <Route path="/complexes" element={<ComplexPage />} />
          </Route>
          <Route element={<PermissionRoute permission={Permissions.Buildings.Create} />}>
            <Route path="/buildings" element={<BuildingsPage />} />
            <Route path="/buildings/:buildingId/flats" element={<FlatsPage />} />
          </Route>
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/p2p-requests" element={<P2PRequestsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/managers" element={<ManagersPage />} />
            <Route path="/admin/sites" element={<AllSitesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
