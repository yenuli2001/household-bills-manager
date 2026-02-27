import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { registerTokenGetter } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BillList from './components/BillList';
import Addbill from './components/Addbill';
import Reports from './components/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// ── Wires the in-memory access token from AuthContext into api.js ──
// Must be a child of AuthProvider so useAuth() works here.
function TokenRegistrar() {
  const { getAccessToken } = useAuth();
  useEffect(() => {
    registerTokenGetter(getAccessToken);
  }, [getAccessToken]);
  return null; // renders nothing
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Register token getter once, inside AuthProvider */}
        <TokenRegistrar />

        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <><Navbar /><Dashboard /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <><Navbar /><BillList /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-bill"
            element={
              <ProtectedRoute>
                <><Navbar /><Addbill /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <><Navbar /><Reports /></>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;