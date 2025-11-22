import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check auth status on component mount
    authService.checkAuth()
      .then(response => {
        if (response.data.authenticated) {
          setUsername(response.data.username);
        }
      })
      .catch(() => {
        // If not authenticated, redirect to login
        navigate('/login');
      });
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Continue with logout even if API call fails
    } finally {
      navigate('/login');
    }
  };

  if (!username) {
    return null; // Don't render navbar if not authenticated
  }

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <BootstrapNavbar.Brand 
          onClick={() => handleNavigation('/')}
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
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/bills'}
              onClick={() => handleNavigation('/bills')}
            >
              All Bills
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/add-bill'}
              onClick={() => handleNavigation('/add-bill')}
            >
              Add Bill
            </Nav.Link>
            <Nav.Link 
              active={location.pathname === '/reports'}
              onClick={() => handleNavigation('/reports')}
            >
              Reports
            </Nav.Link>
          </Nav>
          
          <Nav>
            <NavDropdown title={`👤 ${username}`} id="user-dropdown">
              <NavDropdown.Item onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;