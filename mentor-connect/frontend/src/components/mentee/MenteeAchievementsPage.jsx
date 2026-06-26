import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Award, BookOpen, Activity, ExternalLink } from 'lucide-react';
import { menteeAPI } from '../../utils/api';
import { Badge, useToast } from '../shared/UI';

const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };

const CERT_DOMAINS = ['Web Development','Data Science','Machine Learning','Cloud Computing','Cybersecurity','Mobile Development','DevOps','Database','Networking','Design','Project Management','Other'];
const PLATFORMS = ['Coursera','Udemy','edX','NPTEL','LinkedIn Learning','Pluralsight','YouTube','College','Other'];
const ACTIVITY_CATEGORIES = ['Sports','Cultural','Technical','Social Service','Leadership','Arts','Music','Dance','Debate','Hackathon','Internship','Research','Other'];
const LEVELS = ['College','District','State','National','International'];

const emptyCert = () => ({ title: '', issuingOrganization: '', issueDate: '', domain: 'Other', credentialId: '', credentialUrl: '', description: '' });
const emptyCourse = () => ({ title: '', platform: 'Other', instructor: '', completionDate: '', duration: '', status: 'Completed', skills: '', certificateUrl: '' });
const emptyActivity = () => ({ title: '', category: 'Other', role: '', organization: '', startDate: '', endDate: '', isOngoing: false, achievement: '', level: 'College', description: '' });

// ── Collapsible item card ─────────────────────────────────────
const ItemCard = ({ index, onRemove, children, summary }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '0.875rem 1.125rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>#{index + 1} {summary && <span style={{ color: '#c7d2fe', marginLeft: 8 }}>{summary}</span>}</span>
      <button onClick={onRemove} className="btn-danger" style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={13} /></button>
    </div>
    <div style={{ padding: '1rem 1.125rem' }}>{children}</div>
  </div>
);

// ── Generic section wrapper ────────────────────────────────────
const SectionBlock = ({ icon: Icon, title, subtitle, color = '#6366f1', onAdd, onSave, saving, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: '0.625rem', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{title}</h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onAdd} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}><Plus size={14} /> Add</button>
        <button onClick={onSave} disabled={saving} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
        </button>
      </div>
    </div>
    {children}
  </div>
);

