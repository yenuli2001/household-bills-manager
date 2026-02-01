import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import { billService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './BillList.css';

const BillList = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
  }, [selectedMonth, selectedYear]);

  const fetchBills = async () => {
    try {
      const response = await billService.getAllBills();
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
        await billService.deleteBill(id);
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

  const getBillsByType = (type) => {
    return bills.filter(bill => bill.bill_type === type);
  };

  const billTypes = [
    'ELECTRICITY', 'WATER', 'GROCERY', 'BANKING', 'LOAN', 
    'CREDIT_CARD', 'PHONE', 'WIFI', 'FUEL', 'VEHICLE_REPAIR', 'OTHER'
  ];

  if (loading) return (
    <div className="text-center loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading your expenses...</p>
    </div>
  );

  return (
    <div className="billlist-container">
      {/* Header - Responsive */}
      <div className="billlist-header">
        <div className="header-content">
          <h2 className="page-title">📋 All Expenses</h2>
          <p className="page-subtitle">Manage and track your household expenses</p>
        </div>
        <Button 
          onClick={() => navigate('/add-bill')} 
          variant="primary" 
          className="add-expense-btn"
        >
          <i className="fas fa-plus-circle me-2"></i>
          <span className="btn-text">Add Expense</span>
        </Button>
      </div>

      {/* Month/Year Selector - Responsive */}
      <Card className="mb-3 mb-md-4 border-0 shadow-sm month-selector-card">
        <Card.Body className="py-3">
          <Row className="align-items-center g-3">
            <Col xs={12} md={8}>
              <div className="month-info">
                <div className="month-details">
                  <h5 className="month-title">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </h5>
                  <small className="text-muted expense-count">
                    {bills.length} expense{bills.length !== 1 ? 's' : ''} found
                  </small>
                </div>
                <Badge bg="primary" className="total-badge">
                  Total: Rs. {calculateMonthlyTotal().toFixed(2)}
                </Badge>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="filter-controls">
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  size="sm"
                  className="filter-select"
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
                  className="filter-select"
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

      {error && (
        <Alert variant="danger" className="d-flex align-items-center alert-message">
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
          <Card key={billType} className="mb-3 mb-md-4 border-0 shadow-sm category-card">
            <Card.Header className="bg-white border-0 py-3 category-header">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center category-info">
                  <span className="category-icon">{billTypeIcons[billType]}</span>
                  <h5 className="category-name">{billType.replace('_', ' ')}</h5>
                  <Badge bg={billTypeColors[billType]} className="item-count">
                    {typeBills.length}
                  </Badge>
                </div>
                <strong className="text-primary category-total">
                  Rs. {typeTotal.toFixed(2)}
                </strong>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Desktop Table View */}
              <div className="table-responsive desktop-table">
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
                            <Badge bg="success" className="discount-badge">
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

              {/* Mobile Card View */}
              <div className="mobile-bills">
                {typeBills.map((bill) => (
                  <div key={bill.id} className="bill-card">
                    <div className="bill-card-header">
                      <div className="bill-date">
                        <i className="fas fa-calendar-alt me-1"></i>
                        {new Date(bill.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(bill.id)}
                        className="delete-btn-mobile"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                    
                    <div className="bill-card-body">
                      <div className="bill-amount-row">
                        <div className="amount-item">
                          <small className="text-muted">Original</small>
                          <div className="amount-value">Rs. {parseFloat(bill.amount).toFixed(2)}</div>
                        </div>
                        {bill.discount > 0 && (
                          <div className="amount-item">
                            <small className="text-muted">Discount</small>
                            <Badge bg="success" className="discount-badge-mobile">
                              {bill.discount}%
                            </Badge>
                          </div>
                        )}
                        <div className="amount-item">
                          <small className="text-muted">Final</small>
                          <div className="final-amount">Rs. {parseFloat(bill.final_amount).toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {bill.description && (
                        <div className="bill-description">
                          <small className="text-muted">{bill.description}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* No Expenses Message */}
      {bills.length === 0 && (
        <Card className="border-0 shadow-sm empty-state-card">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-receipt fa-3x text-muted"></i>
            </div>
            <h5 className="empty-title">No expenses found for {getMonthName(selectedMonth)} {selectedYear}</h5>
            <p className="text-muted mb-3 empty-text">
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