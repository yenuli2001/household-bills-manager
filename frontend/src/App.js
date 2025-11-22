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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={
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
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;