import React, { useState, useEffect } from 'react';
import { billService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CATEGORIES = [
  { key: 'electricity',   label: 'Electricity',     icon: '⚡', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'water',         label: 'Water',            icon: '💧', color: '#06b6d4', bg: '#ecfeff' },
  { key: 'grocery',       label: 'Grocery',          icon: '🛒', color: '#22c55e', bg: '#f0fdf4' },
  { key: 'banking',       label: 'Banking',          icon: '🏦', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'loan',          label: 'Loan',             icon: '💰', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'credit_card',   label: 'Credit Card',      icon: '💳', color: '#ef4444', bg: '#fef2f2' },
  { key: 'phone',         label: 'Phone',            icon: '📱', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'wifi',          label: 'WiFi',             icon: '🌐', color: '#06b6d4', bg: '#ecfeff' },
  { key: 'fuel',          label: 'Fuel',             icon: '⛽', color: '#f97316', bg: '#fff7ed' },
  { key: 'vehicle_repair',label: 'Vehicle Repairs',  icon: '🔧', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'other',         label: 'Other',            icon: '📦', color: '#6b7280', bg: '#f9fafb' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const getBudgetKey = (m, y) => `monthlyBudget_${y}_${m}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selectedMonth, setMonth]   = useState(new Date().getMonth() + 1);
  const [selectedYear, setYear]     = useState(new Date().getFullYear());
  const [budget, setBudget]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(getBudgetKey(selectedMonth, selectedYear));
    setBudget(saved || '');
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchSummary(); }, [selectedMonth, selectedYear]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const r = await billService.getMonthlySummary(selectedMonth, selectedYear);
      setSummary(r.data);
    } catch { setError('Failed to load data'); }
    finally  { setLoading(false); }
  }

  function saveBudget() {
    const v = parseFloat(tempBudget);
    if (!isNaN(v) && v >= 0) {
      localStorage.setItem(getBudgetKey(selectedMonth, selectedYear), tempBudget);
      setBudget(tempBudget);
      setShowModal(false); setTempBudget('');
    }
  }

  function clearBudget() {
    localStorage.removeItem(getBudgetKey(selectedMonth, selectedYear));
    setBudget(''); setShowModal(false); setTempBudget('');
  }

  const total    = summary?.total_all || 0;
  const budgetN  = budget ? parseFloat(budget) : null;
  const remaining = budgetN ? budgetN - total : null;
  const pct       = budgetN ? Math.min((total / budgetN) * 100, 100) : 0;
  const isOver    = remaining !== null && remaining < 0;

  const topCategories = CATEGORIES
    .map(c => ({ ...c, value: summary?.[`total_${c.key}`] || 0 }))
    .filter(c => c.value > 0)
    .sort((a,b) => b.value - a.value)
    .slice(0, 3);

  function fmt(n) {
    return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-state">
        <div className="spinner-hbm"></div>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-up">

      {/* ── Header Row ── */}
      <div className="dash-header">
        <div>
          <h1 className="page-heading">Dashboard</h1>
          <p className="page-subheading">Your spending overview for {MONTHS[selectedMonth-1]} {selectedYear}</p>
        </div>
        <div className="dash-controls">
          <select
            className="form-select-hbm dash-select"
            value={selectedMonth}
            onChange={e => setMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select
            className="form-select-hbm dash-select"
            value={selectedYear}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert-hbm error">
          <span>⚠</span> {error}
        </div>
      )}

      {/* ── Hero + Budget row ── */}
      <div className="dash-top-row">
        {/* Hero total card */}
        <div className="hero-card">
          <div className="hero-label">Total Spent</div>
          <div className="hero-amount">Rs. {fmt(total)}</div>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Month</div>
              <div className="hero-meta-value">{MONTHS[selectedMonth-1].slice(0,3)} {selectedYear}</div>
            </div>
            {summary?.total_savings > 0 && (
              <div className="hero-meta-item">
                <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved via Discounts</div>
                <div className="hero-meta-value" style={{ color: '#86efac' }}>Rs. {fmt(summary.total_savings)}</div>
              </div>
            )}
            <div className="hero-meta-item">
              <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</div>
              <div className="hero-meta-value">{CATEGORIES.filter(c => (summary?.[`total_${c.key}`]||0) > 0).length} active</div>
            </div>
          </div>

          {/* Budget bar inside hero */}
          {budgetN && (
            <div className="hero-budget-bar">
              <div className="hero-budget-header">
                <span>Budget: Rs. {fmt(budgetN)}</span>
                <span style={{ color: isOver ? '#fca5a5' : '#86efac', fontWeight: 700 }}>
                  {isOver ? `Rs. ${fmt(Math.abs(remaining))} over` : `Rs. ${fmt(remaining)} left`}
                </span>
              </div>
              <div className="hero-progress-track">
                <div
                  className="hero-progress-fill"
                  style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : '#22c55e' }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Budget card */}
        <div className="hbm-card budget-side-card">
          <div className="card-header-clean">
            <div>
              <div className="section-title">🎯 Budget</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>{MONTHS[selectedMonth-1]} {selectedYear}</div>
            </div>
            <button
              className="btn-ghost-hbm"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              onClick={() => { setTempBudget(budget); setShowModal(true); }}
            >
              {budget ? 'Edit' : 'Set Budget'}
            </button>
          </div>
          <div className="card-body-clean">
            {budgetN ? (
              <div className="budget-details-grid">
                <div className="budget-detail-item">
                  <div className="budget-detail-label">Budget</div>
                  <div className="budget-detail-value">Rs. {fmt(budgetN)}</div>
                </div>
                <div className="budget-detail-item">
                  <div className="budget-detail-label">Spent</div>
                  <div className="budget-detail-value" style={{ color: 'var(--brand-600)' }}>Rs. {fmt(total)}</div>
                </div>
                <div className="budget-detail-item">
                  <div className="budget-detail-label">{isOver ? 'Over by' : 'Remaining'}</div>
                  <div className="budget-detail-value" style={{ color: isOver ? 'var(--danger-500)' : 'var(--success-600)' }}>
                    Rs. {fmt(Math.abs(remaining))}
                  </div>
                </div>
                <div className="budget-detail-item">
                  <div className="budget-detail-label">Used</div>
                  <div className="budget-detail-value">{((total/budgetN)*100).toFixed(1)}%</div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="progress-hbm">
                    <div
                      className={`bar ${isOver ? 'bar-red' : pct > 80 ? 'bar-yellow' : 'bar-green'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  {isOver && <p style={{ fontSize: '0.72rem', color: 'var(--danger-500)', marginTop: 6 }}>⚠️ You've exceeded your budget this month.</p>}
                  {!isOver && pct > 80 && <p style={{ fontSize: '0.72rem', color: 'var(--warning-600)', marginTop: 6 }}>⚠️ Over 80% of budget used — spend carefully.</p>}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon" style={{ fontSize: '2rem' }}>🎯</div>
                <h5>No budget set</h5>
                <p>Set a monthly budget to track how much you have left to spend.</p>
                <button className="btn-primary-hbm" style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>
                  Set Budget
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className="section-divider"><span>Expense Categories</span></div>

      {total === 0 ? (
        <div className="hbm-card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h5>No expenses this month</h5>
            <p>Start by adding your first bill for {MONTHS[selectedMonth-1]} {selectedYear}.</p>
            <button className="btn-primary-hbm" style={{ marginTop: 8 }} onClick={() => navigate('/add-bill')}>
              + Add Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="category-grid">
          {CATEGORIES.map(cat => {
            const value = summary?.[`total_${cat.key}`] || 0;
            const pctOfTotal = total ? ((value / total) * 100) : 0;
            if (value === 0) return null;
            return (
              <div
                key={cat.key}
                className="hbm-card clickable category-card"
                onClick={() => navigate(`/bills?category=${cat.key.toUpperCase()}&month=${selectedMonth}&year=${selectedYear}`)}
              >
                <div className="category-card-inner">
                  <div className="cat-icon-wrap" style={{ background: cat.bg }}>
                    <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                  </div>
                  <div className="cat-info">
                    <div className="cat-label">{cat.label}</div>
                    <div className="cat-amount" style={{ color: cat.color }}>Rs. {fmt(value)}</div>
                  </div>
                  <div className="cat-pct">
                    <div className="cat-pct-num">{pctOfTotal.toFixed(1)}%</div>
                    <div className="cat-pct-bar" style={{ '--bar-color': cat.color }}>
                      <div style={{ width: `${pctOfTotal}%`, height: '100%', background: cat.color, borderRadius: 4 }}></div>
                    </div>
                  </div>
                  <span className="cat-arrow">→</span>
                </div>
              </div>
            );
          })}

          {/* All expenses card */}
          <div
            className="hbm-card clickable category-card category-total-card"
            onClick={() => navigate(`/bills?month=${selectedMonth}&year=${selectedYear}`)}
          >
            <div className="category-card-inner">
              <div className="cat-icon-wrap" style={{ background: '#eff6ff' }}>
                <span style={{ fontSize: '1.3rem' }}>💼</span>
              </div>
              <div className="cat-info">
                <div className="cat-label" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>View All</div>
                <div className="cat-amount" style={{ color: 'var(--brand-600)' }}>Rs. {fmt(total)}</div>
              </div>
              <span className="cat-arrow" style={{ color: 'var(--brand-600)' }}>→</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Stats ── */}
      {total > 0 && topCategories.length > 0 && (
        <>
          <div className="section-divider"><span>Top Spending</span></div>
          <div className="top-cats-row">
            {topCategories.map((cat, i) => (
              <div key={cat.key} className="hbm-card top-cat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-400)', width: 16 }}>#{i+1}</div>
                  <div style={{ fontSize: '1.5rem' }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{cat.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>Rs. {fmt(cat.value)}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.color, background: cat.bg, padding: '3px 8px', borderRadius: 999 }}>
                    {((cat.value/total)*100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Budget Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Set Budget</h3>
                <p className="modal-subtitle">{MONTHS[selectedMonth-1]} {selectedYear}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label className="form-label-hbm">Monthly Budget (Rs.)</label>
              <input
                type="number"
                className="form-control-hbm"
                placeholder="e.g. 50000"
                value={tempBudget}
                onChange={e => setTempBudget(e.target.value)}
                autoFocus
                min="0"
                step="0.01"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 8 }}>
                This budget applies only to {MONTHS[selectedMonth-1]} {selectedYear}.
              </p>
            </div>
            <div className="modal-footer">
              {budget && (
                <button className="btn-danger-hbm" onClick={clearBudget}>Clear</button>
              )}
              <button className="btn-ghost-hbm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-hbm" onClick={saveBudget}>Save Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}