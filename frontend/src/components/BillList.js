import React, { useState, useEffect } from 'react';
import { billService } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './BillList.css';

const BILL_TYPE_META = {
  ELECTRICITY:    { label: 'Electricity',    icon: '⚡', color: '#3b82f6', bg: '#eff6ff' },
  WATER:          { label: 'Water',          icon: '💧', color: '#06b6d4', bg: '#ecfeff' },
  GROCERY:        { label: 'Grocery',        icon: '🛒', color: '#22c55e', bg: '#f0fdf4' },
  BANKING:        { label: 'Banking',        icon: '🏦', color: '#8b5cf6', bg: '#f5f3ff' },
  LOAN:           { label: 'Loan',           icon: '💰', color: '#f59e0b', bg: '#fffbeb' },
  CREDIT_CARD:    { label: 'Credit Card',    icon: '💳', color: '#ef4444', bg: '#fef2f2' },
  PHONE:          { label: 'Phone',          icon: '📱', color: '#3b82f6', bg: '#eff6ff' },
  WIFI:           { label: 'WiFi',           icon: '🌐', color: '#06b6d4', bg: '#ecfeff' },
  FUEL:           { label: 'Fuel',           icon: '⛽', color: '#f97316', bg: '#fff7ed' },
  VEHICLE_REPAIR: { label: 'Vehicle Repairs',icon: '🔧', color: '#f59e0b', bg: '#fffbeb' },
  OTHER:          { label: 'Other',          icon: '📦', color: '#6b7280', bg: '#f9fafb' },
};

