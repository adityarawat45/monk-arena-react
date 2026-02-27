import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useUserStore from './stores/useUserStore';

// Pages
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import LeaderboardPage from './pages/LeaderboardPage';

/**
 * AuthGate – mirrors authgate.dart
 * - No session  → AuthPage (landing)
 * - Session + no profile → ProfileSetupPage
 * - Session + profile    → DashboardPage (or whichever route is requested)
 */
function AuthGate({ children }) {
  const { user, profile, loading } = useUserStore();

  if (loading) {
    return (
      <div className="page-gradient flex items-center justify-center min-h-dvh">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!profile?.username || !profile?.age) return <Navigate to="/setup" replace />;

  return children;
}

function AppRoutes() {
  const { user, profile, loading, initAuth } = useUserStore();

  // Initialise auth listener once on mount
  useEffect(() => {
    const unsub = initAuth();
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      {/* OAuth callback – must be reachable without auth */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Public: login page */}
      <Route
        path="/auth"
        element={
          !loading && user && profile?.username ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Profile setup – needs a user but no completed profile */}
      <Route
        path="/setup"
        element={
          !loading && !user ? (
            <Navigate to="/auth" replace />
          ) : (
            <ProfileSetupPage />
          )
        }
      />

      {/* Protected routes */}
      <Route path="/" element={<AuthGate><DashboardPage /></AuthGate>} />
      <Route path="/rooms" element={<AuthGate><RoomsPage /></AuthGate>} />
      <Route path="/rooms/:roomId" element={<AuthGate><RoomDetailPage /></AuthGate>} />
      <Route path="/notifications" element={<AuthGate><NotificationsPage /></AuthGate>} />
      <Route path="/leaderboard" element={<AuthGate><LeaderboardPage /></AuthGate>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
