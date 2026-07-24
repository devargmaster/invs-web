import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { ENV } from '../config/env';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/eventos', { replace: true });
    } catch {
      // error ya seteado en el context
    }
  };

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
      navigate('/eventos', { replace: true });
    } catch {
      // error ya seteado en el context
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div className="login-page">
      <div className="login-page__bg-glow"></div>

      <form className="login-page__form" onSubmit={handleSubmit}>
        <div className="login-page__brand">
          <h1 className="login-page__logo">INVS</h1>
          <p className="login-page__tagline">Experiencias, eventos y contenidos digitales.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="login-page__field">
          <label htmlFor="login-email" className="login-page__label">Email</label>
          <input
            id="login-email"
            type="email"
            className="login-page__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
            placeholder="tu@email.com"
          />
        </div>

        <div className="login-page__field">
          <label htmlFor="login-password" className="login-page__label">Contraseña</label>
          <input
            id="login-password"
            type="password"
            className="login-page__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="login-page__submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="login-page__spinner"></span>
          ) : (
            'Ingresar'
          )}
        </button>

        {ENV.GOOGLE_CLIENT_ID && (
          <div className="login-page__divider">
            <span>o</span>
          </div>
        )}

        <GoogleLoginButton onCredential={handleGoogleCredential} />

        <p className="login-page__footer-note">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
        <p className="login-page__footer-note">
          Plataforma INVS — Acceso web
        </p>
      </form>
    </div>
  );
}
