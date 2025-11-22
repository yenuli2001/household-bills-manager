import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: 'danger', text: 'Please enter a username.' });
      return;
    }

    // Simulate login by saving to localStorage (no auth)
    const user = { username };
    localStorage.setItem('hb_user', JSON.stringify(user));
    setMessage({ type: 'success', text: `Logged in as ${username}` });

    // short delay then navigate home
    setTimeout(() => navigate('/'), 700);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Login (no auth)</Card.Title>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </Form.Group>
          <Button type="submit">Login</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;
