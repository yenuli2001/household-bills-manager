import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Container fluid className="mt-3">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bills" element={<BillList />} />
            <Route path="/add-bill" element={<AddBill />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;