import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BillList from './components/BillList';
import AddBill from './components/Addbill';
import Reports from './components/Reports';
import Login from './components/Login';
import Register from './components/Register';
import { isAuthenticated } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={authenticated ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={authenticated ? <Navigate to="/" /> : <Register />} 
          />
          <Route 
            path="*" 
            element={
              authenticated ? (
                <>
                  <Navbar />
                  <Container fluid className="mt-3">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/bills" element={<BillList />} />
                      <Route path="/add-bill" element={<AddBill />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </Container>
                </>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;