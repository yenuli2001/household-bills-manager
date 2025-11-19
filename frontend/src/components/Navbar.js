import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
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
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                👤 {user?.name || 'User'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText>
                  <small>Signed in as<br /><strong>{user?.email}</strong></small>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  🚪 Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;