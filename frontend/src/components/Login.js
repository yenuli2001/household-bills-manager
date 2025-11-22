import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { authService } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = username ? { username, password } : { email, password };
      const res = await authService.login(payload);
      const { token, user } = res.data;
      // persist token and user
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      authService.setAuthToken(token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors || err.message;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 420 }}>
      <Card.Body>
        <h4 className="mb-3">Login</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Username (or leave blank to use email)</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email (used if username blank)</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          </Form.Group>

          <Button type="submit" variant="primary">Login</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;
