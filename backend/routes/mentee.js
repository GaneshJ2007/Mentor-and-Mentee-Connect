const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getMyProfile,
  updateProfile,
  updateInternalExams,
  updateSemesterExams,
  updateCertifications,
  updateCourses,
  updateActivities,
  saveFullProfile,
} = require('../controllers/menteeController');

router.use(protect, restrictTo('mentee'));

router.get('/profile', getMyProfile);
router.put('/profile', updateProfile);
router.post('/profile/full', saveFullProfile);
router.put('/academics/internal', updateInternalExams);
router.put('/academics/semester', updateSemesterExams);
router.put('/achievements/certifications', updateCertifications);
router.put('/achievements/courses', updateCourses);
router.put('/achievements/activities', updateActivities);

module.exports = router;
