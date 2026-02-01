import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <BootstrapNavbar.Brand 
          href="#/" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}
          style={{ cursor: 'pointer' }}
        >
          🏠 Household Bills Manager
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              active={location.pathname === '/'}
              onClick={() => handleNavigation('/')}
              style={{ cursor: 'pointer' }}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/bills'}
              onClick={() => handleNavigation('/bills')}
              style={{ cursor: 'pointer' }}
            >
              All Bills
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/add-bill'}
              onClick={() => handleNavigation('/add-bill')}
              style={{ cursor: 'pointer' }}
            >
              Add Bill
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/reports'}
              onClick={() => handleNavigation('/reports')}
              style={{ cursor: 'pointer' }}
            >
              Reports
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <BootstrapNavbar.Text style={{ marginRight: '15px', color: '#fff' }}>
              👤 {user?.username}
            </BootstrapNavbar.Text>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;