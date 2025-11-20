import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BillList from './components/BillList';
import AddBill from './components/Addbill';
import Reports from './components/Reports';
import Login from './components/Login';
import Register from './components/Register';
import { authService } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

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
        {user && <Navbar />}
        <Container fluid className={user ? "mt-3" : ""}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/bills" 
              element={user ? <BillList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/add-bill" 
              element={user ? <AddBill /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={user ? <Reports /> : <Navigate to="/login" />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/" : "/login"} />} 
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;