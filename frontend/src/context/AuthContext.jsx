// ============================================================
// FILE: src/context/AuthContext.jsx
// Auth Context — the noticeboard every page can read
//
// ResearchConnect context:
// When Mansora logs in, we save her token and user data here.
// Every page — Home Feed, Profile, Notifications — reads
// this context to know who is logged in and what their role is.
// If no token exists, the user is redirected to login.
//
// How React Context works:
// Think of it like a TV signal. The AuthProvider broadcasts
// the signal. Every component that needs it can tune in
// using useAuth(). No need to pass data through props.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context — the noticeboard
const AuthContext = createContext();

// The API base URL — where our backend lives
export const API_URL = 'http://localhost:5001/api';

// ── AUTH PROVIDER ─────────────────────────────────────────
// Wraps the whole app so every page can access auth data
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // loading = true while we check if user is already logged in

  // When the app loads, check if there is a saved token
  // This keeps the user logged in after page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('rc_token');
    const savedUser = localStorage.getItem('rc_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // ── LOGIN ───────────────────────────────────────────────
  // Called after successful login
  // Saves token and user to localStorage and state
  const login = (tokenValue, userData) => {
    localStorage.setItem('rc_token', tokenValue);
    localStorage.setItem('rc_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // ── LOGOUT ──────────────────────────────────────────────
  // Clears everything — user is logged out
  const logout = () => {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
    setToken(null);
    setUser(null);
  };

  // ── UPDATE USER ─────────────────────────────────────────
  // Called when user updates their profile
  // Updates the stored user data without full logout/login
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('rc_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  // ── API HELPER ──────────────────────────────────────────
  // Makes authenticated API calls with the token automatically
  // so we do not have to add the Authorization header every time
  //
  // ResearchConnect context:
  // Instead of writing this on every page:
  // fetch('/api/posts', { headers: { Authorization: 'Bearer ' + token }})
  // We just write:
  // authFetch('/posts')
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // If token expired or invalid — logout automatically
    if (response.status === 401) {
      logout();
      window.location.href = '/auth';
      return;
    }

    return response;
  };

  // What we broadcast to all pages
  const value = {
    user,          // current logged in user object
    token,         // JWT token string
    loading,       // true while checking localStorage
    login,         // function to call after successful login
    logout,        // function to call on logout
    updateUser,    // function to update user data
    authFetch,     // authenticated fetch helper
    isLoggedIn: !!token,           // true if logged in
    isStudent: user?.role === 'student',
    isSupervisor: user?.role === 'supervisor',
    isAdmin: user?.isAdmin === true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── USE AUTH HOOK ─────────────────────────────────────────
// What each page uses to access the auth data
// Usage: const { user, logout, authFetch } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}