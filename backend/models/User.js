const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['mentor', 'mentee'],
        message: 'Role must be either mentor or mentee',
      },
      required: [true, 'Role is required'],
    },
    // Mentors can have multiple assigned mentees
    assignedMentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Mentee references their assigned mentor
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get mentee profile
userSchema.virtual('menteeProfile', {
  ref: 'MenteeProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method: compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method: find mentor with all mentee profiles populated
userSchema.statics.findMentorWithMentees = async function (mentorId) {
  return this.findById(mentorId)
    .populate({
      path: 'assignedMentees',
      select: '-password',
      populate: {
        path: 'menteeProfile',
        model: 'MenteeProfile',
      },
    })
    .select('-password');
};

const User = mongoose.model('User', userSchema);
module.exports = User;
