import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(credentials);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-3">Login</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button variant="link" onClick={() => navigate('/register')}>Create an account</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
