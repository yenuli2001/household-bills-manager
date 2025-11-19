import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';

const GoogleLogin = ({ onSuccess, onFailure }) => {
  const handleGoogleLogin = () => {
    // For production, you'll need to set up proper Google OAuth
    // This is a simplified version for demo
    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID', // You'll get this from Google Cloud Console
      callback: handleGoogleResponse,
    });
    
    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = (response) => {
    // This would be the proper OAuth flow
    console.log('Google response:', response);
  };

  // Simplified demo version - in production use proper Google OAuth
  const handleDemoLogin = async () => {
    try {
      // Simulate Google login success
      const mockUser = {
        email: 'user@gmail.com',
        name: 'Google User',
        id: 1
      };
      
      const mockTokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token'
      };
      
      onSuccess({
        user: mockUser,
        tokens: mockTokens
      });
    } catch (error) {
      onFailure('Login failed');
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <h2 className="text-primary">🏠 Household Bills</h2>
                <p className="text-muted">Sign in to manage your expenses</p>
              </div>

              <Button 
                variant="outline-primary" 
                size="lg" 
                className="w-100 mb-3"
                onClick={handleDemoLogin}
              >
                <i className="fab fa-google me-2"></i>
                Continue with Google
              </Button>

              <div className="mt-4">
                <small className="text-muted">
                  Secure Google authentication<br />
                  Your data stays private to your account
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GoogleLogin;