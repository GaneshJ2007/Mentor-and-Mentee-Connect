import { Loader2 } from 'lucide-react';

// ── Loading Spinner ───────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} style={{ color: '#6366f1' }} />
);

export const FullPageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', gap: '1rem'
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: '1rem',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Spinner size={28} className="" style={{ color: '#fff' }} />
    </div>
    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading…</p>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = '#6366f1', bg = 'rgba(99,102,241,0.12)', trend }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {Icon && (
        <div style={{ width: 34, height: 34, borderRadius: '0.5rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
      )}
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{value ?? '—'}</span>
      {trend !== undefined && (
        <span style={{ fontSize: '0.75rem', color: trend >= 0 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
        </span>
      )}
    </div>
  </div>
);

// ── Progress Bar ──────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'linear-gradient(90deg,#6366f1,#8b5cf6)', height = 6, label }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</span>
          <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

// ── Badge ─────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'indigo' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '3rem 1rem', gap: '0.75rem', textAlign: 'center'
  }}>
    {Icon && (
      <div style={{
        width: 64, height: 64, borderRadius: '1rem',
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={28} style={{ color: '#6366f1' }} />
      </div>
    )}
    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{title}</h3>
    {message && <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, maxWidth: 300 }}>{message}</p>}
    {action}
  </div>
);

// ── Section Header ────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── Toast notification (simple inline) ───────────────────────
export const Toast = ({ message, type = 'success', onClose }) => {
  const colors = { success: '#10b981', error: '#f43f5e', info: '#6366f1' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1e1e2e', border: `1px solid ${colors[type]}33`,
      borderLeft: `4px solid ${colors[type]}`, borderRadius: '0.75rem',
      padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease',
      maxWidth: 360
    }}>
      <span style={{ fontSize: '0.875rem', color: '#e2e8f0', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
    </div>
  );
};

// ── useToast hook ─────────────────────────────────────────────
import { useState, useCallback } from 'react';
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const ToastContainer = () => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(p => p.filter(x => x.id !== t.id))} />)}
    </div>
  );
  return { show, ToastContainer };
};
