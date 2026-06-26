import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Loader2, Award, BookOpen, Activity,
  TrendingUp, User, Phone, MapPin, Target, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { mentorAPI } from '../../utils/api';
import { StatCard, Badge, ProgressBar, useToast } from '../shared/UI';
import { generateMenteePDF } from '../../utils/pdfGenerator';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899'];

export default function MenteeDetailPage() {
  const { menteeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSems, setExpandedSems] = useState({});
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    mentorAPI.getMenteeDetails(menteeId)
      .then(({ data: d }) => {
        setData(d);
        const init = {};
        d.profile?.semesterExams?.forEach((_, i) => { init[i] = i === d.profile.semesterExams.length - 1; });
        setExpandedSems(init);
      })
      .catch(() => { show('Failed to load mentee data', 'error'); navigate('/mentor/dashboard'); })
      .finally(() => setLoading(false));
  }, [menteeId]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { data: pdfResp } = await mentorAPI.getMenteePdfData(menteeId);
      const fileName = generateMenteePDF(pdfResp.pdfData);
      show(`PDF downloaded: ${fileName}`, 'success');
    } catch (err) {
      show('PDF generation failed', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  const { mentee, profile, analytics } = data;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academic Records' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToastContainer />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate('/mentor/dashboard')} className="btn-ghost">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <button onClick={handleDownloadPdf} disabled={pdfLoading} className="btn-primary" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {pdfLoading ? 'Generating PDF…' : 'Download PDF Report'}
        </button>
      </div>

      {/* Student hero card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '1.25rem', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
          }}>
            {mentee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 0.25rem' }}>{mentee.fullName}</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{mentee.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {profile?.department && <Badge variant="indigo">{profile.department}</Badge>}
              {profile?.program && <Badge variant="violet">{profile.program}</Badge>}
              {profile?.batch && <Badge variant="amber">{profile.batch}</Badge>}
              {profile?.rollNumber && <Badge variant="emerald">{profile.rollNumber}</Badge>}
              {profile?.currentSemester && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Sem {profile.currentSemester}</span>}
            </div>
          </div>

          {/* CGPA & Attendance */}
          <div style={{ display: 'flex', gap: '1.25rem', flexShrink: 0 }}>
            {profile?.overallCgpa && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{profile.overallCgpa}</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>CGPA</div>
              </div>
            )}
            {profile?.attendancePercentage != null && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: profile.attendancePercentage >= 75 ? '#10b981' : '#f43f5e', lineHeight: 1 }}>{profile.attendancePercentage}%</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Attendance</div>
              </div>
            )}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ marginTop: '1rem' }}>
          <ProgressBar value={profile?.profileCompleteness || 0} label={`Profile Completeness`} />
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '0.625rem 1.125rem', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 700 : 400,
            color: activeTab === tab.id ? '#818cf8' : '#64748b',
            borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <StatCard label="Certifications" value={profile?.certifications?.length || 0} icon={Award} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
            <StatCard label="Courses" value={profile?.courses?.length || 0} icon={BookOpen} color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
            <StatCard label="Activities" value={profile?.activities?.length || 0} icon={Activity} color="#10b981" bg="rgba(16,185,129,0.12)" />
            <StatCard label="Semesters" value={profile?.semesterExams?.length || 0} icon={TrendingUp} color="#6366f1" bg="rgba(99,102,241,0.12)" />
          </div>

          {/* Bio and goals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {profile?.bio && (
              <div className="card">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} /> About
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{profile.bio}</p>
              </div>
            )}
            {profile?.careerGoals && (
              <div className="card">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={14} /> Career Goals
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{profile.careerGoals}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {(profile?.technicalSkills?.length > 0 || profile?.softSkills?.length > 0) && (
            <div className="card">
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Skills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {profile.technicalSkills?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem' }}>Technical</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {profile.technicalSkills.map(s => <Badge key={s} variant="indigo">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {profile.softSkills?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem' }}>Soft</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {profile.softSkills.map(s => <Badge key={s} variant="violet">{s}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ACADEMICS TAB ────────────────────────────── */}
      {activeTab === 'academics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Internal exams table */}
          {profile?.internalExams?.length > 0 && (
            <div className="card">
              <h3 style={sectionH3}>Internal Assessment Records</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      {['Subject', 'Type', 'Marks', 'Max', '%', 'Semester'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.internalExams.map((exam, i) => {
                      const pct = ((exam.marksObtained / exam.maxMarks) * 100).toFixed(1);
                      const c = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                          <td style={tdStyle}>{exam.subject}</td>
                          <td style={tdStyle}><Badge variant="indigo">{exam.examType}</Badge></td>
                          <td style={tdStyle}>{exam.marksObtained}</td>
                          <td style={{ ...tdStyle, color: '#64748b' }}>{exam.maxMarks}</td>
                          <td style={{ ...tdStyle, color: c, fontWeight: 700 }}>{pct}%</td>
                          <td style={tdStyle}><Badge variant="violet">Sem {exam.semester}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Semester results */}
          {profile?.semesterExams?.map((sem, sIdx) => (
            <div key={sIdx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
                onClick={() => setExpandedSems(e => ({ ...e, [sIdx]: !e[sIdx] }))}>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>Semester {sem.semester}</span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{sem.academicYear}</span>
                {sem.sgpa != null && <Badge variant="emerald">SGPA: {sem.sgpa}</Badge>}
                {sem.cgpa != null && <Badge variant="amber">CGPA: {sem.cgpa}</Badge>}
                <Badge variant={sem.result === 'Pass' ? 'emerald' : 'rose'}>{sem.result}</Badge>
                <span style={{ marginLeft: 'auto' }}>{expandedSems[sIdx] ? <ChevronUp size={16} style={{ color: '#64748b' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}</span>
              </div>
              {expandedSems[sIdx] && sem.subjects?.length > 0 && (
                <div style={{ overflowX: 'auto', padding: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr>{['Code', 'Subject', 'Marks', 'Grade', 'GP', 'Credits', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sem.subjects.map((sub, i) => {
                        const gc = ['O','A+'].includes(sub.grade) ? '#10b981' : ['A','B+'].includes(sub.grade) ? '#6366f1' : ['F','AB'].includes(sub.grade) ? '#f43f5e' : '#f59e0b';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                            <td style={{ ...tdStyle, color: '#64748b' }}>{sub.subjectCode || '—'}</td>
                            <td style={tdStyle}>{sub.subjectName}</td>
                            <td style={tdStyle}>{sub.marksObtained != null ? `${sub.marksObtained}/${sub.maxMarks}` : '—'}</td>
                            <td style={{ ...tdStyle, color: gc, fontWeight: 700 }}>{sub.grade || '—'}</td>
                            <td style={tdStyle}>{sub.gradePoint ?? '—'}</td>
                            <td style={tdStyle}>{sub.credits ?? '—'}</td>
                            <td style={tdStyle}><Badge variant={sub.status === 'Pass' ? 'emerald' : 'rose'}>{sub.status}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {(!profile?.semesterExams?.length && !profile?.internalExams?.length) && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
              No academic records have been added yet.
            </div>
          )}
        </div>
      )}

      {/* ── ACHIEVEMENTS TAB ─────────────────────────── */}
      {activeTab === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Certifications */}
          {profile?.certifications?.length > 0 && (
            <div>
              <h3 style={sectionH3}>Certifications ({profile.certifications.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                {profile.certifications.map((cert, i) => (
                  <div key={i} className="card" style={{ borderLeft: '3px solid #6366f1', padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.375rem' }}>{cert.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{cert.issuingOrganization}</div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant="indigo">{cert.domain}</Badge>
                      {cert.issueDate && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(cert.issueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {profile?.courses?.length > 0 && (
            <div>
              <h3 style={sectionH3}>Courses ({profile.courses.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                {profile.courses.map((course, i) => (
                  <div key={i} className="card" style={{ borderLeft: '3px solid #8b5cf6', padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.375rem' }}>{course.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{course.platform}{course.instructor ? ` • ${course.instructor}` : ''}</div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant={course.status === 'Completed' ? 'emerald' : 'amber'}>{course.status}</Badge>
                      {course.skills?.slice(0, 3).map(s => <Badge key={s} variant="violet">{s}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {profile?.activities?.length > 0 && (
            <div>
              <h3 style={sectionH3}>Activities ({profile.activities.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                {profile.activities.map((act, i) => (
                  <div key={i} className="card" style={{ borderLeft: '3px solid #10b981', padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.375rem' }}>{act.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{act.role || 'Participant'} {act.organization ? `• ${act.organization}` : ''}</div>
                    {act.achievement && <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.5rem' }}>🏆 {act.achievement}</div>}
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <Badge variant="emerald">{act.category}</Badge>
                      <Badge variant="amber">{act.level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!profile?.certifications?.length && !profile?.courses?.length && !profile?.activities?.length && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
              No achievements recorded yet.
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ────────────────────────────── */}
      {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} profile={profile} />}
    </div>
  );
}

// ── Analytics sub-component ───────────────────────────────────
function AnalyticsTab({ analytics, profile }) {
  const tooltipStyle = { background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#e2e8f0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* SGPA / CGPA trend */}
      {analytics?.sgpaTrend?.length > 0 && (
        <div className="card">
          <h3 style={sectionH3}>SGPA & CGPA Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.sgpaTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="semester" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="SGPA" />
              <Line type="monotone" dataKey="cgpa" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4 }} name="CGPA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Certifications by domain */}
        {analytics?.certByDomain?.length > 0 && (
          <div className="card">
            <h3 style={sectionH3}>Certs by Domain</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={analytics.certByDomain} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={75} label={({ domain, percent }) => `${domain} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {analytics.certByDomain.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activities by category */}
        {analytics?.actByCategory?.length > 0 && (
          <div className="card">
            <h3 style={sectionH3}>Activities by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.actByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                  {analytics.actByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Internal exam performance bar */}
      {profile?.internalExams?.length > 0 && (
        <div className="card">
          <h3 style={sectionH3}>Internal Assessment Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={profile.internalExams.map(e => ({ name: `${e.subject} (${e.examType})`, percentage: parseFloat(((e.marksObtained / e.maxMarks) * 100).toFixed(1)) }))}
              margin={{ top: 5, right: 20, left: -10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Score']} />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]} fill="#6366f1">
                {profile.internalExams.map((e, i) => {
                  const pct = (e.marksObtained / e.maxMarks) * 100;
                  return <Cell key={i} fill={pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(!analytics?.sgpaTrend?.length && !analytics?.certByDomain?.length) && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
          Not enough data to display analytics. Add academic records and achievements first.
        </div>
      )}
    </div>
  );
}

const sectionH3 = { fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' };
const thStyle = { padding: '0.5rem 0.75rem', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' };
const tdStyle = { padding: '0.625rem 0.75rem', color: '#cbd5e1', fontSize: '0.83rem' };
