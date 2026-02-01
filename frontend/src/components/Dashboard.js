import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Form, Badge, Button, Modal } from 'react-bootstrap';
import { billService } from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return localStorage.getItem('monthlyBudget') || '';
  });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  const fetchSummary = async () => {
    try {
      const response = await billService.getMonthlySummary(selectedMonth, selectedYear);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = () => {
    const budgetValue = parseFloat(tempBudget);
    if (!isNaN(budgetValue) && budgetValue >= 0) {
      setMonthlyBudget(tempBudget);
      localStorage.setItem('monthlyBudget', tempBudget);
      setShowBudgetModal(false);
      setTempBudget('');
    }
  };

  const handleClearBudget = () => {
    setMonthlyBudget('');
    localStorage.removeItem('monthlyBudget');
    setShowBudgetModal(false);
    setTempBudget('');
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const calculateRemainingBudget = () => {
    if (!monthlyBudget || !summary) return 0;
    const budget = parseFloat(monthlyBudget);
    const totalExpenses = summary.total_all || 0;
    return budget - totalExpenses;
  };

  const calculateBudgetUsage = () => {
    if (!monthlyBudget || !summary) return 0;
    const budget = parseFloat(monthlyBudget);
    const totalExpenses = summary.total_all || 0;
    return (totalExpenses / budget) * 100;
  };

  const cardData = [
    {
      title: '⚡ Electricity',
      value: summary?.total_electricity,
      color: 'primary',
      icon: '⚡'
    },
    {
      title: '💧 Water',
      value: summary?.total_water,
      color: 'info',
      icon: '💧'
    },
    {
      title: '🛒 Grocery',
      value: summary?.total_grocery,
      color: 'success',
      icon: '🛒'
    },
    {
      title: '🏦 Banking',
      value: summary?.total_banking,
      color: 'secondary',
      icon: '🏦'
    },
    {
      title: '💰 Loan Payment',
      value: summary?.total_loan,
      color: 'warning',
      icon: '💰'
    },
    {
      title: '💳 Credit Card',
      value: summary?.total_credit_card,
      color: 'dark',
      icon: '💳'
    },
    {
      title: '📱 Phone Bill',
      value: summary?.total_phone,
      color: 'primary',
      icon: '📱'
    },
    {
      title: '🌐 WiFi Bill',
      value: summary?.total_wifi,
      color: 'info',
      icon: '🌐'
    },
    {
      title: '⛽ Fuel',
      value: summary?.total_fuel,
      color: 'danger',
      icon: '⛽'
    },
    {
      title: '🔧 Vehicle Repairs',
      value: summary?.total_vehicle_repair,
      color: 'warning',
      icon: '🔧'
    },
    {
      title: '📦 Other Expenses',
      value: summary?.total_other,
      color: 'secondary',
      icon: '📦'
    },
  ];

  if (loading) return (
    <div className="text-center" style={{ paddingTop: '80px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading your expenses...</p>
    </div>
  );

  if (error) return (
    <div style={{ paddingTop: '80px' }}>
      <Alert variant="danger" className="d-flex align-items-center">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    </div>
  );

  const remainingBudget = calculateRemainingBudget();
  const budgetUsage = calculateBudgetUsage();

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">💰 Expense Dashboard</h2>
          <p className="text-muted mb-0">  Track and manage your monthly expenses</p>
        </div>
        <div className="d-flex gap-3">
          <Form.Group className="mb-0">
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
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              size="sm"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      {/* Budget Section */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🎯 Monthly Budget</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setTempBudget(monthlyBudget);
                  setShowBudgetModal(true);
                }}
              >
                <i className="fas fa-edit me-1"></i>
                {monthlyBudget ? 'Edit' : 'Set'} Budget
              </Button>
            </Card.Header>
            <Card.Body>
              {monthlyBudget ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <small className="text-muted">Monthly Budget</small>
                      <h3 className="text-success mb-0">Rs. {parseFloat(monthlyBudget).toFixed(2)}</h3>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Remaining</small>
                      <h4 className={remainingBudget >= 0 ? 'text-success mb-0' : 'text-danger mb-0'}>
                        Rs. {Math.abs(remainingBudget).toFixed(2)}
                      </h4>
                      <small className={remainingBudget >= 0 ? 'text-success' : 'text-danger'}>
                        {remainingBudget >= 0 ? 'Left' : 'Over Budget'}
                      </small>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Budget Usage</small>
                      <small className="text-muted">{budgetUsage.toFixed(1)}%</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${budgetUsage > 100 ? 'bg-danger' : budgetUsage > 80 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between text-center mt-3">
                    <div>
                      <div className="fw-bold text-dark">Rs. {summary?.total_all?.toFixed(2) || '0.00'}</div>
                      <small className="text-muted">Spent</small>
                    </div>
                    <div>
                      <div className={`fw-bold ${remainingBudget >= 0 ? 'text-success' : 'text-danger'}`}>
                        {remainingBudget >= 0 ? 'Rs. ' + remainingBudget.toFixed(2) : '-Rs. ' + Math.abs(remainingBudget).toFixed(2)}
                      </div>
                      <small className="text-muted">Balance</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-bullseye fa-2x text-muted mb-3"></i>
                  <h6 className="text-muted">No Budget Set</h6>
                  <p className="text-muted small mb-3">Set a monthly budget to track your savings</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowBudgetModal(true)}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Set Monthly Budget
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Total Summary Card */}
        <Col lg={6}>
          <Card className="border-0 shadow-lg bg-gradient-primary text-white h-100">
            <Card.Body className="p-4">
              <Row className="align-items-center h-100">
                <Col>
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                      <i className="fas fa-chart-pie fa-lg text-white"></i>
                    </div>
                    <div className="flex-grow-1">
                      {/* Header */}
                      <h6 className="text-white-50 mb-1">
                        {getMonthName(selectedMonth)} {selectedYear} Expenses
                      </h6>

                      {/* Main Total - Biggest and Boldest */}
                      <h1 className="mb-2 display-4 fw-bold text-white">
                        Rs. {summary?.total_all?.toFixed(2) || '0.00'}
                      </h1>

                      {/* Key Metrics Row */}
                      <div className="d-flex flex-wrap gap-3">
                        {/* Savings */}
                        {summary?.total_savings > 0 && (
                          <div className="d-flex align-items-center">
                            <span className="text-success fw-bold fs-5">
                              💰 Rs. {summary.total_savings.toFixed(2)} Saved
                            </span>
                          </div>
                        )}

                        {/* Budget Status */}
                        {monthlyBudget && (
                          <div className="d-flex align-items-center">
                            <span className={remainingBudget >= 0 ? 'text-warning fw-bold fs-5' : 'text-danger fw-bold fs-5'}>
                              {remainingBudget >= 0 ? '📊 ' : '⚠️ '}
                              Rs. {Math.abs(remainingBudget).toFixed(2)} {remainingBudget >= 0 ? 'Left' : 'Over'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-4">
                    <div>
                      <small className="text-white-50">Average Discount</small>
                      <div className="fw-bold">{summary?.average_discount?.toFixed(1) || '0'}%</div>
                    </div>
                    <div>
                      <small className="text-white-50">Active Categories</small>
                      <div className="fw-bold">
                        {cardData.filter(card => card.value > 0).length}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expense Categories */}
      <Row>
        {cardData.map((card, index) => (
          <Col xl={3} lg={4} md={6} className="mb-3" key={index}>
            <Card className="h-100 border-0 shadow-sm hover-shadow">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title text-muted mb-2">{card.title}</h6>
                    <h4 className="text-dark mb-0">Rs. {card.value?.toFixed(2) || '0.00'}</h4>
                  </div>
                  <div className={`bg-${card.color} bg-opacity-10 rounded-circle p-2`}>
                    <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    {summary?.total_all ? `${((card.value / summary.total_all) * 100 || 0).toFixed(1)}% of total` : '0% of total'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        
        {/* Total Expenses Card - Added after Other Expenses */}
        <Col xl={3} lg={4} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-lg bg-success text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-title text-white-50 mb-2">💰 Total Expenses</h6>
                  <h4 className="text-white mb-0">Rs. {summary?.total_all?.toFixed(2) || '0.00'}</h4>
                  {summary?.total_savings > 0 && (
                    <small className="text-white-50">
                      After discounts
                    </small>
                  )}
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                  <i className="fas fa-wallet fa-lg text-white"></i>
                </div>
              </div>
              {summary?.total_savings > 0 && (
                <div className="mt-2">
                  <Badge bg="light" text="dark" className="fs-3">
                    Saved Rs. {summary.total_savings.toFixed(2)}
                  </Badge>
                </div>
              )}
              <div className="mt-2">
                <small className="text-white-50">
                  All {cardData.filter(card => card.value > 0).length} categories combined
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      {summary && summary.total_all > 0 && (
        <Row className="mt-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">📊 This Month's Overview</h6>
                <div className="d-flex justify-content-between text-center">
                  <div>
                    <div className="text-primary fw-bold fs-5">
                      {cardData.filter(card => card.value > 0).length}
                    </div>
                    <small className="text-muted">Active Categories</small>
                  </div>
                  <div>
                    <div className="text-success fw-bold fs-5">{summary.average_discount?.toFixed(1)}%</div>
                    <small className="text-muted">Avg. Discount</small>
                  </div>
                  <div>
                    <div className="text-info fw-bold fs-5">
                      {(() => {
                        const highestCategory = cardData.reduce((max, card) =>
                          card.value > max.value ? card : max, { value: 0, title: 'None' }
                        );
                        return highestCategory.title.split(' ')[1] || highestCategory.title;
                      })()}
                    </div>
                    <small className="text-muted">Highest Expense</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">🎯 Savings Summary</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-success fw-bold fs-5">
                      Rs. {summary.total_savings?.toFixed(2) || '0.00'}
                    </div>
                    <small className="text-muted">Total Savings</small>
                  </div>
                  <div className="text-end">
                    <div className="text-warning fw-bold fs-5">
                      {summary.average_discount?.toFixed(1)}%
                    </div>
                    <small className="text-muted">Average Discount</small>
                  </div>
                </div>
                {summary.total_savings > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      You saved {((summary.total_savings / summary.original_total_all) * 100).toFixed(1)}% of your original expenses
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Empty State */}
      {summary && summary.total_all === 0 && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="mb-3">
              <i className="fas fa-chart-line fa-3x text-muted"></i>
            </div>
            <h5 className="text-muted">No expenses recorded for {getMonthName(selectedMonth)} {selectedYear}</h5>
            <p className="text-muted">Start tracking your expenses by adding your first bill.</p>
          </Card.Body>
        </Card>
      )}

      {/* Budget Modal */}
      <Modal show={showBudgetModal} onHide={() => setShowBudgetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>💰 Set Monthly Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Monthly Budget Amount (Rs.)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter your monthly budget"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              autoFocus
            />
            <Form.Text className="text-muted">
              This will help you track how much you're saving each month.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {monthlyBudget && (
            <Button variant="outline-danger" onClick={handleClearBudget}>
              Clear Budget
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowBudgetModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBudget}>
            Save Budget
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;