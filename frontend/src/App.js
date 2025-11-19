import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BillList from './components/BillList';
import AddBill from './components/Addbill';
import Reports from './components/Reports';
import GoogleLogin from './components/GoogleLogin';
import { authService } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (data) => {
    const { user: userData, tokens } = data;
    
    // Store tokens and user data
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('monthlyBudget');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <Container fluid className="mt-3">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bills" element={<BillList />} />
                <Route path="/add-bill" element={<AddBill />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </>
        ) : (
          <Routes>
            <Route 
              path="/login" 
              element={
                <GoogleLogin 
                  onSuccess={handleLoginSuccess}
                  onFailure={(error) => console.error('Login failed:', error)}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;