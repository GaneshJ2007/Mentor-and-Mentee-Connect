const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MenteeProfile = require('../models/MenteeProfile');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const userResponse = user.toObject ? user.toObject() : { ...user._doc };
  delete userResponse.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, mentorId } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and role.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const userData = { fullName, email, password, role };

    // If registering as mentee and a mentorId is provided, assign them
    if (role === 'mentee' && mentorId) {
      const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
      if (!mentor) {
        return res.status(404).json({ success: false, message: 'Mentor not found.' });
      }
      userData.assignedMentor = mentorId;
    }

    const user = await User.create(userData);

    // If mentee, add them to mentor's assignedMentees list
    if (role === 'mentee' && mentorId) {
      await User.findByIdAndUpdate(mentorId, {
        $addToSet: { assignedMentees: user._id },
      });
    }

    // If mentee, create an empty profile scaffold
    if (role === 'mentee') {
      await MenteeProfile.create({
        userId: user._id,
        department: req.body.department || 'Not Set',
        program: req.body.program || 'B.E.',
        batch: req.body.batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available mentors (for mentee registration)
// @route   GET /api/auth/mentors
// @access  Public
const getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('fullName email _id')
      .sort('fullName');
    res.status(200).json({ success: true, count: mentors.length, mentors });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getMentors };
