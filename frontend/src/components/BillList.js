import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import { billService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const BillList = ({ user }) => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return localStorage.getItem(`monthlyBudget_${user?.id}`) || '';
  });

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

  const billTypeColors = {
    'ELECTRICITY': 'primary',
    'WATER': 'info',
    'GROCERY': 'success',
    'BANKING': 'secondary',
    'LOAN': 'warning',
    'CREDIT_CARD': 'dark',
    'PHONE': 'primary',
    'WIFI': 'info',
    'FUEL': 'danger',
    'VEHICLE_REPAIR': 'warning',
    'OTHER': 'secondary'
  };

  useEffect(() => {
    fetchBills();
  }, [selectedMonth, selectedYear, user]);

  const fetchBills = async () => {
    try {
      const response = await billService.getAllBills(user.id);
      const allBills = response.data;
      
      const filteredBills = allBills.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() + 1 === selectedMonth && 
               billDate.getFullYear() === selectedYear;
      });
      
      setBills(filteredBills);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await billService.deleteBill(id, user.id);
        fetchBills();
      } catch (err) {
        setError('Failed to delete expense');
      }
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const calculateMonthlyTotal = () => {
    return bills.reduce((total, bill) => total + parseFloat(bill.final_amount), 0);
  };

  const calculateRemainingBudget = () => {
    if (!monthlyBudget) return 0;
    const budget = parseFloat(monthlyBudget);
    const totalExpenses = calculateMonthlyTotal();
    return budget - totalExpenses;
  };

  const getBillsByType = (type) => {
    return bills.filter(bill => bill.bill_type === type);
  };

  const billTypes = [
    'ELECTRICITY', 'WATER', 'GROCERY', 'BANKING', 'LOAN', 
    'CREDIT_CARD', 'PHONE', 'WIFI', 'FUEL', 'VEHICLE_REPAIR', 'OTHER'
  ];

  if (loading) return (
    <div className="text-center" style={{ paddingTop: '80px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading your expenses...</p>
    </div>
  );

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📋 All Expenses</h2>
          <p className="text-muted mb-0">Manage and track your household expenses</p>
        </div>
        <Button onClick={() => navigate('/add-bill')} variant="primary" className="px-4">
          <i className="fas fa-plus-circle me-2"></i>
          Add Expense
        </Button>
      </div>

      {/* Month/Year Selector */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <h5 className="mb-0">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </h5>
                  <small className="text-muted">
                    {bills.length} expense{bills.length !== 1 ? 's' : ''} found
                  </small>
                </div>
                <Badge bg="primary" className="fs-6">
                  Total: Rs. {calculateMonthlyTotal().toFixed(2)}
                </Badge>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  size="sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  size="sm"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Budget Info */}
      {monthlyBudget && (
        <Card className="mb-3 border-0 bg-light">
          <Card.Body className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Monthly Budget: <strong>Rs. {parseFloat(monthlyBudget).toFixed(2)}</strong></small>
              <small className={calculateRemainingBudget() >= 0 ? 'text-success' : 'text-danger'}>
                {calculateRemainingBudget() >= 0 ? 'Remaining: ' : 'Over by: '}
                <strong>Rs. {Math.abs(calculateRemainingBudget()).toFixed(2)}</strong>
              </small>
            </div>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Expenses by Category */}
      {billTypes.map(billType => {
        const typeBills = getBillsByType(billType);
        const typeTotal = typeBills.reduce((total, bill) => total + parseFloat(bill.final_amount), 0);
        
        if (typeBills.length === 0) return null;

        return (
          <Card key={billType} className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="me-2 fs-5">{billTypeIcons[billType]}</span>
                  <h5 className="mb-0">{billType.replace('_', ' ')}</h5>
                  <Badge bg={billTypeColors[billType]} className="ms-2">
                    {typeBills.length} item{typeBills.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <strong className="text-primary">Rs. {typeTotal.toFixed(2)}</strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th width="120">Date</th>
                      <th width="120">Amount</th>
                      <th width="100">Discount</th>
                      <th width="140">Final Amount</th>
                      <th>Description</th>
                      <th width="100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeBills.map((bill) => (
                      <tr key={bill.id} className="align-middle">
                        <td>
                          <small className="text-muted">
                            {new Date(bill.date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </small>
                        </td>
                        <td>
                          <span className="text-muted">Rs. {parseFloat(bill.amount).toFixed(2)}</span>
                        </td>
                        <td>
                          {bill.discount > 0 ? (
                            <Badge bg="success" className="fs-3">
                              {bill.discount}%
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <strong className="text-dark">Rs. {parseFloat(bill.final_amount).toFixed(2)}</strong>
                        </td>
                        <td>
                          <small className="text-muted">
                            {bill.description || 'No description'}
                          </small>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(bill.id)}
                            title="Delete expense"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* No Expenses Message */}
      {bills.length === 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-receipt fa-3x text-muted"></i>
            </div>
            <h5>No expenses found for {getMonthName(selectedMonth)} {selectedYear}</h5>
            <p className="text-muted mb-3">
              Start tracking your expenses by adding your first bill for this month.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/add-bill')}
              className="px-4"
            >
              <i className="fas fa-plus-circle me-2"></i>
              Add Your First Expense
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BillList;