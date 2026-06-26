const MenteeProfile = require('../models/MenteeProfile');
const User = require('../models/User');

// @desc    Get mentee's own profile
// @route   GET /api/mentee/profile
// @access  Private (Mentee)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await MenteeProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'fullName email createdAt'
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update mentee profile (upsert)
// @route   PUT /api/mentee/profile
// @access  Private (Mentee)
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'department', 'program', 'specialization', 'rollNumber', 'registerNumber',
      'batch', 'currentSemester', 'section', 'dateOfBirth', 'phone', 'address',
      'parentName', 'parentPhone', 'bio', 'careerGoals', 'technicalSkills',
      'softSkills', 'attendancePercentage',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true }
    ).populate('userId', 'fullName email');

    res.status(200).json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update internal exam records
// @route   PUT /api/mentee/academics/internal
// @access  Private (Mentee)
const updateInternalExams = async (req, res, next) => {
  try {
    const { internalExams } = req.body;

    if (!Array.isArray(internalExams)) {
      return res.status(400).json({ success: false, message: 'internalExams must be an array.' });
    }

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { internalExams } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, message: 'Internal exam records updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update semester exam records
// @route   PUT /api/mentee/academics/semester
// @access  Private (Mentee)
const updateSemesterExams = async (req, res, next) => {
  try {
    const { semesterExams } = req.body;

    if (!Array.isArray(semesterExams)) {
      return res.status(400).json({ success: false, message: 'semesterExams must be an array.' });
    }

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { semesterExams } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, message: 'Semester exam records updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update certifications
// @route   PUT /api/mentee/achievements/certifications
// @access  Private (Mentee)
const updateCertifications = async (req, res, next) => {
  try {
    const { certifications } = req.body;

    if (!Array.isArray(certifications)) {
      return res.status(400).json({ success: false, message: 'certifications must be an array.' });
    }

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { certifications } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, message: 'Certifications updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update courses
// @route   PUT /api/mentee/achievements/courses
// @access  Private (Mentee)
const updateCourses = async (req, res, next) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
      return res.status(400).json({ success: false, message: 'courses must be an array.' });
    }

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { courses } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, message: 'Courses updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update extra-curricular activities
// @route   PUT /api/mentee/achievements/activities
// @access  Private (Mentee)
const updateActivities = async (req, res, next) => {
  try {
    const { activities } = req.body;

    if (!Array.isArray(activities)) {
      return res.status(400).json({ success: false, message: 'activities must be an array.' });
    }

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { activities } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, message: 'Activities updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Save full profile in one request (all sections)
// @route   POST /api/mentee/profile/full
// @access  Private (Mentee)
const saveFullProfile = async (req, res, next) => {
  try {
    const {
      department, program, specialization, rollNumber, registerNumber,
      batch, currentSemester, section, dateOfBirth, phone, address,
      parentName, parentPhone, bio, careerGoals, technicalSkills,
      softSkills, attendancePercentage, internalExams, semesterExams,
      certifications, courses, activities,
    } = req.body;

    const updateData = {
      department, program, specialization, rollNumber, registerNumber,
      batch, currentSemester, section, dateOfBirth, phone, address,
      parentName, parentPhone, bio, careerGoals, technicalSkills,
      softSkills, attendancePercentage,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    if (internalExams !== undefined) updateData.internalExams = internalExams;
    if (semesterExams !== undefined) updateData.semesterExams = semesterExams;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (courses !== undefined) updateData.courses = courses;
    if (activities !== undefined) updateData.activities = activities;

    const profile = await MenteeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true }
    ).populate('userId', 'fullName email');

    res.status(200).json({ success: true, message: 'Full profile saved successfully.', profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  updateInternalExams,
  updateSemesterExams,
  updateCertifications,
  updateCourses,
  updateActivities,
  saveFullProfile,
};
