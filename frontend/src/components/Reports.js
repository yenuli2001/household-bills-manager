import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Table, Badge } from 'react-bootstrap';
import { billService } from '../services/api';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import './Reports.css';

const Reports = () => {
  const [yearlyData, setYearlyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyBudget] = useState(() => {
    return localStorage.getItem('monthlyBudget') || '';
  });

  useEffect(() => {
    fetchReportsData();
  }, [selectedYear]);

  const fetchReportsData = async () => {
    try {
      const today = new Date();
      const [yearlyResponse, summaryResponse] = await Promise.all([
        billService.getYearlyOverview(selectedYear),
        billService.getMonthlySummary(today.getMonth() + 1, selectedYear)
      ]);
      setYearlyData(yearlyResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    }
  };

  // Calculate important yearly metrics
  const totalYearlyExpense = yearlyData.reduce((sum, month) => sum + month.total, 0);
  const highestSpendingMonth = yearlyData.reduce((max, month) => month.total > max.total ? month : max, {total: 0, month: 1});
  const lowestSpendingMonth = yearlyData.reduce((min, month) => month.total > 0 && (min.total === 0 || month.total < min.total) ? month : min, {total: 0, month: 1});

  const pieChartData = summary ? [
    { name: 'Electricity', value: parseFloat(summary.total_electricity) },
    { name: 'Water', value: parseFloat(summary.total_water) },
    { name: 'Grocery', value: parseFloat(summary.total_grocery) },
    { name: 'Banking', value: parseFloat(summary.total_banking) },
    { name: 'Loan', value: parseFloat(summary.total_loan) },
    { name: 'Credit Card', value: parseFloat(summary.total_credit_card) },
    { name: 'Phone', value: parseFloat(summary.total_phone) },
    { name: 'WiFi', value: parseFloat(summary.total_wifi) },
    { name: 'Fuel', value: parseFloat(summary.total_fuel) },
    { name: 'Vehicle Repairs', value: parseFloat(summary.total_vehicle_repair) },
    { name: 'Other', value: parseFloat(summary.total_other) }
  ].filter(item => item.value > 0) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#D084D0', '#FF6B6B', '#4ECDC4'];

  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || '';
  };

  return (
    <div className="reports-container">
      {/* Header - Responsive */}
      <div className="reports-header">
        <div className="header-content">
          <h2 className="page-title">📊 Expense Reports</h2>
          <p className="page-subtitle">Analytics and insights for your expenses</p>
        </div>
        <Form.Group className="mb-0 year-selector">
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="fw-semibold year-select"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {/* Key Metrics - Responsive Grid */}
      <Row className="g-3 mb-3 mb-md-4">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm text-center metric-card">
            <Card.Body className="p-3">
              <div className="text-primary mb-2 metric-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h4 className="text-primary metric-value">Rs. {totalYearlyExpense.toFixed(2)}</h4>
              <small className="text-muted metric-label">Total {selectedYear} Expenses</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4}>
          <Card className="border-0 shadow-sm text-center metric-card">
            <Card.Body className="p-3">
              <div className="text-warning mb-2 metric-icon">
                <i className="fas fa-arrow-up"></i>
              </div>
              <h4 className="text-warning metric-value">Rs. {highestSpendingMonth.total.toFixed(2)}</h4>
              <small className="text-muted metric-label">Peak ({getMonthName(highestSpendingMonth.month)})</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4}>
          <Card className="border-0 shadow-sm text-center metric-card">
            <Card.Body className="p-3">
              <div className="text-info mb-2 metric-icon">
                <i className="fas fa-arrow-down"></i>
              </div>
              <h4 className="text-info metric-value">Rs. {lowestSpendingMonth.total.toFixed(2)}</h4>
              <small className="text-muted metric-label">Low ({getMonthName(lowestSpendingMonth.month)})</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row - Stacks on Mobile */}
      <Row className="g-3 mb-3 mb-md-4">
        {/* Expense Distribution Pie Chart */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100 chart-card">
            <Card.Header className="bg-white border-0 py-3 chart-header">
              <h5 className="mb-0 chart-title">
                <i className="fas fa-chart-pie me-2 text-success"></i>
                Expense Distribution
              </h5>
            </Card.Header>
            <Card.Body className="chart-body">
              {pieChartData.length > 0 ? (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Rs. ${value.toFixed(2)}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-5 text-muted empty-chart">
                  <i className="fas fa-chart-pie fa-2x mb-3"></i>
                  <p>No data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Budget & Savings Summary */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100 budget-card">
            <Card.Header className="bg-white border-0 py-3 chart-header">
              <h5 className="mb-0 chart-title">
                <i className="fas fa-target me-2 text-primary"></i>
                Budget & Savings
              </h5>
            </Card.Header>
            <Card.Body className="budget-body">
              {monthlyBudget ? (
                <div>
                  <div className="text-center mb-3 mb-md-4 budget-status">
                    <h3 className={`budget-status-title ${totalYearlyExpense > (parseFloat(monthlyBudget) * 12) ? 'text-danger' : 'text-success'}`}>
                      {totalYearlyExpense > (parseFloat(monthlyBudget) * 12) ? 'Over Budget' : 'Within Budget'}
                    </h3>
                    <div className="budget-amount">
                      Rs. {Math.abs(totalYearlyExpense - (parseFloat(monthlyBudget) * 12)).toFixed(2)}
                      <small className="budget-label ms-2">
                        {totalYearlyExpense > (parseFloat(monthlyBudget) * 12) ? 'Over' : 'Under'}
                      </small>
                    </div>
                  </div>

                  <div className="mb-3 budget-progress">
                    <div className="d-flex justify-content-between mb-1 budget-details">
                      <small className="text-muted">Budget: Rs. {(parseFloat(monthlyBudget) * 12).toFixed(2)}</small>
                      <small className="text-muted">Actual: Rs. {totalYearlyExpense.toFixed(2)}</small>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar ${totalYearlyExpense > (parseFloat(monthlyBudget) * 12) ? 'bg-danger' : 'bg-success'}`}
                        style={{ 
                          width: `${Math.min((totalYearlyExpense / (parseFloat(monthlyBudget) * 12)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted budget-usage">
                      {((totalYearlyExpense / (parseFloat(monthlyBudget) * 12)) * 100).toFixed(1)}% of budget used
                    </small>
                  </div>

                  {summary?.total_savings > 0 && (
                    <div className="text-center p-3 bg-light rounded savings-box">
                      <Badge bg="success" className="savings-badge mb-2">
                        🎯 Discount Savings
                      </Badge>
                      <div className="fw-bold savings-amount text-success">
                        Rs. {summary.total_savings.toFixed(2)}
                      </div>
                      <small className="text-muted savings-text">
                        Saved through discounts this year
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5 text-muted empty-budget">
                  <i className="fas fa-bullseye fa-2x mb-3"></i>
                  <h6>No Budget Set</h6>
                  <p className="small">Set a monthly budget in Dashboard to track savings</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current Month Summary - Responsive Table */}
      {summary && (
        <Row className="mt-3 mt-md-4">
          <Col>
            <Card className="border-0 shadow-sm breakdown-card">
              <Card.Header className="bg-white border-0 py-3 chart-header">
                <h5 className="mb-0 chart-title">
                  <i className="fas fa-table me-2 text-info"></i>
                  Current Month Breakdown
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Desktop Table */}
                <div className="desktop-breakdown">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Category</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pieChartData.map((category, index) => (
                          <tr key={category.name}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="color-dot me-2" 
                                  style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%'
                                  }}
                                ></div>
                                {category.name}
                              </div>
                            </td>
                            <td className="text-end fw-bold">Rs. {category.value.toFixed(2)}</td>
                            <td className="text-end">
                              <Badge bg="light" text="dark">
                                {((category.value / summary.total_all) * 100).toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        <tr className="fw-bold border-top">
                          <td>Total</td>
                          <td className="text-end text-primary">Rs. {summary.total_all.toFixed(2)}</td>
                          <td className="text-end">100%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="mobile-breakdown">
                  {pieChartData.map((category, index) => (
                    <div key={category.name} className="breakdown-item">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div 
                            className="color-dot-mobile me-2" 
                            style={{
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                          <span className="category-name-mobile">{category.name}</span>
                        </div>
                        <div className="text-end">
                          <div className="amount-mobile fw-bold">Rs. {category.value.toFixed(2)}</div>
                          <Badge bg="light" text="dark" className="percentage-badge">
                            {((category.value / summary.total_all) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="breakdown-total">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-primary total-amount-mobile">
                      Rs. {summary.total_all.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Reports;