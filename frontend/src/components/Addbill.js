import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { billService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddBill = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bill_type: 'ELECTRICITY',
    amount: '',
    discount: '0',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const billTypeIcons = {
    'ELECTRICITY': '⚡',
    'WATER': '💧',
    'GROCERY': '🛒',
    'BANKING': '🏦',
    'LOAN': '💰',
    'CREDIT_CARD': '💳',
    'PHONE': '📱',
    'WIFI': '🌐',
    'FUEL': '⛽',
    'VEHICLE_REPAIR': '🔧',
    'OTHER': '📦'
  };

  const billTypeNames = {
    'ELECTRICITY': 'Electricity Bill',
    'WATER': 'Water Bill',
    'GROCERY': 'Grocery Shopping',
    'BANKING': 'Banking Charges',
    'LOAN': 'Loan Payment',
    'CREDIT_CARD': 'Credit Card Payment',
    'PHONE': 'Phone Bill',
    'WIFI': 'WiFi Bill',
    'FUEL': 'Fuel Expense',
    'VEHICLE_REPAIR': 'Vehicle Repairs',
    'OTHER': 'Other Expenses'
  };

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
      await billService.createBill({
        ...formData,
        amount: parseFloat(formData.amount),
        discount: parseFloat(formData.discount)
      });
      navigate('/bills');
    } catch (err) {
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const discountAmount = (amount * discount) / 100;
    return (amount - discountAmount).toFixed(2);
  };

  return (
    <div style={{ paddingTop: '80px' }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="fas fa-receipt text-primary"></i>
                </div>
                <div>
                  <h4 className="mb-0">Add New Expense</h4>
                  <small className="text-muted">Track your household expenses</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {/* Bill Type */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">💰 Expense Type</Form.Label>
                  <Form.Select 
                    name="bill_type" 
                    value={formData.bill_type}
                    onChange={handleChange}
                    required
                    className="py-2"
                  >
                    {Object.entries(billTypeNames).map(([value, label]) => (
                      <option key={value} value={value}>
                        {billTypeIcons[value]} {label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={8}>
                    {/* Amount */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">💵 Amount (Rs.)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="Enter amount in rupees"
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    {/* Discount */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">🎯 Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Date */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">📅 Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="py-2"
                  />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-file-alt me-2"></i>
                    Description (Optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add any notes about this expense..."
                    className="py-2"
                  />
                </Form.Group>

                {/* Calculation Preview */}
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body className="p-3">
                    <h6 className="mb-3">📊 Calculation Preview</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Original Amount:</span>
                      <span>Rs. {formData.amount || '0.00'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Discount ({formData.discount}%):</span>
                      <span className="text-success">
                        - Rs. {((parseFloat(formData.amount) || 0) * (parseFloat(formData.discount) || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>Final Amount:</strong>
                      <strong className="text-primary fs-5">
                        Rs. {calculateFinalAmount()}
                      </strong>
                    </div>
                  </Card.Body>
                </Card>

                {/* Submit Button */}
                <div className="d-grid gap-2">
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
                        Adding Expense...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus-circle me-2"></i>
                        Add Expense
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/bills')}
                    className="py-2"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Expenses
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddBill;