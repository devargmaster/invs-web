import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import './LoginPage.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMismatchError(null);
    if (password !== confirmPassword) {
      setMismatchError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await register(fullName, email, password);
      navigate('/eventos', { replace: true });
    } catch {
      // error ya seteado en el context
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__bg-glow"></div>

      <form className="login-page__form" onSubmit={handleSubmit}>
        <div className="login-page__brand">
          <h1 className="login-page__logo">INVS</h1>
          <p className="login-page__tagline">Creá tu cuenta para comprar entradas y ver streaming.</p>
        </div>

        {(mismatchError || error) && <ErrorBanner message={mismatchError ?? error ?? ''} />}

        <div className="login-page__field">
          <label htmlFor="register-name" className="login-page__label">Nombre completo</label>
          <input
            id="register-name"
            type="text"
            className="login-page__input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            disabled={isLoading}
            placeholder="Tu nombre"
            required
          />
        </div>

        <div className="login-page__field">
          <label htmlFor="register-email" className="login-page__label">Email</label>
          <input
            id="register-email"
            type="email"
            className="login-page__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="login-page__field">
          <label htmlFor="register-password" className="login-page__label">Contraseña</label>
          <input
            id="register-password"
            type="password"
            className="login-page__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>

        <div className="login-page__field">
          <label htmlFor="register-confirm-password" className="login-page__label">Repetí la contraseña</label>
          <input
            id="register-confirm-password"
            type="password"
            className="login-page__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="••••••••"
            required
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
            'Crear cuenta'
          )}
        </button>

        <p className="login-page__footer-note">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </form>
    </div>
  );
}
