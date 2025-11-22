import React, { useEffect, useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('hb_user');
    setUser(raw ? JSON.parse(raw) : null);

    const onStorage = (e) => {
      if (e.key === 'hb_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hb_user');
    setUser(null);
    navigate('/login');
  };

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
            {user ? (
              <>
                <Nav.Link style={{ cursor: 'default', color: '#bbb' }}>
                  {user.username}
                </Nav.Link>
                <Nav.Link
                  onClick={handleLogout}
                  style={{ cursor: 'pointer' }}
                >
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
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
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;