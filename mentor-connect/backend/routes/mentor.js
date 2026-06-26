const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboard,
  getMenteeDetails,
  getMenteePdfData,
  assignMentee,
} = require('../controllers/mentorController');

router.use(protect, restrictTo('mentor'));

router.get('/dashboard', getDashboard);
router.post('/assign-mentee', assignMentee);
router.get('/mentee/:menteeId', getMenteeDetails);
router.get('/mentee/:menteeId/pdf-data', getMenteePdfData);

module.exports = router;
