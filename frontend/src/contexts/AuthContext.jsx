import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API = 'https://household-bills-manager-backend.vercel.app/api';

// ─── Input validation helpers ────────────────────────────────────────────────
function validateUsername(username) {
  if (!username || typeof username !== 'string') return 'Username is required.';
  if (username.length < 3)  return 'Username must be at least 3 characters.';
  if (username.length > 50) return 'Username must be under 50 characters.';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8)   return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password is too long.';
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return null; // email is optional
  if (email.length > 254) return 'Email is too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  return null;
}

// ─── Simple in-memory rate limiter (client-side, extra layer) ────────────────
function makeRateLimiter(maxAttempts = 5, windowMs = 60000) {
  const attempts = [];
  return function isAllowed() {
    const now = Date.now();
    // Remove attempts outside the window
    while (attempts.length && attempts[0] < now - windowMs) attempts.shift();
    if (attempts.length >= maxAttempts) return false;
    attempts.push(now);
    return true;
  };
}

const loginRateLimiter = makeRateLimiter(5, 60000); // 5 attempts per minute

export const AuthProvider = ({ children }) => {
  // ── Access token stored in memory (NOT localStorage) ──
  const accessTokenRef = useRef(null);

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── On mount: try to restore session via refresh cookie ──────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Attempt a silent token refresh using the HttpOnly cookie
      silentRefresh(JSON.parse(storedUser));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Silent refresh — called on mount and before token expires ────────────
  const silentRefresh = async (existingUser = null) => {
    try {
      const response = await fetch(`${API}/auth/refresh/`, {
        method: 'POST',
        credentials: 'include', // sends the HttpOnly refresh cookie
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      accessTokenRef.current = data.access;

      // Restore user from localStorage if we have it
      if (existingUser) {
        setUser(existingUser);
      } else {
        await fetchCurrentUser(data.access);
      }
    } catch {
      // Refresh failed — clear everything, force login
      accessTokenRef.current = null;
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch current user profile ────────────────────────────────────────────
  const fetchCurrentUser = async (token) => {
    try {
      const res = await fetch(`${API}/auth/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const userData = await res.json();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    // Client-side rate limiting
    if (!loginRateLimiter()) {
      return { success: false, error: 'Too many login attempts. Please wait a minute and try again.' };
    }

    // Input validation
    const usernameError = validateUsername(username);
    if (usernameError) return { success: false, error: usernameError };

    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };

    try {
      const response = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // server sets HttpOnly refresh cookie
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.status === 429) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      if (!response.ok) {
        // Use a generic message — don't reveal whether username or password was wrong
        return { success: false, error: 'Invalid username or password.' };
      }

      const data = await response.json();

      // Store access token in memory only (never localStorage)
      accessTokenRef.current = data.access;

      // Fetch user profile
      await fetchCurrentUser(data.access);

      navigate('/');
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (username, email, password) => {
    // Input validation
    const usernameError = validateUsername(username);
    if (usernameError) return { success: false, error: usernameError };

    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };

    const emailError = validateEmail(email);
    if (emailError) return { success: false, error: emailError };

    try {
      const response = await fetch(`${API}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // server sets HttpOnly refresh cookie
        body: JSON.stringify({ username: username.trim(), email: email?.trim(), password }),
      });

      if (!response.ok) {
        const err = await response.json();
        // Generic fallback so we don't leak info
        return { success: false, error: err.error || 'Registration failed. Please try again.' };
      }

      const data = await response.json();

      // Store access token in memory only
      accessTokenRef.current = data.access;

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      navigate('/');
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    // Clear memory token immediately
    accessTokenRef.current = null;
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');

    // Tell server to blacklist the refresh token cookie
    try {
      await fetch(`${API}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Silently fail — client is already logged out
    }
  };

  // ── Expose a getter so api.js can read the in-memory token ───────────────
  const getAccessToken = () => accessTokenRef.current;

  // ── Auto-refresh access token 1 minute before it expires (15 min lifetime)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      silentRefresh();
    }, 14 * 60 * 1000); // every 14 minutes
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};