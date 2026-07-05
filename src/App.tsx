import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketsPage } from './pages/TicketsPage';
import { ScannerPage } from './pages/ScannerPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — inside Layout with bottom tabs */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/eventos/:id" element={<EventDetailPage />} />
            <Route path="/entradas" element={<TicketsPage />} />
            <Route path="/staff/scanner" element={<ScannerPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/eventos" replace />} />
          <Route path="*" element={<Navigate to="/eventos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
