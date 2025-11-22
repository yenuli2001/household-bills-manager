import React from 'react';
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
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

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