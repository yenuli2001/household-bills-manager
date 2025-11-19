import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, Container } from 'react-bootstrap';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      paddingTop: '80px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Container>
        <Row className="justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Col md={6} lg={4}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                    <i className="fas fa-wallet fa-2x text-primary"></i>
                  </div>
                  <h3 className="fw-bold">Welcome Back</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-user me-2"></i>
                      Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter your username"
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-lock me-2"></i>
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="py-2"
                    />
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                      className="py-2 fw-semibold"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;