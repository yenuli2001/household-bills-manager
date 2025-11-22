import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '../services/api';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authService.login({ username, password });
      const token = res.data.token;
      const user = res.data.user;
      setAuthToken(token);
      localStorage.setItem('username', user.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Card style={{ maxWidth: 420, margin: '40px auto' }}>
      <Card.Body>
        <h4 className="mb-3">Login</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button type="submit" className="mt-2">Login</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;
