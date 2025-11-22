import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: 'danger', text: 'Please enter a username.' });
      return;
    }

    // Simulate registration by storing to localStorage (no backend)
    const usersRaw = localStorage.getItem('hb_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.find((u) => u.username === username)) {
      setMessage({ type: 'warning', text: 'Username already exists.' });
      return;
    }

    users.push({ username });
    localStorage.setItem('hb_users', JSON.stringify(users));
    setMessage({ type: 'success', text: `Registered ${username}. You can now log in.` });

    setTimeout(() => navigate('/login'), 900);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Register (no auth)</Card.Title>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </Form.Group>
          <Button type="submit">Register</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Register;
