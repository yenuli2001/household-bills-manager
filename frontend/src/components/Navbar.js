import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard', icon: '▦',  mobileIcon: '▦'  },
  { path: '/bills',   label: 'Bills',     icon: '☰',  mobileIcon: '☰'  },
  { path: '/add-bill',label: 'Add',       icon: '+',  mobileIcon: '+', isAdd: true },
  { path: '/reports', label: 'Reports',   icon: '↗',  mobileIcon: '↗'  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Desktop / Top Navbar ── */}
      <nav className="top-nav">
        <div className="top-nav-inner">
          {/* Brand */}
          <button className="nav-brand" onClick={() => navigate('/')}>
            <span className="brand-icon">🏠</span>
            <span className="brand-text">BillsManager</span>
          </button>

          {/* Desktop Links */}
          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button
                key={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''} ${item.isAdd ? 'nav-link-add' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.isAdd ? <><span className="add-icon">+</span> Add Bill</> : item.label}
              </button>
            ))}
          </div>

          {/* User area */}
          <div className="nav-user">
            <span className="nav-username">
              <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
              <span className="username-text">{user?.username}</span>
            </span>
            <button className="nav-logout" onClick={logout}>
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
            <div className="mobile-menu-inner">
              <div className="mobile-user-row">
                <span className="user-avatar lg">{user?.username?.[0]?.toUpperCase()}</span>
                <div>
                  <div className="mobile-username">{user?.username}</div>
                  <div className="mobile-user-sub">Signed in</div>
                </div>
              </div>
              {NAV_ITEMS.map(item => (
                <button
                  key={item.path}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button className="mobile-logout" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''} ${item.isAdd ? 'add-item' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="bottom-nav-icon">{item.mobileIcon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;