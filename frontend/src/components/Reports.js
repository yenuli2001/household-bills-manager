import React, { useState, useEffect } from 'react';
import { billService } from '../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import './Reports.css';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#0891b2','#a21caf','#dc2626','#6b7280'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CATEGORIES = [
  { key: 'electricity',    label: 'Electricity',    icon: '⚡' },
  { key: 'water',          label: 'Water',          icon: '💧' },
  { key: 'grocery',        label: 'Grocery',        icon: '🛒' },
  { key: 'banking',        label: 'Banking',        icon: '🏦' },
  { key: 'loan',           label: 'Loan',           icon: '💰' },
  { key: 'credit_card',    label: 'Credit Card',    icon: '💳' },
  { key: 'phone',          label: 'Phone',          icon: '📱' },
  { key: 'wifi',           label: 'WiFi',           icon: '🌐' },
  { key: 'fuel',           label: 'Fuel',           icon: '⛽' },
  { key: 'vehicle_repair', label: 'Vehicle Repairs',icon: '🔧' },
  { key: 'other',          label: 'Other',          icon: '📦' },
];

const getMonthBudget = (m, y) => {
  const v = localStorage.getItem(`monthlyBudget_${y}_${m}`);
  return v ? parseFloat(v) : null;
};

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rpt-tooltip">
      <strong>{label}</strong>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill }}>
          {p.name}: Rs. {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rpt-tooltip">
      <strong>{d.name}</strong>
      <div>Rs. {fmt(d.value)}</div>
      <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
        {((d.value / d.payload.total) * 100).toFixed(1)}% of total
      </div>
    </div>
  );
};

