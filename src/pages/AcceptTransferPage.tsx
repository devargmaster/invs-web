import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService';
import { setToken } from '../services/apiClient';
import { ApiError } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { TransferPublicDetail } from '../types/tickets';
import './AcceptTransferPage.css';

export function AcceptTransferPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [detail, setDetail] = useState<TransferPublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) return;
    ticketsService.getTransferByToken(token)
      .then(setDetail)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Esta invitación no es válida.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading || loading) return <LoadingSpinner text="Cargando invitación..." />;

  if (error || !detail || !token) {
    return (
      <div className="accept-transfer-page">
        <div className="accept-transfer-page__card">
          <ErrorBanner message={error ?? 'Invitación no encontrada.'} />
        </div>
      </div>
    );
  }

  const emailMatches = isAuthenticated && user?.email.trim().toLowerCase() === detail.toEmail;

  const handleAcceptLoggedIn = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await ticketsService.acceptTransfer(token);
      navigate('/entradas', { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al aceptar la entrada.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await ticketsService.registerAndAcceptTransfer(token, fullName, password);
      setToken(res.accessToken);
      // Recarga completa para que el AuthContext detecte la sesión nueva
      window.location.href = '/entradas';
    } catch (e2) {
      setError(e2 instanceof ApiError ? e2.message : 'Error al crear la cuenta.');
      setSubmitting(false);
    }
  };

  return (
    <div className="accept-transfer-page">
      <div className="accept-transfer-page__card">
        <span className="accept-transfer-page__brand">INVS</span>
        <h1 className="accept-transfer-page__title">
          {detail.fromUserName} te compartió una entrada
        </h1>
        <p className="accept-transfer-page__event">{detail.eventTitle}</p>
        <p className="accept-transfer-page__category">Categoría: {detail.categoryName}</p>

        {error && <ErrorBanner message={error} />}

        {isAuthenticated ? (
          emailMatches ? (
            <button className="accept-transfer-page__submit" onClick={handleAcceptLoggedIn} disabled={submitting}>
              {submitting ? <span className="accept-transfer-page__spinner" /> : 'Aceptar entrada'}
            </button>
          ) : (
            <div className="accept-transfer-page__notice">
              Esta invitación es para <b>{detail.toEmail}</b>, no para tu cuenta actual ({user?.email}).
              Cerrá sesión e ingresá con ese email para aceptarla.
            </div>
          )
        ) : detail.recipientHasAccount ? (
          <div className="accept-transfer-page__notice">
            El email <b>{detail.toEmail}</b> ya tiene una cuenta en INVS.
            <Link to="/login" className="accept-transfer-page__link">Iniciá sesión</Link> para aceptar la entrada.
          </div>
        ) : (
          <form onSubmit={handleRegisterAndAccept}>
            <p className="accept-transfer-page__hint">
              Creá tu cuenta con <b>{detail.toEmail}</b> para aceptar la entrada.
            </p>
            <label className="accept-transfer-page__label">Nombre completo</label>
            <input
              className="accept-transfer-page__input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
              required
            />
            <label className="accept-transfer-page__label">Contraseña</label>
            <input
              type="password"
              className="accept-transfer-page__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              minLength={8}
              required
            />
            <button type="submit" className="accept-transfer-page__submit" disabled={submitting}>
              {submitting ? <span className="accept-transfer-page__spinner" /> : 'Crear cuenta y aceptar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
