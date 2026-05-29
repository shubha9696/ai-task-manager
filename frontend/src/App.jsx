import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Auth from './components/Auth';
import Board from './components/Board';
import ToastContainer from './components/Toast';
import { Sun, Moon, LogOut, CheckSquare, Loader2 } from 'lucide-react';
import './styles/App.css';
import './styles/components.css';

export default function App() {
  const { user, token, logout, isLoading, isDemoMode } = useApp();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-shell" id="app-root-shell">
      {/* Toast notifications container */}
      <ToastContainer />

      {token && user ? (
        <div className="app-container" id="authorized-app-layout">
          {/* Top Navigation Header */}
          <header className="app-header glass-panel" id="app-header-navigation" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div className="brand-section">
              <div className="brand-logo-glow">
                <CheckSquare size={20} color="white" />
              </div>
              <h1 className="brand-title">AI Task Manager</h1>
              {isDemoMode && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '50px',
                    fontWeight: '600',
                    marginLeft: '0.5rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                  id="badge-database-demo"
                >
                  Offline DB
                </span>
              )}
            </div>

            <div className="header-actions">
              {/* Theme Toggle Button */}
              <button
                className="btn btn-secondary btn-icon"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
                id="btn-toggle-theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Profile Info Badge */}
              <div className="user-profile-badge" id="header-user-badge">
                <span className="user-avatar" id="avatar-user">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </span>
                <span style={{ fontWeight: '500' }}>{user.username}</span>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-danger"
                onClick={logout}
                title="Logout from account"
                id="btn-auth-logout"
              >
                <LogOut size={16} />
                <span className="hide-mobile" style={{ fontSize: '0.85rem' }}>Logout</span>
              </button>
            </div>
          </header>

          {/* Main Board Workspace */}
          <main style={{ flexGrow: 1 }} id="board-workspace-section">
            <Board />
          </main>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Floating theme toggle button in unauthenticated view */}
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
            <button
              className="btn btn-secondary btn-icon glass-panel"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
              id="btn-toggle-theme-unauth"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <Auth />
        </div>
      )}
    </div>
  );
}