export default function Reports() {
  const [tab, setTab]               = useState('yearly');
  const [selectedYear, setYear]     = useState(new Date().getFullYear());
  const [selectedMonth, setMonth]   = useState(new Date().getMonth() + 1);
  const [yearlyData, setYearlyData] = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);

  const yearOptions = Array.from(
    { length: new Date().getFullYear() - 2019 + 2 },
    (_, i) => new Date().getFullYear() + 1 - i
  );

  useEffect(() => { loadYearly(); }, [selectedYear]);
  useEffect(() => { loadMonthly(); }, [selectedMonth, selectedYear]);

  async function loadYearly() {
    try {
      const r = await billService.getYearlyOverview(selectedYear);
      setYearlyData(r.data);
    } catch (e) { console.error(e); }
  }

  async function loadMonthly() {
    setLoading(true);
    try {
      const r = await billService.getMonthlySummary(selectedMonth, selectedYear);
      setSummary(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Yearly calcs
  const totalYear    = yearlyData.reduce((s, m) => s + m.total, 0);
  const activeMonths = yearlyData.filter(m => m.total > 0).length;
  const avgMonthly   = activeMonths ? totalYear / activeMonths : 0;
  const highM = yearlyData.reduce((a, m) => m.total > a.total ? m : a, { total: 0, month: 1 });
  const lowM  = yearlyData.reduce((a, m) => m.total > 0 && (a.total === 0 || m.total < a.total) ? m : a, { total: 0, month: 1 });

  const barData = yearlyData.map(m => ({
    name:     MONTHS_SHORT[m.month - 1],
    month:    m.month,
    Expenses: parseFloat(m.total.toFixed(2)),
  }));

  // Monthly calcs
  const pieData = summary
    ? CATEGORIES.map((c, i) => ({
        name:  c.label,
        icon:  c.icon,
        value: parseFloat(summary[`total_${c.key}`]) || 0,
        total: summary.total_all,
        fill:  COLORS[i % COLORS.length],
      })).filter(d => d.value > 0)
    : [];

  const monthTotal  = summary?.total_all || 0;
  const monthBudget = getMonthBudget(selectedMonth, selectedYear);
  const budgetUsed  = monthBudget ? (monthTotal / monthBudget) * 100 : null;
  const budgetLeft  = monthBudget ? monthBudget - monthTotal : null;
  const isOver      = budgetLeft !== null && budgetLeft < 0;
  const now         = new Date();

  return (
    <div className="page-wrapper animate-fade-up">

      {/* Header */}
      <div className="rpt-header">
        <div>
          <h1 className="page-heading">Reports</h1>
          <p className="page-subheading">Track where your money goes</p>
        </div>
        <div className="rpt-header-controls">
          {tab === 'monthly' && (
            <select
              className="form-select-hbm rpt-select"
              value={selectedMonth}
              onChange={e => setMonth(parseInt(e.target.value))}
            >
              {MONTHS_FULL.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          )}
          <select
            className="form-select-hbm rpt-select"
            value={selectedYear}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="rpt-tabs">
        <button className={`rpt-tab ${tab === 'yearly' ? 'active' : ''}`} onClick={() => setTab('yearly')}>
          📅 Yearly Overview
        </button>
        <button className={`rpt-tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>
          🗓️ Monthly Detail
        </button>
      </div>

      {/* ══ YEARLY TAB ══ */}
      {tab === 'yearly' && (
        <div className="rpt-tab-content">

          {/* 4 summary boxes */}
          <div className="rpt-metric-grid">
            {[
              { icon: '💸', value: `Rs. ${fmt(totalYear)}`,  label: `Total in ${selectedYear}`,              color: 'var(--brand-600)'   },
              { icon: '📆', value: `Rs. ${fmt(avgMonthly)}`, label: 'Avg per active month',                  color: 'var(--success-600)' },
              { icon: '🔺', value: `Rs. ${fmt(highM.total)}`,label: `Highest — ${MONTHS_FULL[highM.month-1]}`, color: 'var(--warning-600)' },
              { icon: '🔻', value: `Rs. ${fmt(lowM.total)}`, label: `Lowest — ${MONTHS_FULL[lowM.month-1]}`,  color: '#60a5fa'             },
            ].map((m, i) => (
              <div key={i} className="hbm-card rpt-metric-card">
                <div className="rpt-metric-icon">{m.icon}</div>
                <div className="rpt-metric-value" style={{ color: m.color }}>{m.value}</div>
                <div className="rpt-metric-label">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="hbm-card">
            <div className="card-header-clean">
              <div className="section-title">📊 Spending by Month</div>
              <div className="rpt-chart-hint">
                <span className="rpt-dot" style={{ background: '#ef4444' }}></span> Highest &nbsp;
                <span className="rpt-dot" style={{ background: '#22c55e' }}></span> Lowest &nbsp;
                <span className="rpt-dot" style={{ background: '#3b82f6' }}></span> This month
              </div>
            </div>
            <div className="card-body-clean" style={{ paddingTop: 0 }}>
              {totalYear > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={36} />
                    <Tooltip content={<BarTip />} cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="Expenses" radius={[4, 4, 0, 0]} maxBarSize={42}>
                      {barData.map((d, i) => (
                        <Cell key={i} fill={
                          d.month === highM.month ? '#ef4444'
                          : d.month === lowM.month ? '#22c55e'
                          : d.month === now.getMonth() + 1 && selectedYear === now.getFullYear() ? '#3b82f6'
                          : '#93c5fd'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h5>No data for {selectedYear}</h5>
                  <p>Add some expenses to see your chart.</p>
                </div>
              )}
            </div>
          </div>

          {/* Month cards */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title">📋 Month-by-Month</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                {activeMonths} active · Total Rs. {fmt(totalYear)}
              </div>
            </div>
            <div className="rpt-month-grid">
              {yearlyData.map(m => {
                const bgt  = getMonthBudget(m.month, selectedYear);
                const diff = bgt ? bgt - m.total : null;
                const over = diff !== null && diff < 0;
                const pct  = bgt && m.total > 0 ? Math.min((m.total / bgt) * 100, 100) : 0;
                const cur  = m.month === now.getMonth() + 1 && selectedYear === now.getFullYear();
                const isEmpty = m.total === 0;

                return (
                  <div
                    key={m.month}
                    className={`rpt-month-card ${cur ? 'current' : ''} ${isEmpty ? 'empty' : ''}`}
                  >
                    {/* Month name + badge */}
                    <div className="rpt-month-top">
                      <span className="rpt-month-name">{MONTHS_FULL[m.month - 1]}</span>
                      {cur && <span className="badge-hbm badge-blue">Now</span>}
                      {!cur && !isEmpty && over  && <span className="badge-hbm badge-red">Over</span>}
                      {!cur && !isEmpty && !over && diff !== null && <span className="badge-hbm badge-green">✓</span>}
                    </div>

                    {isEmpty ? (
                      <div className="rpt-month-empty">No expenses</div>
                    ) : (
                      <>
                        {/* Spent amount — big and prominent */}
                        <div className="rpt-month-spent">Rs. {fmt(m.total)}</div>

                        {/* Budget progress bar */}
                        {bgt ? (
                          <>
                            <div className="rpt-month-progress">
                              <div
                                className={`rpt-month-bar ${over ? 'over' : pct > 80 ? 'warn' : 'ok'}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <div className="rpt-month-budget-row">
                              <span style={{ color: 'var(--gray-400)' }}>Budget Rs. {fmt(bgt)}</span>
                              <span style={{ color: over ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                                {over ? `−Rs. ${fmt(Math.abs(diff))}` : `+Rs. ${fmt(diff)}`}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-300)', marginTop: 8 }}>No budget set</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ══ MONTHLY TAB ══ */}
      {tab === 'monthly' && (
        <div className="rpt-tab-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-hbm"></div>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading…</p>
            </div>
          ) : (
            <>
              {/* Budget card */}
              <div className="hbm-card">
                <div className="card-header-clean">
                  <div className="section-title">
                    🎯 Budget — {MONTHS_FULL[selectedMonth - 1]} {selectedYear}
                  </div>
                </div>
                <div className="card-body-clean">
                  {monthBudget ? (
                    <>
                      <div className="rpt-budget-row">
                        <div className="rpt-budget-box">
                          <div className="rpt-budget-label">Budget</div>
                          <div className="rpt-budget-value">Rs. {fmt(monthBudget)}</div>
                        </div>
                        <div className="rpt-budget-box">
                          <div className="rpt-budget-label">Spent</div>
                          <div className="rpt-budget-value" style={{ color: 'var(--brand-600)' }}>Rs. {fmt(monthTotal)}</div>
                        </div>
                        <div className="rpt-budget-box">
                          <div className="rpt-budget-label">{isOver ? 'Over by' : 'Remaining'}</div>
                          <div className="rpt-budget-value" style={{ color: isOver ? '#ef4444' : '#22c55e' }}>
                            Rs. {fmt(Math.abs(budgetLeft))}
                          </div>
                        </div>
                      </div>
                      <div className="progress-hbm" style={{ height: 10, marginTop: 16 }}>
                        <div
                          className={`bar ${isOver ? 'bar-red' : budgetUsed > 80 ? 'bar-yellow' : 'bar-green'}`}
                          style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div style={{ fontSize: '0.78rem', marginTop: 8, color: isOver ? '#ef4444' : budgetUsed > 80 ? '#d97706' : 'var(--gray-400)' }}>
                        {isOver
                          ? `🚨 You've gone over budget by Rs. ${fmt(Math.abs(budgetLeft))}.`
                          : budgetUsed > 80
                          ? `⚠️ ${budgetUsed.toFixed(0)}% used — getting close to your limit.`
                          : `${budgetUsed.toFixed(0)}% of your budget used — you're doing well!`
                        }
                      </div>
                      {summary?.total_savings > 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 4 }}>
                          💰 Saved Rs. {fmt(summary.total_savings)} via discounts this month.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                      <div className="empty-icon" style={{ fontSize: '1.75rem' }}>🎯</div>
                      <h5>No budget set for {MONTHS_FULL[selectedMonth - 1]}</h5>
                      <p>Go to the Dashboard to set a monthly budget.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie + legend */}
              {pieData.length > 0 ? (
                <div className="hbm-card">
                  <div className="card-header-clean">
                    <div className="section-title">🥧 Where did the money go?</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Total: Rs. {fmt(monthTotal)}</div>
                  </div>
                  <div className="rpt-pie-layout">
                    <div className="rpt-pie-chart">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={88} dataKey="value" paddingAngle={2}>
                            {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                          </Pie>
                          <Tooltip content={<PieTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rpt-pie-legend">
                      {[...pieData].sort((a, b) => b.value - a.value).map((d, i) => (
                        <div key={i} className="rpt-legend-row">
                          <span className="rpt-legend-dot" style={{ background: d.fill }}></span>
                          <span className="rpt-legend-name">{d.icon} {d.name}</span>
                          <span className="rpt-legend-amount">Rs. {fmt(d.value)}</span>
                          <span className="rpt-legend-pct">{((d.value / monthTotal) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                      <div className="rpt-legend-total">
                        <span style={{ gridColumn: '1/3' }}>Total</span>
                        <span>Rs. {fmt(monthTotal)}</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hbm-card">
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h5>No expenses in {MONTHS_FULL[selectedMonth - 1]} {selectedYear}</h5>
                    <p>Add bills to see your monthly breakdown.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}