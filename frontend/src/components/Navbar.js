import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <BootstrapNavbar.Brand 
          href="#/" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}
          style={{ cursor: 'pointer' }}
        >
          🏠 Bills Manager
        </BootstrapNavbar.Brand>
        
        <Nav className="me-auto">
          <Nav.Link onClick={() => handleNavigation('/')}>Dashboard</Nav.Link>
          <Nav.Link onClick={() => handleNavigation('/bills')}>Bills</Nav.Link>
          <Nav.Link onClick={() => handleNavigation('/add-bill')}>Add Bill</Nav.Link>
          <Nav.Link onClick={() => handleNavigation('/reports')}>Reports</Nav.Link>
        </Nav>
        
        <Button variant="outline-light" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;