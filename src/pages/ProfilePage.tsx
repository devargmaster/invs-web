import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { AuthUser } from '../types/auth';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AuthUser | null>(user);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    authService.getMe()
      .then(data => setProfile(data))
      .catch(() => setProfile(user))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Perfil</h1>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : (
        <div className="profile-page__cards">
          <div className="profile-page__card">
            <span className="profile-page__card-label">Nombre</span>
            <span className="profile-page__card-value">{profile?.fullName ?? '—'}</span>
          </div>

          <div className="profile-page__card">
            <span className="profile-page__card-label">Email</span>
            <span className="profile-page__card-value">{profile?.email ?? '—'}</span>
          </div>

          <div className="profile-page__card">
            <span className="profile-page__card-label">Rol</span>
            <span className="profile-page__card-badge">{profile?.role ?? '—'}</span>
          </div>
        </div>
      )}

      {!showConfirm ? (
        <button className="profile-page__logout" onClick={() => setShowConfirm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      ) : (
        <div className="profile-page__confirm">
          <p className="profile-page__confirm-text">¿Seguro que querés salir?</p>
          <div className="profile-page__confirm-actions">
            <button className="profile-page__confirm-cancel" onClick={() => setShowConfirm(false)}>
              Cancelar
            </button>
            <button className="profile-page__confirm-yes" onClick={handleLogout}>
              Sí, salir
            </button>
          </div>
        </div>
      )}

      <p className="profile-page__version">INVS Web v1.0.0</p>
    </div>
  );
}
