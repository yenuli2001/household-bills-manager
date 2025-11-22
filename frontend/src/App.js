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
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
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
        {currentUser && <Navbar />}
        <Container fluid className={currentUser ? "mt-3" : ""}>
          <Routes>
            <Route 
              path="/login" 
              element={!currentUser ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!currentUser ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={currentUser ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/bills" 
              element={currentUser ? <BillList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/add-bill" 
              element={currentUser ? <AddBill /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={currentUser ? <Reports /> : <Navigate to="/login" />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={currentUser ? "/" : "/login"} />} 
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;