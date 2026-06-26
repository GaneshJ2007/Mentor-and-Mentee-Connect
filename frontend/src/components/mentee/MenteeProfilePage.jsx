import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Target, Code, Heart, Save, Loader2, CheckCircle, BookOpen, GraduationCap } from 'lucide-react';
import { menteeAPI } from '../../utils/api';
import { SectionHeader, ProgressBar, useToast } from '../shared/UI';

const PROGRAMS = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'Other'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function MenteeProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    department: '', program: 'B.E.', specialization: '', rollNumber: '',
    registerNumber: '', batch: '', currentSemester: 1, section: '',
    phone: '', address: '', parentName: '', parentPhone: '',
    bio: '', careerGoals: '', technicalSkills: '', softSkills: '',
    attendancePercentage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    menteeAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        const p = data.profile;
        setForm({
          department: p.department || '',
          program: p.program || 'B.E.',
          specialization: p.specialization || '',
          rollNumber: p.rollNumber || '',
          registerNumber: p.registerNumber || '',
          batch: p.batch || '',
          currentSemester: p.currentSemester || 1,
          section: p.section || '',
          phone: p.phone || '',
          address: p.address || '',
          parentName: p.parentName || '',
          parentPhone: p.parentPhone || '',
          bio: p.bio || '',
          careerGoals: p.careerGoals || '',
          technicalSkills: (p.technicalSkills || []).join(', '),
          softSkills: (p.softSkills || []).join(', '),
          attendancePercentage: p.attendancePercentage ?? '',
        });
      })
      .catch(() => show('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        currentSemester: Number(form.currentSemester),
        attendancePercentage: form.attendancePercentage !== '' ? Number(form.attendancePercentage) : undefined,
        technicalSkills: form.technicalSkills.split(',').map(s => s.trim()).filter(Boolean),
        softSkills: form.softSkills.split(',').map(s => s.trim()).filter(Boolean),
      };
      const { data } = await menteeAPI.updateProfile(payload);
      setProfile(data.profile);
      show('Profile saved successfully!', 'success');
    } catch (err) {
      show(err.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  const completeness = profile?.profileCompleteness || 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>My Profile</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Keep your academic details up to date</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Completeness */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <CheckCircle size={16} style={{ color: completeness >= 80 ? '#10b981' : '#6366f1' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>Profile Completeness</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, color: completeness >= 80 ? '#10b981' : '#818cf8' }}>{completeness}%</span>
        </div>
        <ProgressBar value={completeness} color={completeness >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)'} />
        {completeness < 100 && (
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>
            Complete all sections to help your mentor track your progress better.
          </p>
        )}
      </div>

      {/* Academic Info */}
      <div className="card">
        <SectionHeader title="Academic Details" subtitle="Your institutional and program information" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Department *', key: 'department', placeholder: 'e.g. Computer Science' },
            { label: 'Roll Number', key: 'rollNumber', placeholder: 'e.g. 20CS001' },
            { label: 'Register Number', key: 'registerNumber', placeholder: 'University register no.' },
            { label: 'Batch', key: 'batch', placeholder: 'e.g. 2022–2026' },
            { label: 'Section', key: 'section', placeholder: 'e.g. A' },
            { label: 'Specialization', key: 'specialization', placeholder: 'e.g. AI & ML' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={labelStyle}>{label}</label>
              <input className="input-dark" value={form[key]} onChange={set(key)} placeholder={placeholder} />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Program</label>
            <select className="input-dark" value={form.program} onChange={set('program')}>
              {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Current Semester</label>
            <select className="input-dark" value={form.currentSemester} onChange={set('currentSemester')}>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Attendance %</label>
            <input className="input-dark" type="number" min="0" max="100" value={form.attendancePercentage} onChange={set('attendancePercentage')} placeholder="e.g. 85" />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card">
        <SectionHeader title="Personal Details" subtitle="Contact and family information" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Phone', key: 'phone', placeholder: '+91 99999 99999' },
            { label: 'Parent / Guardian Name', key: 'parentName', placeholder: 'Parent full name' },
            { label: 'Parent Phone', key: 'parentPhone', placeholder: '+91 88888 88888' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={labelStyle}>{label}</label>
              <input className="input-dark" value={form[key]} onChange={set(key)} placeholder={placeholder} />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Address</label>
            <textarea className="input-dark" rows={2} value={form.address} onChange={set('address')} placeholder="Your residential address" style={{ resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Bio & Goals */}
      <div className="card">
        <SectionHeader title="About Me & Goals" subtitle="Let your mentor know you better" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Bio (max 500 chars)</label>
            <textarea
              className="input-dark" rows={3}
              value={form.bio} onChange={set('bio')}
              placeholder="Tell your mentor about yourself, your background, and interests…"
              maxLength={500} style={{ resize: 'vertical' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#475569', textAlign: 'right' }}>{form.bio.length}/500</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Career Goals (max 500 chars)</label>
            <textarea
              className="input-dark" rows={3}
              value={form.careerGoals} onChange={set('careerGoals')}
              placeholder="What are your short-term and long-term career aspirations?"
              maxLength={500} style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <SectionHeader title="Skills" subtitle="List skills separated by commas" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Technical Skills</label>
            <textarea className="input-dark" rows={3} value={form.technicalSkills} onChange={set('technicalSkills')} placeholder="Python, React, SQL, Git, …" style={{ resize: 'vertical' }} />
            {form.technicalSkills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                {form.technicalSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="badge badge-indigo">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Soft Skills</label>
            <textarea className="input-dark" rows={3} value={form.softSkills} onChange={set('softSkills')} placeholder="Leadership, Communication, Teamwork, …" style={{ resize: 'vertical' }} />
            {form.softSkills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                {form.softSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="badge badge-violet">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save button bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
