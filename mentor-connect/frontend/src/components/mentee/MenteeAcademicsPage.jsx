import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, BookOpen, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { menteeAPI } from '../../utils/api';
import { SectionHeader, Badge, useToast } from '../shared/UI';

const EXAM_TYPES = ['IA1', 'IA2', 'IA3', 'Mid-Term', 'Unit Test', 'Quiz', 'Other'];
const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB', ''];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const emptyInternal = () => ({ subject: '', examType: 'IA1', marksObtained: '', maxMarks: '50', semester: 1, academicYear: '' });
const emptySemSubject = () => ({ subjectCode: '', subjectName: '', marksObtained: '', maxMarks: '100', grade: '', gradePoint: '', credits: '', status: 'Pass' });
const emptySemester = () => ({ semester: 1, academicYear: '', sgpa: '', cgpa: '', result: 'Pending', totalCredits: '', earnedCredits: '', subjects: [emptySemSubject()] });

const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default function MenteeAcademicsPage() {
  const [internalExams, setInternalExams] = useState([emptyInternal()]);
  const [semesterExams, setSemesterExams] = useState([]);
  const [expandedSems, setExpandedSems] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingInternal, setSavingInternal] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    menteeAPI.getProfile().then(({ data }) => {
      const p = data.profile;
      if (p.internalExams?.length) {
        setInternalExams(p.internalExams.map(e => ({ ...e, marksObtained: e.marksObtained ?? '', maxMarks: e.maxMarks ?? '50' })));
      }
      if (p.semesterExams?.length) {
        setSemesterExams(p.semesterExams.map(s => ({
          ...s,
          sgpa: s.sgpa ?? '', cgpa: s.cgpa ?? '', totalCredits: s.totalCredits ?? '', earnedCredits: s.earnedCredits ?? '',
          subjects: s.subjects?.map(sub => ({ ...sub, marksObtained: sub.marksObtained ?? '', gradePoint: sub.gradePoint ?? '', credits: sub.credits ?? '' })) || [emptySemSubject()],
        })));
        const init = {};
        p.semesterExams.forEach((_, i) => { init[i] = true; });
        setExpandedSems(init);
      }
    }).catch(() => show('Failed to load academic data', 'error')).finally(() => setLoading(false));
  }, []);

  // ── Internal helpers ──────────────────────────────────────
  const setInternal = (idx, key, val) => setInternalExams(arr => arr.map((e, i) => i === idx ? { ...e, [key]: val } : e));
  const addInternal = () => setInternalExams(arr => [...arr, emptyInternal()]);
  const removeInternal = (idx) => setInternalExams(arr => arr.filter((_, i) => i !== idx));

  const saveInternals = async () => {
    setSavingInternal(true);
    try {
      const payload = internalExams.map(e => ({ ...e, marksObtained: Number(e.marksObtained), maxMarks: Number(e.maxMarks), semester: Number(e.semester) }));
      await menteeAPI.updateInternalExams({ internalExams: payload });
      show('Internal exams saved!', 'success');
    } catch (err) { show(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSavingInternal(false); }
  };

  // ── Semester helpers ──────────────────────────────────────
  const setSem = (idx, key, val) => setSemesterExams(arr => arr.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  const setSemSubject = (sIdx, subIdx, key, val) =>
    setSemesterExams(arr => arr.map((s, i) => i === sIdx ? {
      ...s, subjects: s.subjects.map((sub, j) => j === subIdx ? { ...sub, [key]: val } : sub)
    } : s));
  const addSemSubject = (sIdx) => setSemesterExams(arr => arr.map((s, i) => i === sIdx ? { ...s, subjects: [...s.subjects, emptySemSubject()] } : s));
  const removeSemSubject = (sIdx, subIdx) => setSemesterExams(arr => arr.map((s, i) => i === sIdx ? { ...s, subjects: s.subjects.filter((_, j) => j !== subIdx) } : s));
  const addSemester = () => {
    setSemesterExams(arr => [...arr, emptySemester()]);
    setExpandedSems(e => ({ ...e, [semesterExams.length]: true }));
  };
  const removeSemester = (idx) => setSemesterExams(arr => arr.filter((_, i) => i !== idx));
  const toggleSem = (idx) => setExpandedSems(e => ({ ...e, [idx]: !e[idx] }));

  const saveSemesters = async () => {
    setSavingSemester(true);
    try {
      const payload = semesterExams.map(s => ({
        ...s,
        semester: Number(s.semester), sgpa: s.sgpa !== '' ? Number(s.sgpa) : null,
        cgpa: s.cgpa !== '' ? Number(s.cgpa) : null,
        totalCredits: Number(s.totalCredits) || 0, earnedCredits: Number(s.earnedCredits) || 0,
        subjects: s.subjects.map(sub => ({
          ...sub,
          marksObtained: sub.marksObtained !== '' ? Number(sub.marksObtained) : null,
          gradePoint: sub.gradePoint !== '' ? Number(sub.gradePoint) : null,
          credits: sub.credits !== '' ? Number(sub.credits) : null,
        })),
      }));
      await menteeAPI.updateSemesterExams({ semesterExams: payload });
      show('Semester exams saved!', 'success');
    } catch (err) { show(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSavingSemester(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <ToastContainer />

      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Academic Records</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Track your internal assessments and semester results</p>
      </div>

      {/* ── Internal Exams ───────────────────────────────── */}
      <div className="card">
        <SectionHeader
          title="Internal Assessment Records"
          subtitle="Add your IA, unit test, and quiz marks"
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={addInternal} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
                <Plus size={14} /> Add Row
              </button>
              <button onClick={saveInternals} disabled={savingInternal} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
                {savingInternal ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </div>
          }
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['Subject', 'Type', 'Marks', 'Max', 'Sem', 'Year', ''].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.625rem', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {internalExams.map((exam, idx) => {
                const pct = exam.marksObtained && exam.maxMarks ? ((Number(exam.marksObtained) / Number(exam.maxMarks)) * 100).toFixed(0) : null;
                const pctColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#fbbf24' : '#f43f5e';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <input className="input-dark" value={exam.subject} onChange={e => setInternal(idx, 'subject', e.target.value)} placeholder="e.g. Data Structures" style={{ minWidth: 160 }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <select className="input-dark" value={exam.examType} onChange={e => setInternal(idx, 'examType', e.target.value)}>
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <input className="input-dark" type="number" min="0" value={exam.marksObtained} onChange={e => setInternal(idx, 'marksObtained', e.target.value)} placeholder="30" style={{ width: 72 }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <input className="input-dark" type="number" min="1" value={exam.maxMarks} onChange={e => setInternal(idx, 'maxMarks', e.target.value)} placeholder="50" style={{ width: 72 }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <select className="input-dark" value={exam.semester} onChange={e => setInternal(idx, 'semester', Number(e.target.value))} style={{ width: 72 }}>
                        {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem' }}>
                      <input className="input-dark" value={exam.academicYear} onChange={e => setInternal(idx, 'academicYear', e.target.value)} placeholder="2023–24" style={{ width: 100 }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.375rem', whiteSpace: 'nowrap' }}>
                      {pct && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pctColor, marginRight: 8 }}>{pct}%</span>}
                      <button onClick={() => removeInternal(idx)} className="btn-danger" style={{ padding: '0.25rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {internalExams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.875rem' }}>
            No internal exams added yet. Click "Add Row" to start.
          </div>
        )}
      </div>

      {/* ── Semester Exams ───────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Semester Examination Results</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>Record your end-semester marks, grades, and SGPA/CGPA</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={addSemester} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
              <Plus size={14} /> Add Semester
            </button>
            <button onClick={saveSemesters} disabled={savingSemester} className="btn-primary" style={{ fontSize: '0.8rem' }}>
              {savingSemester ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save All
            </button>
          </div>
        </div>

        {semesterExams.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#475569' }}>
            <TrendingUp size={32} style={{ color: '#334155', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>No semester records yet. Click "Add Semester" to begin.</p>
          </div>
        )}

        {semesterExams.map((sem, sIdx) => (
          <div key={sIdx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Semester header */}
            <div
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'rgba(99,102,241,0.06)' }}
              onClick={() => toggleSem(sIdx)}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>Semester {sem.semester}</span>
                {sem.academicYear && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{sem.academicYear}</span>}
                {sem.sgpa && <span className="badge badge-emerald">SGPA: {sem.sgpa}</span>}
                {sem.cgpa && <span className="badge badge-amber">CGPA: {sem.cgpa}</span>}
                <span className={`badge ${sem.result === 'Pass' ? 'badge-emerald' : sem.result === 'Fail' ? 'badge-rose' : 'badge-indigo'}`}>{sem.result}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeSemester(sIdx); }} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                <Trash2 size={13} />
              </button>
              {expandedSems[sIdx] ? <ChevronUp size={16} style={{ color: '#64748b' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}
            </div>

            {expandedSems[sIdx] && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Semester meta */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Semester No.', key: 'semester', type: 'number' },
                    { label: 'Academic Year', key: 'academicYear', placeholder: '2023-24' },
                    { label: 'SGPA', key: 'sgpa', type: 'number', placeholder: '8.5' },
                    { label: 'CGPA', key: 'cgpa', type: 'number', placeholder: '8.2' },
                    { label: 'Total Credits', key: 'totalCredits', type: 'number' },
                    { label: 'Earned Credits', key: 'earnedCredits', type: 'number' },
                  ].map(({ label, key, type = 'text', placeholder }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={labelStyle}>{label}</label>
                      {key === 'semester' ? (
                        <select className="input-dark" value={sem.semester} onChange={e => setSem(sIdx, 'semester', Number(e.target.value))}>
                          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <input className="input-dark" type={type} value={sem[key]} onChange={e => setSem(sIdx, key, e.target.value)} placeholder={placeholder} />
                      )}
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={labelStyle}>Result</label>
                    <select className="input-dark" value={sem.result} onChange={e => setSem(sIdx, 'result', e.target.value)}>
                      {['Pass', 'Fail', 'Pending', 'Withheld'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subjects table */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Subjects ({sem.subjects.length})</span>
                    <button onClick={() => addSemSubject(sIdx)} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                      <Plus size={12} /> Subject
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr>
                          {['Code', 'Subject Name', 'Marks', 'Max', 'Grade', 'GP', 'Credits', 'Status', ''].map(h => (
                            <th key={h} style={{ padding: '0.4rem 0.5rem', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sem.subjects.map((sub, subIdx) => (
                          <tr key={subIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" value={sub.subjectCode} onChange={e => setSemSubject(sIdx, subIdx, 'subjectCode', e.target.value)} placeholder="CS201" style={{ width: 70 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" value={sub.subjectName} onChange={e => setSemSubject(sIdx, subIdx, 'subjectName', e.target.value)} placeholder="Subject name" style={{ minWidth: 160 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" type="number" value={sub.marksObtained} onChange={e => setSemSubject(sIdx, subIdx, 'marksObtained', e.target.value)} placeholder="75" style={{ width: 60 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" type="number" value={sub.maxMarks} onChange={e => setSemSubject(sIdx, subIdx, 'maxMarks', e.target.value)} placeholder="100" style={{ width: 60 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}>
                              <select className="input-dark" value={sub.grade} onChange={e => setSemSubject(sIdx, subIdx, 'grade', e.target.value)} style={{ width: 72 }}>
                                {GRADES.map(g => <option key={g} value={g}>{g || '—'}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" type="number" value={sub.gradePoint} onChange={e => setSemSubject(sIdx, subIdx, 'gradePoint', e.target.value)} placeholder="8.0" style={{ width: 60 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}><input className="input-dark" type="number" value={sub.credits} onChange={e => setSemSubject(sIdx, subIdx, 'credits', e.target.value)} placeholder="4" style={{ width: 55 }} /></td>
                            <td style={{ padding: '0.375rem 0.25rem' }}>
                              <select className="input-dark" value={sub.status} onChange={e => setSemSubject(sIdx, subIdx, 'status', e.target.value)} style={{ width: 80 }}>
                                {['Pass', 'Fail', 'Absent', 'Withheld'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '0.375rem 0.25rem' }}>
                              <button onClick={() => removeSemSubject(sIdx, subIdx)} className="btn-danger" style={{ padding: '0.25rem' }}>
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
