import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
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
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/complexes" element={<ComplexPage />} />
          <Route path="/buildings" element={<BuildingsPage />} />
          <Route path="/buildings/:buildingId/flats" element={<FlatsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/p2p-requests" element={<P2PRequestsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
