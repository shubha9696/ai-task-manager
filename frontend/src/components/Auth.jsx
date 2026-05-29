import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, CheckSquare, Loader2 } from 'lucide-react';

export default function Auth() {
  const { login, register, isLoading, error } = useApp();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formValidationError, setFormValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormValidationError('');

    if (!email || !password) {
      setFormValidationError('Please fill in all fields.');
      return;
    }

    if (!isLoginTab && !username) {
      setFormValidationError('Username is required for registration.');
      return;
    }

    if (!isLoginTab && username.trim().length < 3) {
      setFormValidationError('Username must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setFormValidationError('Password must be at least 6 characters.');
      return;
    }

    if (isLoginTab) {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
  };

  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    setFormValidationError('');
    // Clear inputs on switch
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-wrapper" id="auth-screen">
      <div className="auth-card glass-panel" id="auth-glass-card">
        <div className="auth-title-section">
          <div className="auth-logo-badge">
            <CheckSquare size={32} color="white" />
          </div>
          <h2 className="auth-title">AI Task Manager</h2>
          <p className="auth-subtitle">
            {isLoginTab ? 'Sign in to manage your tasks' : 'Create an account to get started'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabChange(true)}
            disabled={isLoading}
            type="button"
            id="btn-tab-login"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabChange(false)}
            disabled={isLoading}
            type="button"
            id="btn-tab-register"
          >
            Register
          </button>
        </div>

        {(formValidationError || error) && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}
            id="auth-error-message"
          >
            {formValidationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="auth-form">
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-username">Username</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="register-username"
                  className="form-control"
                  placeholder="John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="auth-email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                id="auth-password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn-submit"
            disabled={isLoading}
            id="btn-auth-submit"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" />
                Processing...
              </>
            ) : isLoginTab ? (
              'Sign In'
            ) : (
              'Get Started'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
