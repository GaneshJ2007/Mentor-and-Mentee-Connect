import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Award, CheckCircle, Search, Eye, GraduationCap, BookOpen, Activity, Loader2, RefreshCw } from 'lucide-react';
import { mentorAPI } from '../../utils/api';
import { StatCard, ProgressBar, Badge, EmptyState, useToast } from '../shared/UI';
import { useAuth } from '../../context/AuthContext';

export default function MentorDashboard() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show, ToastContainer } = useToast();

  const load = () => {
    setLoading(true);
    mentorAPI.getDashboard()
      .then(({ data: d }) => setData(d))
      .catch(() => show('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = data?.mentees?.filter(m =>
    !search || m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.profile?.department?.toLowerCase().includes(search.toLowerCase()) ||
    m.profile?.rollNumber?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.fullName?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Here's an overview of your mentees' progress</p>
        </div>
        <button onClick={load} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Mentees" value={data?.stats?.totalMentees || 0} icon={Users} color="#6366f1" bg="rgba(99,102,241,0.12)" />
        <StatCard label="Avg. CGPA" value={data?.stats?.avgCgpa || '—'} icon={TrendingUp} color="#10b981" bg="rgba(16,185,129,0.12)" />
        <StatCard label="Total Certifications" value={data?.stats?.totalCertifications || 0} icon={Award} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
        <StatCard label="Avg. Profile %" value={`${data?.stats?.avgProfileCompleteness || 0}%`} icon={CheckCircle} color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
        <input
          className="input-dark"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search mentees by name, department, or roll number…"
          style={{ paddingLeft: '2.25rem', maxWidth: 480 }}
        />
      </div>

      {/* Mentee grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No mentees found" message={search ? 'No results match your search.' : 'Mentees will appear here once they register and link to your account.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(mentee => (
            <MenteeCard key={mentee._id} mentee={mentee} onView={() => navigate(`/mentor/mentee/${mentee._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenteeCard({ mentee, onView }) {
  const p = mentee.profile;
  const cgpa = p?.overallCgpa;
  const cgpaColor = cgpa >= 8.5 ? '#10b981' : cgpa >= 7 ? '#6366f1' : cgpa >= 6 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
      onClick={onView}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '0.75rem', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 700, color: '#fff',
        }}>
          {mentee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.925rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mentee.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p?.department || 'Dept. N/A'} • {p?.batch || 'Batch N/A'}</div>
        </div>
        {cgpa && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: cgpaColor, lineHeight: 1 }}>{cgpa}</div>
            <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CGPA</div>
          </div>
        )}
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {p?.rollNumber && <Badge variant="indigo">{p.rollNumber}</Badge>}
        {p?.currentSemester && <Badge variant="violet">Sem {p.currentSemester}</Badge>}
        {p?.program && <Badge variant="amber">{p.program}</Badge>}
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {[
          { icon: Award, label: 'Certs', value: p?.certificationCount || 0, color: '#f59e0b' },
          { icon: BookOpen, label: 'Courses', value: p?.courseCount || 0, color: '#8b5cf6' },
          { icon: Activity, label: 'Activities', value: p?.activityCount || 0, color: '#10b981' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
            <Icon size={13} style={{ color, marginBottom: 2 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Profile completeness */}
      {p && (
        <div>
          <ProgressBar value={p.profileCompleteness || 0} label={`Profile ${p.profileCompleteness || 0}% complete`} />
        </div>
      )}

      {/* Attendance */}
      {p?.attendancePercentage != null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Attendance</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.attendancePercentage >= 75 ? '#10b981' : '#f43f5e' }}>
            {p.attendancePercentage}%
          </span>
        </div>
      )}

      {/* CTA */}
      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.625rem' }}
        onClick={e => { e.stopPropagation(); onView(); }}>
        <Eye size={14} /> View Full Analytics
      </button>
    </div>
  );
}
