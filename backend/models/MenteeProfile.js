const mongoose = require('mongoose');

// Sub-schema: Individual internal exam record
const internalExamSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    examType: {
      type: String,
      enum: ['IA1', 'IA2', 'IA3', 'Mid-Term', 'Unit Test', 'Quiz', 'Other'],
      default: 'IA1',
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: 1,
      max: 10,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Sub-schema: Semester exam record
const semesterExamSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: 1,
      max: 10,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    subjects: [
      {
        subjectCode: { type: String, trim: true },
        subjectName: { type: String, required: true, trim: true },
        marksObtained: { type: Number, min: 0 },
        maxMarks: { type: Number, default: 100 },
        grade: {
          type: String,
          enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB', ''],
          default: '',
        },
        gradePoint: { type: Number, min: 0, max: 10 },
        credits: { type: Number, min: 0 },
        status: { type: String, enum: ['Pass', 'Fail', 'Absent', 'Withheld'], default: 'Pass' },
      },
    ],
    sgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    totalCredits: { type: Number, default: 0 },
    earnedCredits: { type: Number, default: 0 },
    result: {
      type: String,
      enum: ['Pass', 'Fail', 'Pending', 'Withheld'],
      default: 'Pending',
    },
    rank: { type: Number, default: null },
  },
  { _id: true }
);

// Sub-schema: Certification
const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
    },
    issueDate: { type: Date },
    expiryDate: { type: Date, default: null },
    credentialId: { type: String, trim: true },
    credentialUrl: { type: String, trim: true },
    domain: {
      type: String,
      enum: [
        'Web Development',
        'Data Science',
        'Machine Learning',
        'Cloud Computing',
        'Cybersecurity',
        'Mobile Development',
        'DevOps',
        'Database',
        'Networking',
        'Design',
        'Project Management',
        'Other',
      ],
      default: 'Other',
    },
    description: { type: String, trim: true },
  },
  { _id: true }
);

// Sub-schema: Course
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
      enum: [
        'Coursera',
        'Udemy',
        'edX',
        'NPTEL',
        'LinkedIn Learning',
        'Pluralsight',
        'YouTube',
        'College',
        'Other',
      ],
      default: 'Other',
    },
    instructor: { type: String, trim: true },
    completionDate: { type: Date },
    duration: { type: String, trim: true },
    certificateUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Enrolled'],
      default: 'Completed',
    },
    skills: [{ type: String, trim: true }],
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  { _id: true }
);

// Sub-schema: Extra-curricular activity
const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Sports',
        'Cultural',
        'Technical',
        'Social Service',
        'Leadership',
        'Arts',
        'Music',
        'Dance',
        'Debate',
        'Hackathon',
        'Internship',
        'Research',
        'Other',
      ],
      default: 'Other',
    },
    role: { type: String, trim: true },
    organization: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date, default: null },
    isOngoing: { type: Boolean, default: false },
    achievement: { type: String, trim: true },
    description: { type: String, trim: true },
    level: {
      type: String,
      enum: ['College', 'District', 'State', 'National', 'International'],
      default: 'College',
    },
  },
  { _id: true }
);

// Main MenteeProfile schema
const menteeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Academic details
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    program: {
      type: String,
      trim: true,
      enum: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'Other'],
      default: 'B.E.',
    },
    specialization: { type: String, trim: true },
    rollNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    registerNumber: { type: String, trim: true },
    batch: { type: String, trim: true },
    currentSemester: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    section: { type: String, trim: true, uppercase: true },
    dateOfBirth: { type: Date, default: null },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },

    // Academic records
    internalExams: [internalExamSchema],
    semesterExams: [semesterExamSchema],

    // Achievements & Portfolio
    certifications: [certificationSchema],
    courses: [courseSchema],
    activities: [activitySchema],

    // Skills
    technicalSkills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],

    // Summary bio / goals
    bio: { type: String, trim: true, maxlength: 500 },
    careerGoals: { type: String, trim: true, maxlength: 500 },

    // Attendance (optional overview)
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // Calculated fields (updated on save)
    overallCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    profileCompleteness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: count total certifications
menteeProfileSchema.virtual('certificationCount').get(function () {
  return this.certifications ? this.certifications.length : 0;
});

// Virtual: count total courses
menteeProfileSchema.virtual('courseCount').get(function () {
  return this.courses ? this.courses.length : 0;
});

// Virtual: count total activities
menteeProfileSchema.virtual('activityCount').get(function () {
  return this.activities ? this.activities.length : 0;
});

// Pre-save: calculate profile completeness & CGPA
menteeProfileSchema.pre('save', function (next) {
  let completeness = 0;
  const checks = [
    this.department,
    this.rollNumber,
    this.batch,
    this.currentSemester,
    this.phone,
    this.bio,
    this.internalExams && this.internalExams.length > 0,
    this.semesterExams && this.semesterExams.length > 0,
    this.certifications && this.certifications.length > 0,
    this.courses && this.courses.length > 0,
  ];
  checks.forEach((c) => {
    if (c) completeness += 10;
  });
  this.profileCompleteness = completeness;

  // Update CGPA from latest semester exam
  if (this.semesterExams && this.semesterExams.length > 0) {
    const latest = this.semesterExams.reduce((a, b) =>
      a.semester > b.semester ? a : b
    );
    if (latest.cgpa) this.overallCgpa = latest.cgpa;
  }

  next();
});

// Index for common queries
menteeProfileSchema.index({ department: 1, batch: 1 });

const MenteeProfile = mongoose.model('MenteeProfile', menteeProfileSchema);
module.exports = MenteeProfile;
