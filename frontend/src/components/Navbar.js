import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken, authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // try to fetch current user (optional, fail silently)
      authService.getCurrentUser().then(res => {
        const u = res.data.user?.username;
        if (u) setUsername(u);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore errors
    }
    setAuthToken(null);
    setUsername(null);
    navigate('/');
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
          <Nav>
            {username ? (
              <>
                <Nav.Item style={{ color: '#fff', padding: '8px 12px' }}>{username}</Nav.Item>
                <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link onClick={() => handleNavigation('/login')} style={{ cursor: 'pointer' }}>Login</Nav.Link>
                <Nav.Link onClick={() => handleNavigation('/register')} style={{ cursor: 'pointer' }}>Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;