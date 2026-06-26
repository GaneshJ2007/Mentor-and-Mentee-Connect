const User = require('../models/User');
const MenteeProfile = require('../models/MenteeProfile');

// @desc    Get mentor dashboard - all assigned mentees with profile summaries
// @route   GET /api/mentor/dashboard
// @access  Private (Mentor)
const getDashboard = async (req, res, next) => {
  try {
    const mentor = await User.findById(req.user._id).select('-password');

    // Fetch all mentees assigned to this mentor
    const mentees = await User.find({
      _id: { $in: mentor.assignedMentees },
      role: 'mentee',
      isActive: true,
    }).select('-password');

    // Fetch profiles for all mentees
    const menteeIds = mentees.map((m) => m._id);
    const profiles = await MenteeProfile.find({ userId: { $in: menteeIds } });

    // Map profiles to mentees
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const menteeData = mentees.map((mentee) => {
      const profile = profileMap[mentee._id.toString()] || null;
      return {
        _id: mentee._id,
        fullName: mentee.fullName,
        email: mentee.email,
        createdAt: mentee.createdAt,
        lastLogin: mentee.lastLogin,
        profile: profile
          ? {
              _id: profile._id,
              department: profile.department,
              program: profile.program,
              batch: profile.batch,
              rollNumber: profile.rollNumber,
              currentSemester: profile.currentSemester,
              overallCgpa: profile.overallCgpa,
              profileCompleteness: profile.profileCompleteness,
              attendancePercentage: profile.attendancePercentage,
              certificationCount: profile.certifications?.length || 0,
              courseCount: profile.courses?.length || 0,
              activityCount: profile.activities?.length || 0,
              internalExamCount: profile.internalExams?.length || 0,
              semesterCount: profile.semesterExams?.length || 0,
              technicalSkills: profile.technicalSkills || [],
            }
          : null,
      };
    });

    // Compute summary stats for mentor overview
    const stats = {
      totalMentees: menteeData.length,
      avgCgpa:
        menteeData.filter((m) => m.profile?.overallCgpa).length > 0
          ? (
              menteeData
                .filter((m) => m.profile?.overallCgpa)
                .reduce((sum, m) => sum + m.profile.overallCgpa, 0) /
              menteeData.filter((m) => m.profile?.overallCgpa).length
            ).toFixed(2)
          : null,
      avgProfileCompleteness:
        menteeData.length > 0
          ? Math.round(
              menteeData.reduce((sum, m) => sum + (m.profile?.profileCompleteness || 0), 0) /
                menteeData.length
            )
          : 0,
      totalCertifications: menteeData.reduce(
        (sum, m) => sum + (m.profile?.certificationCount || 0),
        0
      ),
    };

    res.status(200).json({
      success: true,
      mentor: { _id: mentor._id, fullName: mentor.fullName, email: mentor.email },
      stats,
      mentees: menteeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mentee's full profile for analytics
// @route   GET /api/mentor/mentee/:menteeId
// @access  Private (Mentor)
const getMenteeDetails = async (req, res, next) => {
  try {
    const { menteeId } = req.params;

    // Security: ensure this mentee is assigned to this mentor
    const mentor = await User.findById(req.user._id).select('assignedMentees');
    const isAssigned = mentor.assignedMentees.some((id) => id.toString() === menteeId);

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this mentee\'s profile.',
      });
    }

    const menteeUser = await User.findById(menteeId).select('-password');
    if (!menteeUser || menteeUser.role !== 'mentee') {
      return res.status(404).json({ success: false, message: 'Mentee not found.' });
    }

    const profile = await MenteeProfile.findOne({ userId: menteeId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Mentee profile not found.' });
    }

    // Build analytics summary
    const analytics = buildAnalytics(profile);

    res.status(200).json({
      success: true,
      mentee: menteeUser,
      profile,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentee data optimized for PDF generation
// @route   GET /api/mentor/mentee/:menteeId/pdf-data
// @access  Private (Mentor)
const getMenteePdfData = async (req, res, next) => {
  try {
    const { menteeId } = req.params;

    // Security: ensure this mentee is assigned to this mentor
    const mentor = await User.findById(req.user._id).select('assignedMentees fullName email');
    const isAssigned = mentor.assignedMentees.some((id) => id.toString() === menteeId);

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this mentee\'s data.',
      });
    }

    const menteeUser = await User.findById(menteeId).select('-password');
    if (!menteeUser) {
      return res.status(404).json({ success: false, message: 'Mentee not found.' });
    }

    const profile = await MenteeProfile.findOne({ userId: menteeId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Mentee profile not found.' });
    }

    const analytics = buildAnalytics(profile);

    // Structured PDF-ready data
    const pdfData = {
      generatedAt: new Date().toISOString(),
      mentor: {
        name: mentor.fullName,
        email: mentor.email,
      },
      student: {
        name: menteeUser.fullName,
        email: menteeUser.email,
        rollNumber: profile.rollNumber || 'N/A',
        registerNumber: profile.registerNumber || 'N/A',
        department: profile.department,
        program: profile.program,
        specialization: profile.specialization || 'N/A',
        batch: profile.batch,
        section: profile.section || 'N/A',
        currentSemester: profile.currentSemester,
        phone: profile.phone || 'N/A',
        bio: profile.bio || '',
        careerGoals: profile.careerGoals || '',
        attendancePercentage: profile.attendancePercentage,
      },
      academicSummary: {
        overallCgpa: profile.overallCgpa,
        currentSemester: profile.currentSemester,
        semesterResults: profile.semesterExams.map((sem) => ({
          semester: sem.semester,
          academicYear: sem.academicYear,
          sgpa: sem.sgpa,
          cgpa: sem.cgpa,
          result: sem.result,
          totalCredits: sem.totalCredits,
          earnedCredits: sem.earnedCredits,
          subjects: sem.subjects,
        })),
        internalExams: profile.internalExams.map((exam) => ({
          subject: exam.subject,
          examType: exam.examType,
          marksObtained: exam.marksObtained,
          maxMarks: exam.maxMarks,
          percentage: ((exam.marksObtained / exam.maxMarks) * 100).toFixed(1),
          semester: exam.semester,
        })),
      },
      achievements: {
        certifications: profile.certifications.map((cert) => ({
          title: cert.title,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          domain: cert.domain,
          credentialId: cert.credentialId || 'N/A',
        })),
        courses: profile.courses.map((course) => ({
          title: course.title,
          platform: course.platform,
          completionDate: course.completionDate,
          status: course.status,
          skills: course.skills,
        })),
        activities: profile.activities.map((act) => ({
          title: act.title,
          category: act.category,
          role: act.role || 'Participant',
          organization: act.organization || 'N/A',
          level: act.level,
          achievement: act.achievement || '',
        })),
      },
      skills: {
        technical: profile.technicalSkills || [],
        soft: profile.softSkills || [],
      },
      analytics,
      statistics: {
        totalCertifications: profile.certifications.length,
        totalCourses: profile.courses.length,
        totalActivities: profile.activities.length,
        profileCompleteness: profile.profileCompleteness,
      },
    };

    res.status(200).json({ success: true, pdfData });
  } catch (error) {
    next(error);
  }
};

// Helper: build analytics object from profile
const buildAnalytics = (profile) => {
  // SGPA trend across semesters
  const sgpaTrend = profile.semesterExams
    .sort((a, b) => a.semester - b.semester)
    .map((s) => ({ semester: `Sem ${s.semester}`, sgpa: s.sgpa || 0, cgpa: s.cgpa || 0 }));

  // Internal exam performance grouped by subject
  const internalBySubject = {};
  profile.internalExams.forEach((exam) => {
    if (!internalBySubject[exam.subject]) {
      internalBySubject[exam.subject] = [];
    }
    internalBySubject[exam.subject].push({
      examType: exam.examType,
      percentage: ((exam.marksObtained / exam.maxMarks) * 100).toFixed(1),
      semester: exam.semester,
    });
  });

  // Certifications by domain
  const certByDomain = {};
  profile.certifications.forEach((cert) => {
    certByDomain[cert.domain] = (certByDomain[cert.domain] || 0) + 1;
  });

  // Activities by category
  const actByCategory = {};
  profile.activities.forEach((act) => {
    actByCategory[act.category] = (actByCategory[act.category] || 0) + 1;
  });

  // Latest semester performance
  const latestSem =
    profile.semesterExams.length > 0
      ? profile.semesterExams.reduce((a, b) => (a.semester > b.semester ? a : b))
      : null;

  return {
    sgpaTrend,
    internalBySubject,
    certByDomain: Object.entries(certByDomain).map(([domain, count]) => ({ domain, count })),
    actByCategory: Object.entries(actByCategory).map(([category, count]) => ({ category, count })),
    latestSemester: latestSem,
    overallPerformance: {
      cgpa: profile.overallCgpa,
      totalCertifications: profile.certifications.length,
      totalCourses: profile.courses.length,
      totalActivities: profile.activities.length,
      profileCompleteness: profile.profileCompleteness,
    },
  };
};

// @desc    Assign a mentee to mentor manually
// @route   POST /api/mentor/assign-mentee
// @access  Private (Mentor)
const assignMentee = async (req, res, next) => {
  try {
    const { menteeId } = req.body;

    if (!menteeId) {
      return res.status(400).json({ success: false, message: 'menteeId is required.' });
    }

    const mentee = await User.findOne({ _id: menteeId, role: 'mentee' });
    if (!mentee) {
      return res.status(404).json({ success: false, message: 'Mentee not found.' });
    }

    if (mentee.assignedMentor && mentee.assignedMentor.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Mentee already assigned to you.' });
    }

    // If already assigned to another mentor, remove from that mentor's list
    if (mentee.assignedMentor) {
      await User.findByIdAndUpdate(mentee.assignedMentor, {
        $pull: { assignedMentees: menteeId },
      });
    }

    // Assign
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { assignedMentees: menteeId },
    });
    await User.findByIdAndUpdate(menteeId, {
      $set: { assignedMentor: req.user._id },
    });

    res.status(200).json({ success: true, message: `${mentee.fullName} assigned to your mentorship.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getMenteeDetails,
  getMenteePdfData,
  assignMentee,
};