const BILL_TYPES = Object.keys(BILL_TYPE_META);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BillList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bills, setBills]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selectedMonth, setMonth] = useState(
    searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1
  );
  const [selectedYear, setYear]   = useState(
    searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear()
  );
  const [highlight, setHighlight] = useState(searchParams.get('category') || null);

  useEffect(() => { fetchBills(); }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (highlight && bills.length > 0) {
      const el = document.getElementById(`section-${highlight}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [bills, highlight]);

  async function fetchBills() {
    setLoading(true);
    try {
      const r = await billService.getAllBills();
      const filtered = r.data.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      setBills(filtered);
    } catch { setError('Failed to load expenses'); }
    finally  { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await billService.deleteBill(id);
      fetchBills();
    } catch { setError('Failed to delete expense'); }
  }

  const monthTotal = bills.reduce((s, b) => s + parseFloat(b.final_amount), 0);

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-state">
        <div className="spinner-hbm"></div>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading expenses…</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-up">

      {/* ── Header ── */}
      <div className="bl-header">
        <div>
          <h1 className="page-heading">All Expenses</h1>
          <p className="page-subheading">
            {bills.length} {bills.length === 1 ? 'expense' : 'expenses'} in {MONTHS[selectedMonth-1]} {selectedYear}
            {highlight && (
              <span
                className="highlight-badge"
                onClick={() => setHighlight(null)}
                title="Click to clear"
              >
                {BILL_TYPE_META[highlight]?.icon} {BILL_TYPE_META[highlight]?.label} ✕
              </span>
            )}
          </p>
        </div>
        <div className="bl-header-right">
          <div className="bl-filters">
            <select
              className="form-select-hbm"
              value={selectedMonth}
              onChange={e => { setMonth(parseInt(e.target.value)); setHighlight(null); }}
            >
              {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select
              className="form-select-hbm"
              value={selectedYear}
              onChange={e => { setYear(parseInt(e.target.value)); setHighlight(null); }}
            >
              {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn-primary-hbm" onClick={() => navigate('/add-bill')}>
            <span>+</span> Add Expense
          </button>
        </div>
      </div>

      {/* Total strip */}
      {bills.length > 0 && (
        <div className="bl-total-strip">
          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Total for {MONTHS[selectedMonth-1]}</span>
          <span className="amount-large" style={{ fontSize: '1.25rem', color: 'var(--gray-900)' }}>Rs. {fmt(monthTotal)}</span>
        </div>
      )}

      {error && <div className="alert-hbm error"><span>⚠</span> {error}</div>}

      {/* ── Bill Sections by Category ── */}
      {bills.length === 0 ? (
        <div className="hbm-card">
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <h5>No expenses in {MONTHS[selectedMonth-1]} {selectedYear}</h5>
            <p>Add your first bill to start tracking this month's spending.</p>
            <button className="btn-primary-hbm" style={{ marginTop: 12 }} onClick={() => navigate('/add-bill')}>
              + Add Expense
            </button>
          </div>
        </div>
      ) : (
        BILL_TYPES.map(type => {
          const typeBills = bills.filter(b => b.bill_type === type);
          if (typeBills.length === 0) return null;
          const typeTotal = typeBills.reduce((s,b) => s + parseFloat(b.final_amount), 0);
          const meta = BILL_TYPE_META[type];
          const isHighlighted = highlight === type;

          return (
            <div
              key={type}
              id={`section-${type}`}
              className={`hbm-card bill-section ${isHighlighted ? 'highlighted' : ''}`}
            >
              {/* Section header */}
              <div className="bill-section-header" style={{ borderLeft: `3px solid ${meta.color}` }}>
                <div className="bill-section-left">
                  <div className="bill-type-icon" style={{ background: meta.bg }}>
                    <span>{meta.icon}</span>
                  </div>
                  <div>
                    <div className="bill-type-name">{meta.label}</div>
                    <div className="bill-type-count">{typeBills.length} {typeBills.length === 1 ? 'entry' : 'entries'}</div>
                  </div>
                  {isHighlighted && (
                    <span className="from-dash-badge">← From Dashboard</span>
                  )}
                </div>
                <div className="bill-section-total" style={{ color: meta.color }}>
                  Rs. {fmt(typeTotal)}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="bl-table-wrap">
                <table className="table-hbm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Original</th>
                      <th>Discount</th>
                      <th>Final Amount</th>
                      <th>Description</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeBills.map(bill => (
                      <tr key={bill.id}>
                        <td>
                          <span className="bill-date">
                            {new Date(bill.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                          Rs. {fmt(bill.amount)}
                        </td>
                        <td>
                          {parseFloat(bill.discount) > 0 ? (
                            <span className="badge-hbm badge-green">{bill.discount}% off</span>
                          ) : (
                            <span style={{ color: 'var(--gray-300)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className="amount-medium" style={{ fontSize: '0.95rem', color: 'var(--gray-900)' }}>
                            Rs. {fmt(bill.final_amount)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.82rem', maxWidth: 200 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bill.description || '—'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-danger-hbm"
                            onClick={() => handleDelete(bill.id)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="bl-mobile-cards">
                {typeBills.map(bill => (
                  <div key={bill.id} className="mobile-bill-card">
                    <div className="mobile-bill-top">
                      <span className="bill-date">
                        {new Date(bill.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button className="btn-danger-hbm" onClick={() => handleDelete(bill.id)}>🗑</button>
                    </div>
                    <div className="mobile-bill-amounts">
                      <div className="mobile-amount-item">
                        <div className="mobile-amount-label">Original</div>
                        <div className="mobile-amount-value muted">Rs. {fmt(bill.amount)}</div>
                      </div>
                      {parseFloat(bill.discount) > 0 && (
                        <div className="mobile-amount-item">
                          <div className="mobile-amount-label">Discount</div>
                          <div><span className="badge-hbm badge-green">{bill.discount}% off</span></div>
                        </div>
                      )}
                      <div className="mobile-amount-item">
                        <div className="mobile-amount-label">Final</div>
                        <div className="mobile-amount-value" style={{ color: meta.color }}>Rs. {fmt(bill.final_amount)}</div>
                      </div>
                    </div>
                    {bill.description && (
                      <div className="mobile-bill-desc">{bill.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}