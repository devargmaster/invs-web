import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketsPage } from './pages/TicketsPage';
import { ScannerPage } from './pages/ScannerPage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutCategoriesPage } from './pages/CheckoutCategoriesPage';
import { CheckoutAddonsPage } from './pages/CheckoutAddonsPage';
import { CheckoutSummaryPage } from './pages/CheckoutSummaryPage';
import { CheckoutPaymentCardPage } from './pages/CheckoutPaymentCardPage';
import { CheckoutTransferPage } from './pages/CheckoutTransferPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AcceptTransferPage } from './pages/AcceptTransferPage';

export default function App() {
  return (
    <AuthProvider>
      <CheckoutProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/transfers/:token" element={<AcceptTransferPage />} />

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
              <Route path="/eventos/:id/checkout" element={<CheckoutCategoriesPage />} />
              <Route path="/eventos/:id/checkout/adicionales" element={<CheckoutAddonsPage />} />
              <Route path="/eventos/:id/checkout/resumen" element={<CheckoutSummaryPage />} />
              <Route path="/checkout/pago/:orderId" element={<CheckoutPaymentCardPage />} />
              <Route path="/checkout/transferencia/:orderId" element={<CheckoutTransferPage />} />
              <Route path="/checkout/confirmacion/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/entradas" element={<TicketsPage />} />
              <Route path="/staff/scanner" element={<ScannerPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Route>

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/eventos" replace />} />
            <Route path="*" element={<Navigate to="/eventos" replace />} />
          </Routes>
        </BrowserRouter>
      </CheckoutProvider>
    </AuthProvider>
  );
}
