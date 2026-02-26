import React, { useState } from 'react';
import { billService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Addbill.css';

const BILL_TYPES = [
  { value: 'ELECTRICITY',    label: 'Electricity',    icon: '⚡' },
  { value: 'WATER',          label: 'Water',          icon: '💧' },
  { value: 'GROCERY',        label: 'Grocery',        icon: '🛒' },
  { value: 'BANKING',        label: 'Banking',        icon: '🏦' },
  { value: 'LOAN',           label: 'Loan Payment',   icon: '💰' },
  { value: 'CREDIT_CARD',    label: 'Credit Card',    icon: '💳' },
  { value: 'PHONE',          label: 'Phone Bill',     icon: '📱' },
  { value: 'WIFI',           label: 'WiFi',           icon: '🌐' },
  { value: 'FUEL',           label: 'Fuel',           icon: '⛽' },
  { value: 'VEHICLE_REPAIR', label: 'Vehicle Repair', icon: '🔧' },
  { value: 'OTHER',          label: 'Other',          icon: '📦' },
];

function fmt(n) {
  return parseFloat(n || 0).toFixed(2);
}

export default function AddBill() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bill_type: 'ELECTRICITY',
    amount: '',
    discount: '0',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const amount   = parseFloat(form.amount) || 0;
  const discount = parseFloat(form.discount) || 0;
  const discAmt  = (amount * discount) / 100;
  const finalAmt = amount - discAmt;

  const selectedMeta = BILL_TYPES.find(t => t.value === form.bill_type);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true); setError('');
    try {
      await billService.createBill({
        ...form,
        amount: parseFloat(form.amount),
        discount: parseFloat(form.discount),
      });
      navigate('/bills');
    } catch {
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper animate-fade-up">
      <div className="addbill-layout">

        {/* ── Form Card ── */}
        <div className="hbm-card addbill-card">
          <div className="card-header-clean">
            <div>
              <h1 className="page-heading" style={{ fontSize: '1.4rem' }}>Add Expense</h1>
              <p className="page-subheading">Record a new bill or expense</p>
            </div>
            <button className="btn-ghost-hbm" onClick={() => navigate('/bills')}>
              ← Back
            </button>
          </div>

          <form className="card-body-clean addbill-form" onSubmit={handleSubmit}>

            {error && <div className="alert-hbm error"><span>⚠</span> {error}</div>}

            {/* Type grid selector */}
            <div>
              <label className="form-label-hbm">Expense Type</label>
              <div className="type-grid">
                {BILL_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`type-btn ${form.bill_type === t.value ? 'selected' : ''}`}
                    onClick={() => set('bill_type', t.value)}
                  >
                    <span className="type-btn-icon">{t.icon}</span>
                    <span className="type-btn-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + Discount */}
            <div className="form-row-2">
              <div>
                <label className="form-label-hbm">Amount (Rs.)</label>
                <input
                  type="number"
                  className="form-control-hbm"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="form-label-hbm">Discount (%)</label>
                <input
                  type="number"
                  className="form-control-hbm"
                  placeholder="0"
                  value={form.discount}
                  onChange={e => set('discount', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="form-label-hbm">Date</label>
              <input
                type="date"
                className="form-control-hbm"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label-hbm">Description <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--gray-400)' }}>(optional)</span></label>
              <textarea
                className="form-control-hbm"
                rows={3}
                placeholder="Add a note about this expense…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* Submit */}
            <button className="btn-primary-hbm submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-hbm" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                  Saving…
                </>
              ) : (
                <> + Save Expense</>
              )}
            </button>
          </form>
        </div>

        {/* ── Preview Card ── */}
        <div className="addbill-preview">
          <div className="hbm-card preview-card">
            <div className="card-header-clean">
              <div className="section-title">📋 Preview</div>
            </div>
            <div className="card-body-clean">
              <div className="preview-type-row">
                <span className="preview-icon">{selectedMeta?.icon}</span>
                <span className="preview-type-name">{selectedMeta?.label}</span>
              </div>

              <div className="preview-amounts">
                <div className="preview-row">
                  <span className="preview-row-label">Original Amount</span>
                  <span className="preview-row-value">Rs. {fmt(amount)}</span>
                </div>
                {discount > 0 && (
                  <div className="preview-row">
                    <span className="preview-row-label">Discount ({discount}%)</span>
                    <span className="preview-row-value" style={{ color: 'var(--success-600)' }}>- Rs. {fmt(discAmt)}</span>
                  </div>
                )}
                <div className="preview-divider"></div>
                <div className="preview-row final">
                  <span>Final Amount</span>
                  <span style={{ color: 'var(--brand-600)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.25rem' }}>
                    Rs. {fmt(finalAmt)}
                  </span>
                </div>
              </div>

              {discount > 0 && amount > 0 && (
                <div className="preview-savings">
                  🎉 You save Rs. {fmt(discAmt)} with this discount!
                </div>
              )}

              <div className="preview-date">
                📅 {form.date ? new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}