import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    const onStorage = () => setUser(authService.getUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
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
            {!user ? (
              <>
                <Nav.Link onClick={() => handleNavigation('/login')} active={location.pathname === '/login'}>
                  Login
                </Nav.Link>
                <Nav.Link onClick={() => handleNavigation('/register')} active={location.pathname === '/register'}>
                  Register
                </Nav.Link>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm">
                  {user.first_name ? `${user.first_name}` : user.username}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleNavigation('/profile')}>Profile</Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;