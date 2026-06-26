import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

// ── Shared background decoration ─────────────────────────────
const BgDecor = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
    <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, error }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
        )}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-dark"
          style={{ paddingLeft: Icon ? '2.25rem' : '0.875rem', paddingRight: isPassword ? '2.5rem' : '0.875rem' }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 2 }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>{error}</span>}
    </div>
  );
};

// ── LOGIN PAGE ────────────────────────────────────────────────
export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'mentor' ? '/mentor/dashboard' : '/mentee/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', padding: '1rem', position: 'relative' }}>
      <BgDecor />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 0.25rem' }}>Mentor Connect</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <InputField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" icon={Mail} />
            <InputField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" icon={Lock} />

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', color: '#fb7185' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Create account →</Link>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          💡 Register as a <strong style={{ color: '#818cf8' }}>Mentor</strong> first, then register <strong style={{ color: '#818cf8' }}>Mentees</strong> and link them.
        </div>
      </div>
    </div>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'mentee', mentorId: '', department: '', batch: '' });
  const [mentors, setMentors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    authAPI.getMentors().then(r => setMentors(r.data.mentors || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'mentor' ? '/mentor/dashboard' : '/mentee/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', padding: '1.5rem', position: 'relative' }}>
      <BgDecor />
      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 0.25rem' }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Join the Mentor Connect platform</p>
        </div>

        <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem' }}>
          {/* Role toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[{ value: 'mentee', label: 'Mentee', icon: BookOpen }, { value: 'mentor', label: 'Mentor', icon: User }].map(({ value, label, icon: Icon }) => (
              <button
                key={value} type="button"
                onClick={() => setForm(f => ({ ...f, role: value }))}
                style={{
                  padding: '0.75rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: form.role === value ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                  color: form.role === value ? '#fff' : '#64748b',
                  boxShadow: form.role === value ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InputField label="Full Name *" value={form.fullName} onChange={set('fullName')} placeholder="Jane Doe" icon={User} />
            <InputField label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" icon={Mail} />
            <InputField label="Password *" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" icon={Lock} />

            {form.role === 'mentee' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</label>
                    <input className="input-dark" value={form.department} onChange={set('department')} placeholder="e.g. CSE" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch</label>
                    <input className="input-dark" value={form.batch} onChange={set('batch')} placeholder="2022–2026" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Mentor (optional)</label>
                  <select className="input-dark" value={form.mentorId} onChange={set('mentorId')}>
                    <option value="">— Select a mentor —</option>
                    {mentors.map(m => <option key={m._id} value={m._id}>{m.fullName} ({m.email})</option>)}
                  </select>
                </div>
              </>
            )}

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', color: '#fb7185' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
