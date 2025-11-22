import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      // registration returns token and sets it via authService.login-like flow
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.non_field_errors?.[0] || data?.password || JSON.stringify(data) || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-3">Create Account</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Username</Form.Label>
                  <Form.Control name="username" value={form.username} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" name="password2" value={form.password2} onChange={handleChange} required />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <Button variant="link" onClick={() => navigate('/login')}>Already have an account? Sign in</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
