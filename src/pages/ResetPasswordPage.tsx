import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import './LoginPage.css';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-page__bg-glow"></div>
        <div className="login-page__form">
          <div className="login-page__brand">
            <h1 className="login-page__logo">INVS</h1>
          </div>
          <ErrorBanner message="Este link no es válido. Pedí uno nuevo desde 'Olvidé mi contraseña'." />
          <p className="login-page__footer-note">
            <Link to="/olvide-password">Pedir un link nuevo</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__bg-glow"></div>

      <form className="login-page__form" onSubmit={handleSubmit}>
        <div className="login-page__brand">
          <h1 className="login-page__logo">INVS</h1>
          <p className="login-page__tagline">Elegí tu nueva contraseña.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {done ? (
          <p style={{ color: 'var(--color-success)', textAlign: 'center' }}>
            Contraseña actualizada — te llevamos al login...
          </p>
        ) : (
          <>
            <div className="login-page__field">
              <label htmlFor="reset-password" className="login-page__label">Nueva contraseña</label>
              <input
                id="reset-password"
                type="password"
                className="login-page__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>

            <div className="login-page__field">
              <label htmlFor="reset-confirm-password" className="login-page__label">Repetí la contraseña</label>
              <input
                id="reset-confirm-password"
                type="password"
                className="login-page__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login-page__submit" disabled={loading}>
              {loading ? <span className="login-page__spinner"></span> : 'Actualizar contraseña'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
