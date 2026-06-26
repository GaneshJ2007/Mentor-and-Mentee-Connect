import jsPDF from 'jspdf';

const COLORS = {
  primary: [99, 102, 241],
  secondary: [139, 92, 246],
  bg: [15, 15, 26],
  surface: [30, 30, 46],
  text: [226, 232, 240],
  muted: [148, 163, 184],
  emerald: [16, 185, 129],
  amber: [251, 191, 36],
  rose: [244, 63, 94],
  white: [255, 255, 255],
};

const gradeColor = (grade) => {
  if (['O', 'A+'].includes(grade)) return COLORS.emerald;
  if (['A', 'B+'].includes(grade)) return COLORS.primary;
  if (['B', 'C'].includes(grade)) return COLORS.amber;
  return COLORS.rose;
};

export const generateMenteePDF = (pdfData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = 20;
    drawPageHeader();
  };

  const checkPage = (needed = 20) => {
    if (y + needed > H - 15) addPage();
  };

  const setRGB = (color) => doc.setTextColor(...color);
  const setFillRGB = (color) => doc.setFillColor(...color);
  const setDrawRGB = (color) => doc.setDrawColor(...color);

  // ── Cover / Header ─────────────────────────────────────────
  // Deep background
  setFillRGB(COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Top gradient bar (simulated with two rects)
  setFillRGB(COLORS.primary);
  doc.rect(0, 0, W, 2, 'F');
  setFillRGB(COLORS.secondary);
  doc.rect(0, 2, W, 1, 'F');

  // Header card
  setFillRGB(COLORS.surface);
  doc.roundedRect(10, 8, W - 20, 50, 4, 4, 'F');
  setDrawRGB(COLORS.primary);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 8, W - 20, 50, 4, 4, 'S');

  // Avatar circle
  setFillRGB(COLORS.primary);
  doc.circle(30, 33, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setRGB(COLORS.white);
  const initials = pdfData.student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  doc.text(initials, 30, 36.5, { align: 'center' });

  // Student name & department
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setRGB(COLORS.white);
  doc.text(pdfData.student.name, 48, 24);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setRGB(COLORS.muted);
  doc.text(`${pdfData.student.program} • ${pdfData.student.department}`, 48, 31);
  doc.text(`Roll No: ${pdfData.student.rollNumber}  |  Batch: ${pdfData.student.batch}  |  Sem: ${pdfData.student.currentSemester}`, 48, 38);
  doc.text(`${pdfData.student.email}  |  ${pdfData.student.phone}`, 48, 45);

  // CGPA badge top-right
  if (pdfData.student.cgpa || pdfData.academicSummary?.overallCgpa) {
    const cgpa = pdfData.academicSummary?.overallCgpa || '—';
    setFillRGB(COLORS.emerald);
    doc.roundedRect(160, 13, 35, 18, 3, 3, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    setRGB(COLORS.bg);
    doc.text('CGPA', 177.5, 19, { align: 'center' });
    doc.setFontSize(14);
    doc.text(String(cgpa), 177.5, 27, { align: 'center' });
  }

  // Report meta line
  y = 63;
  doc.setFontSize(7);
  setRGB(COLORS.muted);
  doc.text(`Mentor: ${pdfData.mentor.name}  |  Generated: ${new Date(pdfData.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W / 2, y, { align: 'center' });

  y += 8;

  // ── Section helper ──────────────────────────────────────────
  const drawSection = (title, icon = '') => {
    checkPage(14);
    y += 4;
    setFillRGB(COLORS.surface);
    doc.roundedRect(10, y, W - 20, 9, 2, 2, 'F');
    setDrawRGB(COLORS.primary);
    doc.setLineWidth(0.2);
    doc.rect(10, y, 3, 9, 'F');
    setFillRGB(COLORS.primary);
    doc.rect(10, y, 3, 9, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setRGB(COLORS.white);
    doc.text(`${icon}  ${title}`.trim(), 17, y + 6);
    y += 14;
  };

  const drawPageHeader = () => {
    setFillRGB(COLORS.bg);
    doc.rect(0, 0, W, H, 'F');
    setFillRGB(COLORS.primary);
    doc.rect(0, 0, W, 1.5, 'F');
    doc.setFontSize(7);
    setRGB(COLORS.muted);
    doc.text(`${pdfData.student.name} — Academic Report`, W / 2, 8, { align: 'center' });
    y = 14;
  };

  // ── Quick Stats Bar ─────────────────────────────────────────
  const stats = [
    { label: 'Certifications', value: pdfData.statistics.totalCertifications, color: COLORS.primary },
    { label: 'Courses', value: pdfData.statistics.totalCourses, color: COLORS.secondary },
    { label: 'Activities', value: pdfData.statistics.totalActivities, color: COLORS.emerald },
    { label: 'Profile %', value: `${pdfData.statistics.profileCompleteness}%`, color: COLORS.amber },
  ];
  const sw = (W - 20) / 4;
  stats.forEach((s, i) => {
    const sx = 10 + i * sw;
    setFillRGB(COLORS.surface);
    doc.roundedRect(sx + 1, y, sw - 2, 18, 2, 2, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    setRGB(s.color);
    doc.text(String(s.value), sx + sw / 2, y + 10, { align: 'center' });
    doc.setFontSize(6.5);
    setRGB(COLORS.muted);
    doc.text(s.label, sx + sw / 2, y + 16, { align: 'center' });
  });
  y += 24;

  // ── Bio ─────────────────────────────────────────────────────
  if (pdfData.student.bio) {
    drawSection('About', '');
    doc.setFontSize(8);
    setRGB(COLORS.text);
    const bioLines = doc.splitTextToSize(pdfData.student.bio, W - 30);
    doc.text(bioLines, 15, y);
    y += bioLines.length * 4.5 + 4;
  }

  // ── Semester Results ────────────────────────────────────────
  const semResults = pdfData.academicSummary?.semesterResults || [];
  if (semResults.length > 0) {
    drawSection('Semester Examination Results', '');

    semResults.forEach((sem) => {
      checkPage(50);

      // Semester header row
      setFillRGB([40, 40, 60]);
      doc.roundedRect(10, y, W - 20, 8, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setRGB(COLORS.white);
      doc.text(`Semester ${sem.semester}  —  ${sem.academicYear}`, 15, y + 5.5);
      if (sem.sgpa != null) {
        setRGB(COLORS.emerald);
        doc.text(`SGPA: ${sem.sgpa}`, 130, y + 5.5);
      }
      if (sem.cgpa != null) {
        setRGB(COLORS.amber);
        doc.text(`CGPA: ${sem.cgpa}`, 160, y + 5.5);
      }
      const resultColor = sem.result === 'Pass' ? COLORS.emerald : COLORS.rose;
      setRGB(resultColor);
      doc.text(sem.result, 190, y + 5.5, { align: 'right' });
      y += 10;

      if (sem.subjects && sem.subjects.length > 0) {
        // Table header
        const cols = [15, 55, 110, 130, 150, 170];
        setFillRGB([50, 50, 75]);
        doc.rect(10, y, W - 20, 6, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        setRGB(COLORS.muted);
        ['Code', 'Subject', 'Marks', 'Grade', 'GP', 'Status'].forEach((h, i) => {
          doc.text(h, cols[i], y + 4.3);
        });
        y += 7;

        sem.subjects.forEach((sub, idx) => {
          checkPage(7);
          if (idx % 2 === 0) {
            setFillRGB([22, 22, 35]);
            doc.rect(10, y - 1, W - 20, 6.5, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          setRGB(COLORS.muted);
          doc.text(sub.subjectCode || '—', cols[0], y + 4);
          setRGB(COLORS.text);
          const nameShort = doc.splitTextToSize(sub.subjectName, 50)[0];
          doc.text(nameShort, cols[1], y + 4);
          setRGB(COLORS.muted);
          doc.text(sub.marksObtained != null ? `${sub.marksObtained}/${sub.maxMarks || 100}` : '—', cols[2], y + 4);
          if (sub.grade) {
            setRGB(gradeColor(sub.grade));
            doc.setFont('helvetica', 'bold');
            doc.text(sub.grade, cols[3], y + 4);
            doc.setFont('helvetica', 'normal');
          }
          setRGB(COLORS.muted);
          doc.text(sub.gradePoint != null ? String(sub.gradePoint) : '—', cols[4], y + 4);
          const statusColor = sub.status === 'Pass' ? COLORS.emerald : COLORS.rose;
          setRGB(statusColor);
          doc.text(sub.status || '—', cols[5], y + 4);
          y += 6.5;
        });
        y += 3;
      }
    });
  }

  // ── Internal Exams ──────────────────────────────────────────
  const internals = pdfData.academicSummary?.internalExams || [];
  if (internals.length > 0) {
    drawSection('Internal Assessment Records', '');

    const cols = [15, 70, 110, 135, 165];
    setFillRGB([50, 50, 75]);
    doc.rect(10, y, W - 20, 6, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    setRGB(COLORS.muted);
    ['Subject', 'Exam Type', 'Marks', 'Percentage', 'Semester'].forEach((h, i) => {
      doc.text(h, cols[i], y + 4.3);
    });
    y += 7;

    internals.forEach((exam, idx) => {
      checkPage(8);
      if (idx % 2 === 0) {
        setFillRGB([22, 22, 35]);
        doc.rect(10, y - 1, W - 20, 6.5, 'F');
      }
      const pct = parseFloat(exam.percentage);
      const pctColor = pct >= 75 ? COLORS.emerald : pct >= 50 ? COLORS.amber : COLORS.rose;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setRGB(COLORS.text);
      doc.text(exam.subject, cols[0], y + 4);
      setRGB(COLORS.muted);
      doc.text(exam.examType, cols[1], y + 4);
      doc.text(`${exam.marksObtained}/${exam.maxMarks}`, cols[2], y + 4);
      setRGB(pctColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${exam.percentage}%`, cols[3], y + 4);
      doc.setFont('helvetica', 'normal');
      setRGB(COLORS.muted);
      doc.text(`Sem ${exam.semester}`, cols[4], y + 4);
      y += 6.5;
    });
    y += 4;
  }

  // ── Certifications ──────────────────────────────────────────
  const certs = pdfData.achievements?.certifications || [];
  if (certs.length > 0) {
    drawSection('Certifications', '');
    certs.forEach((cert, idx) => {
      checkPage(14);
      setFillRGB([22, 22, 35]);
      doc.roundedRect(10, y, W - 20, 12, 2, 2, 'F');
      // Left accent
      setFillRGB(COLORS.primary);
      doc.roundedRect(10, y, 3, 12, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setRGB(COLORS.white);
      doc.text(cert.title, 17, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setRGB(COLORS.muted);
      doc.text(`${cert.issuingOrganization}  |  ${cert.domain}`, 17, y + 10);
      if (cert.issueDate) {
        const d = new Date(cert.issueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        setRGB(COLORS.amber);
        doc.text(d, W - 15, y + 7.5, { align: 'right' });
      }
      y += 15;
    });
  }

  // ── Courses ─────────────────────────────────────────────────
  const courses = pdfData.achievements?.courses || [];
  if (courses.length > 0) {
    drawSection('Completed Courses', '');
    courses.forEach((course) => {
      checkPage(14);
      setFillRGB([22, 22, 35]);
      doc.roundedRect(10, y, W - 20, 12, 2, 2, 'F');
      setFillRGB(COLORS.secondary);
      doc.roundedRect(10, y, 3, 12, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setRGB(COLORS.white);
      doc.text(course.title, 17, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setRGB(COLORS.muted);
      const skillsText = course.skills?.length ? `  |  Skills: ${course.skills.join(', ')}` : '';
      doc.text(`${course.platform}${skillsText}`, 17, y + 10);
      setRGB(COLORS.emerald);
      doc.text(course.status, W - 15, y + 7.5, { align: 'right' });
      y += 15;
    });
  }

  // ── Activities ──────────────────────────────────────────────
  const activities = pdfData.achievements?.activities || [];
  if (activities.length > 0) {
    drawSection('Extra-Curricular Activities', '');
    activities.forEach((act) => {
      checkPage(14);
      setFillRGB([22, 22, 35]);
      doc.roundedRect(10, y, W - 20, 12, 2, 2, 'F');
      setFillRGB(COLORS.emerald);
      doc.roundedRect(10, y, 3, 12, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setRGB(COLORS.white);
      doc.text(act.title, 17, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setRGB(COLORS.muted);
      doc.text(`${act.category}  |  ${act.role}  |  ${act.level} Level`, 17, y + 10);
      if (act.achievement) {
        setRGB(COLORS.amber);
        doc.text(act.achievement, W - 15, y + 7.5, { align: 'right' });
      }
      y += 15;
    });
  }

  // ── Skills ──────────────────────────────────────────────────
  const techSkills = pdfData.skills?.technical || [];
  const softSkills = pdfData.skills?.soft || [];
  if (techSkills.length || softSkills.length) {
    drawSection('Skills', '');
    if (techSkills.length) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      setRGB(COLORS.muted);
      doc.text('Technical Skills', 15, y);
      y += 5;
      let sx = 15;
      techSkills.forEach((skill) => {
        checkPage(10);
        const tw = doc.getTextWidth(skill) + 8;
        if (sx + tw > W - 15) { sx = 15; y += 8; }
        setFillRGB(COLORS.primary);
        doc.roundedRect(sx, y - 4, tw, 6.5, 1.5, 1.5, 'F');
        doc.setFontSize(6.5);
        setRGB(COLORS.white);
        doc.text(skill, sx + 4, y + 0.8);
        sx += tw + 3;
      });
      y += 10;
    }
    if (softSkills.length) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      setRGB(COLORS.muted);
      doc.text('Soft Skills', 15, y);
      y += 5;
      let sx = 15;
      softSkills.forEach((skill) => {
        const tw = doc.getTextWidth(skill) + 8;
        if (sx + tw > W - 15) { sx = 15; y += 8; }
        setFillRGB(COLORS.secondary);
        doc.roundedRect(sx, y - 4, tw, 6.5, 1.5, 1.5, 'F');
        doc.setFontSize(6.5);
        setRGB(COLORS.white);
        doc.text(skill, sx + 4, y + 0.8);
        sx += tw + 3;
      });
      y += 10;
    }
  }

  // ── Footer on each page ─────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setFillRGB(COLORS.surface);
    doc.rect(0, H - 10, W, 10, 'F');
    doc.setFontSize(6.5);
    setRGB(COLORS.muted);
    doc.text('Mentor Connect — Confidential Academic Report', 15, H - 4);
    doc.text(`Page ${i} of ${totalPages}`, W - 15, H - 4, { align: 'right' });
  }

  const fileName = `${pdfData.student.name.replace(/\s+/g, '_')}_Academic_Report.pdf`;
  doc.save(fileName);
  return fileName;
};
