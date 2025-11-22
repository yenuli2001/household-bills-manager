import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { authService } from '../services/api';

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
      const payload = { username, email, password, password2 };
      const res = await authService.register(payload);
      const { token, user } = res.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      authService.setAuthToken(token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.error || err.message;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 520 }}>
      <Card.Body>
        <h4 className="mb-3">Register</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="confirm password" />
          </Form.Group>

          <Button type="submit" variant="success">Register</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Register;
