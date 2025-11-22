import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '../services/api';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authService.register({ username, email, password, password2 });
      const token = res.data.token;
      const user = res.data.user;
      setAuthToken(token);
      localStorage.setItem('username', user.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Card style={{ maxWidth: 520, margin: '40px auto' }}>
      <Card.Body>
        <h4 className="mb-3">Register</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
          </Form.Group>
          <Button type="submit" className="mt-2">Register</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Register;
