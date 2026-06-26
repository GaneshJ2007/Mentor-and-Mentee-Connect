import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Loader2, UserPlus, Mail } from 'lucide-react';
import { mentorAPI } from '../../utils/api';
import { Badge, ProgressBar, EmptyState, useToast } from '../shared/UI';

export default function MentorMenteesPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    mentorAPI.getDashboard()
      .then(({ data }) => setMentees(data.mentees || []))
      .catch(() => show('Failed to load mentees', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = mentees
    .filter(m => !search ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.profile?.department?.toLowerCase().includes(search.toLowerCase()) ||
      m.profile?.rollNumber?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'cgpa') return (b.profile?.overallCgpa || 0) - (a.profile?.overallCgpa || 0);
      if (sortBy === 'completeness') return (b.profile?.profileCompleteness || 0) - (a.profile?.profileCompleteness || 0);
      return 0;
    });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToastContainer />
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>My Mentees</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{mentees.length} student{mentees.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
          <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, roll, department…" style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select className="input-dark" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 200 }}>
          <option value="name">Sort: Name A–Z</option>
          <option value="cgpa">Sort: CGPA (High–Low)</option>
          <option value="completeness">Sort: Profile Completeness</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No mentees found" message={search ? 'No results match your search.' : 'Mentees will appear once they register and select you as their mentor.'} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: '1rem', alignItems: 'center' }}>
            {['Student', 'Department', 'Batch', 'CGPA', 'Profile %', 'Action'].map(h => (
              <span key={h} style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((mentee, idx) => {
            const p = mentee.profile;
            const cgpa = p?.overallCgpa;
            const cgpaColor = cgpa >= 8.5 ? '#10b981' : cgpa >= 7 ? '#6366f1' : cgpa >= 6 ? '#f59e0b' : '#f43f5e';
            return (
              <div key={mentee._id}
                style={{ padding: '0.875rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px', gap: '1rem', alignItems: 'center', borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/mentor/mentee/${mentee._id}`)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name + email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '0.625rem', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                    {mentee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mentee.fullName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mentee.email}</div>
                  </div>
                </div>

                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{p?.department || '—'}</span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{p?.batch || '—'}</span>

                <span style={{ fontSize: '1rem', fontWeight: 700, color: cgpa ? cgpaColor : '#475569' }}>{cgpa || '—'}</span>

                <div>
                  <ProgressBar value={p?.profileCompleteness || 0} height={5} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, display: 'block' }}>{p?.profileCompleteness || 0}%</span>
                </div>

                <button
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={e => { e.stopPropagation(); navigate(`/mentor/mentee/${mentee._id}`); }}
                >
                  <Eye size={13} /> View
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
