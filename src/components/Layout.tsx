import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IncomingTransferBanner } from './IncomingTransferBanner';
import './Layout.css';

export function Layout() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <div className="layout">
      <IncomingTransferBanner />
      <main className="layout__main">
        <Outlet />
      </main>

      <nav className="layout__nav" aria-label="Navegación principal">
        <NavLink to="/eventos" className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`}>
          <svg className="nav-tab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="nav-tab__label">Eventos</span>
        </NavLink>

        <NavLink to="/entradas" className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`}>
          <svg className="nav-tab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="7" y="7" width="10" height="10" />
            <rect x="9" y="9" width="6" height="6" />
          </svg>
          <span className="nav-tab__label">Entrada</span>
        </NavLink>

        {isStaff && (
          <NavLink to="/staff/scanner" className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`}>
            <svg className="nav-tab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V4h3" />
              <path d="M20 7V4h-3" />
              <path d="M4 17v3h3" />
              <path d="M20 17v3h-3" />
              <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
            <span className="nav-tab__label">Staff</span>
          </NavLink>
        )}

        <NavLink to="/perfil" className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`}>
          <svg className="nav-tab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="nav-tab__label">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
}
