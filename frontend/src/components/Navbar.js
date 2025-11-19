import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
    return null; // Don't show navbar on auth pages when not logged in
  }

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
          {user ? (
            <>
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
                <Dropdown>
                  <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                    <i className="fas fa-user me-2"></i>
                    {user.username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleNavigation('/profile')}>
                      <i className="fas fa-user-circle me-2"></i>
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link 
                active={location.pathname === '/login'}
                onClick={() => handleNavigation('/login')}
                style={{ cursor: 'pointer' }}
              >
                Login
              </Nav.Link>
              <Nav.Link 
                active={location.pathname === '/register'}
                onClick={() => handleNavigation('/register')}
                style={{ cursor: 'pointer' }}
              >
                Register
              </Nav.Link>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;