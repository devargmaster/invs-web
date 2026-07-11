import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IncomingTransferBanner } from './IncomingTransferBanner';
import './Layout.css';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function Layout() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const navItems: NavItem[] = [
    {
      to: '/eventos',
      label: 'Eventos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      to: '/streaming',
      label: 'Streaming',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      to: '/entradas',
      label: 'Compras',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="10" height="10" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      ),
    },
    ...(isStaff
      ? [
          {
            to: '/staff/scanner',
            label: 'Staff',
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h3" />
                <path d="M20 7V4h-3" />
                <path d="M4 17v3h3" />
                <path d="M20 17v3h-3" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            ),
          },
        ]
      : []),
    {
      to: '/perfil',
      label: 'Perfil',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="layout">
      {/* ─── Navbar de escritorio (≥1024px) ─────────────────────────── */}
      <header className="layout__topbar">
        <div className="layout__topbar-inner">
          <NavLink to="/eventos" className="layout__logo">INVS</NavLink>
          <nav className="layout__topnav" aria-label="Navegación principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `topnav-link ${isActive ? 'topnav-link--active' : ''}`}
              >
                <span className="topnav-link__icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div className="layout__body">
        <IncomingTransferBanner />
        <main className="layout__main">
          <div className="layout__content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ─── Tab bar de mobile (<1024px) ─────────────────────────────── */}
      <nav className="layout__nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`}
          >
            <span className="nav-tab__icon">{item.icon}</span>
            <span className="nav-tab__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
