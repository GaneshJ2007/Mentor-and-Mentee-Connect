import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, BookOpen, Award, LogOut,
  Menu, X, GraduationCap, Users, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menteeLinks = [
  { to: '/mentee/profile', label: 'My Profile', icon: User },
  { to: '/mentee/academics', label: 'Academic Records', icon: BookOpen },
  { to: '/mentee/achievements', label: 'Achievements', icon: Award },
];

const mentorLinks = [
  { to: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mentor/mentees', label: 'My Mentees', icon: Users },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === 'mentor' ? mentorLinks : menteeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f1a', position: 'relative' }}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}
        className="lg-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
            }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 }}>Mentor</div>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Connect</div>
            </div>
          </div>
        </div>

        {/* User pill */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 600, textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.875rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem', marginBottom: '0.25rem' }}>
            Navigation
          </div>
          {links.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to} to={to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.625rem', textDecoration: 'none',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  color: active ? '#818cf8' : '#64748b',
                  fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={12} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.875rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
              color: '#f87171', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(12px)'
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6, borderRadius: '0.5rem', display: 'flex' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              {user?.role === 'mentor' ? 'Mentor Portal' : 'Mentee Portal'}
            </span>
            <ChevronRight size={12} style={{ color: '#334155' }} />
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
              {links.find(l => isActive(l.to))?.label || 'Home'}
            </span>
          </div>

          <button style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748b', borderRadius: '0.5rem', padding: '0.4rem',
            cursor: 'pointer', display: 'flex', position: 'relative'
          }}>
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 4, right: 4, width: 6, height: 6,
              borderRadius: '50%', background: '#6366f1', border: '1px solid #0f0f1a'
            }} />
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }} className="animate-fade-in">
          {children}
        </main>
      </div>

      {/* Desktop sidebar always visible */}
      <style>{`
        @media (min-width: 768px) {
          .lg-sidebar { transform: translateX(0) !important; position: sticky !important; top: 0 !important; height: 100vh !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
