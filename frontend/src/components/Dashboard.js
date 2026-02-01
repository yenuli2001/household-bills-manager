import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Form, Badge, Button, Modal } from 'react-bootstrap';
import { billService } from '../services/api';
import './Dashboard.css'; // We'll create this file

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
    { title: '⚡ Electricity', value: summary?.total_electricity, color: 'primary', icon: '⚡' },
    { title: '💧 Water', value: summary?.total_water, color: 'info', icon: '💧' },
    { title: '🛒 Grocery', value: summary?.total_grocery, color: 'success', icon: '🛒' },
    { title: '🏦 Banking', value: summary?.total_banking, color: 'secondary', icon: '🏦' },
    { title: '💰 Loan Payment', value: summary?.total_loan, color: 'warning', icon: '💰' },
    { title: '💳 Credit Card', value: summary?.total_credit_card, color: 'dark', icon: '💳' },
    { title: '📱 Phone Bill', value: summary?.total_phone, color: 'primary', icon: '📱' },
    { title: '🌐 WiFi Bill', value: summary?.total_wifi, color: 'info', icon: '🌐' },
    { title: '⛽ Fuel', value: summary?.total_fuel, color: 'danger', icon: '⛽' },
    { title: '🔧 Vehicle Repairs', value: summary?.total_vehicle_repair, color: 'warning', icon: '🔧' },
    { title: '📦 Other Expenses', value: summary?.total_other, color: 'secondary', icon: '📦' },
  ];

  if (loading) return (
    <div className="text-center loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading your expenses...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <Alert variant="danger" className="d-flex align-items-center">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    </div>
  );

  const remainingBudget = calculateRemainingBudget();
  const budgetUsage = calculateBudgetUsage();

  return (
    <div className="dashboard-container">
      {/* Header Section - Responsive */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="dashboard-title">💰 Expense Dashboard</h2>
          <p className="dashboard-subtitle">Track and manage your monthly expenses</p>
        </div>
        <div className="header-filters">
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
      </div>

      {/* Budget and Total Section - Stacks on Mobile */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100 budget-card">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0 budget-title">🎯 Monthly Budget</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setTempBudget(monthlyBudget);
                  setShowBudgetModal(true);
                }}
                className="budget-btn"
              >
                <i className="fas fa-edit me-1"></i>
                {monthlyBudget ? 'Edit' : 'Set'} Budget
              </Button>
            </Card.Header>
            <Card.Body>
              {monthlyBudget ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <div>
                      <small className="text-muted">Monthly Budget</small>
                      <h3 className="text-success mb-0 budget-amount">
                        Rs. {parseFloat(monthlyBudget).toFixed(2)}
                      </h3>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Remaining</small>
                      <h4 className={`mb-0 remaining-amount ${remainingBudget >= 0 ? 'text-success' : 'text-danger'}`}>
                        Rs. {Math.abs(remainingBudget).toFixed(2)}
                      </h4>
                      <small className={remainingBudget >= 0 ? 'text-success' : 'text-danger'}>
                        {remainingBudget >= 0 ? 'Left' : 'Over Budget'}
                      </small>
                    </div>
                  </div>

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

                  <div className="d-flex justify-content-between text-center mt-3 budget-stats">
                    <div>
                      <div className="fw-bold text-dark stat-value">
                        Rs. {summary?.total_all?.toFixed(2) || '0.00'}
                      </div>
                      <small className="text-muted">Spent</small>
                    </div>
                    <div>
                      <div className={`fw-bold stat-value ${remainingBudget >= 0 ? 'text-success' : 'text-danger'}`}>
                        {remainingBudget >= 0 ? 'Rs. ' + remainingBudget.toFixed(2) : '-Rs. ' + Math.abs(remainingBudget).toFixed(2)}
                      </div>
                      <small className="text-muted">Balance</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 no-budget">
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

        {/* Total Summary Card - Responsive */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-lg bg-gradient-primary text-white h-100 total-card">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-start mb-2 flex-wrap gap-2">
                <div className="bg-white bg-opacity-20 rounded-circle p-2 icon-wrapper">
                  <i className="fas fa-chart-pie fa-lg text-white"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-white-50 mb-1 total-header">
                    {getMonthName(selectedMonth)} {selectedYear} Expenses
                  </h6>
                  <h1 className="mb-2 fw-bold text-white total-amount">
                    Rs. {summary?.total_all?.toFixed(2) || '0.00'}
                  </h1>
                  
                  <div className="d-flex flex-wrap gap-2 gap-md-3 metrics-row">
                    {summary?.total_savings > 0 && (
                      <div className="savings-badge">
                        <span className="text-success fw-bold">
                          💰 Rs. {summary.total_savings.toFixed(2)} Saved
                        </span>
                      </div>
                    )}
                    {monthlyBudget && (
                      <div className="budget-badge">
                        <span className={remainingBudget >= 0 ? 'text-warning fw-bold' : 'text-danger fw-bold'}>
                          {remainingBudget >= 0 ? '📊 ' : '⚠️ '}
                          Rs. {Math.abs(remainingBudget).toFixed(2)} {remainingBudget >= 0 ? 'Left' : 'Over'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-3 gap-md-4 mt-3 summary-stats">
                <div>
                  <small className="text-white-50">Avg. Discount</small>
                  <div className="fw-bold">{summary?.average_discount?.toFixed(1) || '0'}%</div>
                </div>
                <div>
                  <small className="text-white-50">Categories</small>
                  <div className="fw-bold">
                    {cardData.filter(card => card.value > 0).length}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expense Categories - Responsive Grid */}
      <Row className="g-3">
        {cardData.map((card, index) => (
          <Col xs={6} sm={6} md={4} lg={3} xl={3} key={index}>
            <Card className="h-100 border-0 shadow-sm hover-shadow expense-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <h6 className="card-title text-muted mb-2 expense-title">
                      {card.title}
                    </h6>
                    <h4 className="text-dark mb-0 expense-amount">
                      Rs. {card.value?.toFixed(2) || '0.00'}
                    </h4>
                  </div>
                  <div className={`bg-${card.color} bg-opacity-10 rounded-circle p-2 icon-bg`}>
                    <span className="expense-icon">{card.icon}</span>
                  </div>
                </div>
                <small className="text-muted expense-percentage">
                  {summary?.total_all ? `${((card.value / summary.total_all) * 100 || 0).toFixed(1)}% of total` : '0%'}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
        
        {/* Total Expenses Card */}
        <Col xs={6} sm={6} md={4} lg={3} xl={3}>
          <Card className="h-100 border-0 shadow-lg bg-success text-white expense-card">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50 mb-2 expense-title">
                    💰 Total
                  </h6>
                  <h4 className="text-white mb-0 expense-amount">
                    Rs. {summary?.total_all?.toFixed(2) || '0.00'}
                  </h4>
                  {summary?.total_savings > 0 && (
                    <small className="text-white-50 d-none d-sm-block">After discounts</small>
                  )}
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2 icon-bg">
                  <i className="fas fa-wallet text-white expense-icon"></i>
                </div>
              </div>
              {summary?.total_savings > 0 && (
                <Badge bg="light" text="dark" className="savings-badge-small">
                  Saved Rs. {summary.total_savings.toFixed(2)}
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats - Stacks on Mobile */}
      {summary && summary.total_all > 0 && (
        <Row className="mt-4 g-3">
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm stats-card">
              <Card.Body>
                <h6 className="text-muted mb-3">📊 This Month's Overview</h6>
                <div className="d-flex justify-content-between text-center stats-grid">
                  <div>
                    <div className="text-primary fw-bold stat-number">
                      {cardData.filter(card => card.value > 0).length}
                    </div>
                    <small className="text-muted stat-label">Active</small>
                  </div>
                  <div>
                    <div className="text-success fw-bold stat-number">
                      {summary.average_discount?.toFixed(1)}%
                    </div>
                    <small className="text-muted stat-label">Discount</small>
                  </div>
                  <div>
                    <div className="text-info fw-bold stat-number">
                      {(() => {
                        const highestCategory = cardData.reduce((max, card) =>
                          card.value > max.value ? card : max, { value: 0, title: 'None' }
                        );
                        return highestCategory.title.split(' ')[1] || highestCategory.title.substring(0, 8);
                      })()}
                    </div>
                    <small className="text-muted stat-label">Highest</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm stats-card">
              <Card.Body>
                <h6 className="text-muted mb-3">🎯 Savings Summary</h6>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <div className="text-success fw-bold stat-number">
                      Rs. {summary.total_savings?.toFixed(2) || '0.00'}
                    </div>
                    <small className="text-muted stat-label">Total Savings</small>
                  </div>
                  <div className="text-end">
                    <div className="text-warning fw-bold stat-number">
                      {summary.average_discount?.toFixed(1)}%
                    </div>
                    <small className="text-muted stat-label">Avg. Discount</small>
                  </div>
                </div>
                {summary.total_savings > 0 && (
                  <div className="mt-2">
                    <small className="text-muted savings-info">
                      You saved {((summary.total_savings / summary.original_total_all) * 100).toFixed(1)}% of original expenses
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
        <Card className="border-0 shadow-sm text-center py-5 mt-4 empty-state">
          <Card.Body>
            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No expenses for {getMonthName(selectedMonth)} {selectedYear}</h5>
            <p className="text-muted">Start tracking by adding your first bill.</p>
          </Card.Body>
        </Card>
      )}

      {/* Budget Modal - Mobile Optimized */}
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
              Track your monthly savings
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="flex-wrap gap-2">
          {monthlyBudget && (
            <Button variant="outline-danger" onClick={handleClearBudget} size="sm" className="flex-grow-1 flex-sm-grow-0">
              Clear
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowBudgetModal(false)} size="sm" className="flex-grow-1 flex-sm-grow-0">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBudget} size="sm" className="flex-grow-1 flex-sm-grow-0">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;