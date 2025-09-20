const express = require('express');
const {
  getNGODashboard,
  approveVolunteer,
  updateCertificateThreshold,
  getVolunteerDetails,
  getVolunteers,
} = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ngo/dashboard
router.get('/dashboard', protect, authorize('ngo'), getNGODashboard);

// @route   GET /api/ngo/volunteers
router.get('/volunteers', protect, authorize('ngo'), getVolunteers);

// @route   GET /api/ngo/volunteers/:volunteerId
router.get('/volunteers/:volunteerId', protect, authorize('ngo'), getVolunteerDetails);

// @route   PUT /api/ngo/volunteers/:volunteerId/approve
router.put('/volunteers/:volunteerId/approve', protect, authorize('ngo'), approveVolunteer);

// @route   PUT /api/ngo/certificate-threshold
router.put('/certificate-threshold', protect, authorize('ngo'), updateCertificateThreshold);

module.exports = router;