export default function MenteeAchievementsPage() {
  const [certifications, setCertifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({ cert: false, course: false, activity: false });
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    menteeAPI.getProfile().then(({ data }) => {
      const p = data.profile;
      setCertifications(p.certifications?.length ? p.certifications.map(c => ({ ...c, issueDate: c.issueDate?.split('T')[0] || '' })) : [emptyCert()]);
      setCourses(p.courses?.length ? p.courses.map(c => ({ ...c, completionDate: c.completionDate?.split('T')[0] || '', skills: (c.skills || []).join(', ') })) : [emptyCourse()]);
      setActivities(p.activities?.length ? p.activities.map(a => ({ ...a, startDate: a.startDate?.split('T')[0] || '', endDate: a.endDate?.split('T')[0] || '' })) : [emptyActivity()]);
    }).catch(() => show('Failed to load achievements', 'error')).finally(() => setLoading(false));
  }, []);

  // ── Cert helpers ──────────────────────────────────────────
  const setCert = (idx, key, val) => setCertifications(arr => arr.map((c, i) => i === idx ? { ...c, [key]: val } : c));
  const saveCerts = async () => {
    setSaving(s => ({ ...s, cert: true }));
    try { await menteeAPI.updateCertifications({ certifications }); show('Certifications saved!'); }
    catch (err) { show(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(s => ({ ...s, cert: false })); }
  };

  // ── Course helpers ────────────────────────────────────────
  const setCourse = (idx, key, val) => setCourses(arr => arr.map((c, i) => i === idx ? { ...c, [key]: val } : c));
  const saveCourses = async () => {
    setSaving(s => ({ ...s, course: true }));
    try {
      const payload = courses.map(c => ({ ...c, skills: c.skills.split(',').map(s => s.trim()).filter(Boolean) }));
      await menteeAPI.updateCourses({ courses: payload }); show('Courses saved!');
    } catch (err) { show(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(s => ({ ...s, course: false })); }
  };

  // ── Activity helpers ──────────────────────────────────────
  const setActivity = (idx, key, val) => setActivities(arr => arr.map((a, i) => i === idx ? { ...a, [key]: val } : a));
  const saveActivities = async () => {
    setSaving(s => ({ ...s, activity: true }));
    try { await menteeAPI.updateActivities({ activities }); show('Activities saved!'); }
    catch (err) { show(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(s => ({ ...s, activity: false })); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <ToastContainer />
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Achievements & Portfolio</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Showcase your certifications, courses, and activities</p>
      </div>

      {/* ── Certifications ──────────────────────────────── */}
      <SectionBlock icon={Award} title="Certifications" subtitle="Professional & technical certifications earned" color="#6366f1"
        onAdd={() => setCertifications(arr => [...arr, emptyCert()])} onSave={saveCerts} saving={saving.cert}>
        {certifications.length === 0 && <EmptyHint text="Add your first certification" />}
        {certifications.map((cert, idx) => (
          <ItemCard key={idx} index={idx} summary={cert.title} onRemove={() => setCertifications(arr => arr.filter((_, i) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <Field label="Certification Title *" value={cert.title} onChange={v => setCert(idx, 'title', v)} placeholder="e.g. AWS Certified Developer" />
              <Field label="Issuing Organization *" value={cert.issuingOrganization} onChange={v => setCert(idx, 'issuingOrganization', v)} placeholder="e.g. Amazon Web Services" />
              <Field label="Issue Date" type="date" value={cert.issueDate} onChange={v => setCert(idx, 'issueDate', v)} />
              <Field label="Domain">
                <select className="input-dark" value={cert.domain} onChange={e => setCert(idx, 'domain', e.target.value)}>
                  {CERT_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Credential ID" value={cert.credentialId} onChange={v => setCert(idx, 'credentialId', v)} placeholder="Optional" />
              <Field label="Credential URL" value={cert.credentialUrl} onChange={v => setCert(idx, 'credentialUrl', v)} placeholder="https://…" />
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Description" value={cert.description} onChange={v => setCert(idx, 'description', v)} placeholder="Brief description of the certification" multiline />
              </div>
            </div>
            {cert.domain && <div style={{ marginTop: '0.625rem' }}><Badge variant="indigo">{cert.domain}</Badge></div>}
          </ItemCard>
        ))}
      </SectionBlock>

      {/* ── Courses ──────────────────────────────────────── */}
      <SectionBlock icon={BookOpen} title="Completed Courses" subtitle="Online, offline, and self-paced courses" color="#8b5cf6"
        onAdd={() => setCourses(arr => [...arr, emptyCourse()])} onSave={saveCourses} saving={saving.course}>
        {courses.length === 0 && <EmptyHint text="Add courses you have completed" />}
        {courses.map((course, idx) => (
          <ItemCard key={idx} index={idx} summary={course.title} onRemove={() => setCourses(arr => arr.filter((_, i) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <Field label="Course Title *" value={course.title} onChange={v => setCourse(idx, 'title', v)} placeholder="e.g. Machine Learning Specialization" />
              <Field label="Platform">
                <select className="input-dark" value={course.platform} onChange={e => setCourse(idx, 'platform', e.target.value)}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Instructor" value={course.instructor} onChange={v => setCourse(idx, 'instructor', v)} placeholder="e.g. Andrew Ng" />
              <Field label="Completion Date" type="date" value={course.completionDate} onChange={v => setCourse(idx, 'completionDate', v)} />
              <Field label="Duration" value={course.duration} onChange={v => setCourse(idx, 'duration', v)} placeholder="e.g. 11 weeks" />
              <Field label="Status">
                <select className="input-dark" value={course.status} onChange={e => setCourse(idx, 'status', e.target.value)}>
                  {['Completed', 'In Progress', 'Enrolled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Skills gained (comma-separated)" value={course.skills} onChange={v => setCourse(idx, 'skills', v)} placeholder="Python, TensorFlow, NumPy" />
                {course.skills && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {course.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="badge badge-violet">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <Field label="Certificate URL" value={course.certificateUrl} onChange={v => setCourse(idx, 'certificateUrl', v)} placeholder="https://…" />
            </div>
            <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.375rem' }}>
              <Badge variant={course.status === 'Completed' ? 'emerald' : 'amber'}>{course.status}</Badge>
              <Badge variant="violet">{course.platform}</Badge>
            </div>
          </ItemCard>
        ))}
      </SectionBlock>

      {/* ── Activities ────────────────────────────────────── */}
      <SectionBlock icon={Activity} title="Extra-Curricular Activities" subtitle="Sports, events, hackathons, internships & more" color="#10b981"
        onAdd={() => setActivities(arr => [...arr, emptyActivity()])} onSave={saveActivities} saving={saving.activity}>
        {activities.length === 0 && <EmptyHint text="Add activities that define you outside academics" />}
        {activities.map((act, idx) => (
          <ItemCard key={idx} index={idx} summary={act.title} onRemove={() => setActivities(arr => arr.filter((_, i) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
              <Field label="Activity Title *" value={act.title} onChange={v => setActivity(idx, 'title', v)} placeholder="e.g. Smart India Hackathon" />
              <Field label="Category">
                <select className="input-dark" value={act.category} onChange={e => setActivity(idx, 'category', e.target.value)}>
                  {ACTIVITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Your Role" value={act.role} onChange={v => setActivity(idx, 'role', v)} placeholder="e.g. Team Lead, Participant" />
              <Field label="Organization" value={act.organization} onChange={v => setActivity(idx, 'organization', v)} placeholder="e.g. Government of India" />
              <Field label="Level">
                <select className="input-dark" value={act.level} onChange={e => setActivity(idx, 'level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Achievement / Award" value={act.achievement} onChange={v => setActivity(idx, 'achievement', v)} placeholder="e.g. 2nd Place, Finalist" />
              <Field label="Start Date" type="date" value={act.startDate} onChange={v => setActivity(idx, 'startDate', v)} />
              <div>
                <Field label="End Date" type="date" value={act.isOngoing ? '' : act.endDate} onChange={v => setActivity(idx, 'endDate', v)} disabled={act.isOngoing} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <input type="checkbox" checked={act.isOngoing} onChange={e => setActivity(idx, 'isOngoing', e.target.checked)} style={{ accentColor: '#6366f1' }} />
                  Ongoing
                </label>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Description" value={act.description} onChange={v => setActivity(idx, 'description', v)} placeholder="Describe your role and what you did…" multiline />
              </div>
            </div>
            <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <Badge variant="emerald">{act.category}</Badge>
              <Badge variant="amber">{act.level}</Badge>
              {act.isOngoing && <Badge variant="indigo">Ongoing</Badge>}
            </div>
          </ItemCard>
        ))}
      </SectionBlock>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────
const EmptyHint = ({ text }) => (
  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.08)' }}>
    {text}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = 'text', children, multiline, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={labelStyle}>{label}</label>
    {children ? children : multiline ? (
      <textarea className="input-dark" rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ resize: 'vertical' }} disabled={disabled} />
    ) : (
      <input className="input-dark" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
    )}
  </div>
);
