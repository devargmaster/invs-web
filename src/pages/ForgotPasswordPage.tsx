import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { ErrorBanner } from '../components/ErrorBanner';
import './LoginPage.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      // Siempre mostramos el mismo mensaje de éxito, exista o no la
      // cuenta — evita que alguien use este formulario para averiguar
      // qué emails están registrados.
      setSent(true);
    } catch {
      setError('Ocurrió un error. Probá de nuevo en un momento.');
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
          <p className="login-page__tagline">Recuperá el acceso a tu cuenta.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {sent ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
            Si <b>{email}</b> tiene una cuenta en INVS, te mandamos un mail con un link para elegir una
            contraseña nueva. Revisá también spam.
          </p>
        ) : (
          <>
            <div className="login-page__field">
              <label htmlFor="forgot-email" className="login-page__label">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="login-page__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                placeholder="tu@email.com"
                required
              />
            </div>

            <button type="submit" className="login-page__submit" disabled={loading}>
              {loading ? <span className="login-page__spinner"></span> : 'Enviar link de recuperación'}
            </button>
          </>
        )}

        <p className="login-page__footer-note">
          <Link to="/login">Volver a ingresar</Link>
        </p>
      </form>
    </div>
  );
}
