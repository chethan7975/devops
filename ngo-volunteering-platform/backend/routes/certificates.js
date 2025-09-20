const express = require('express');
const {
  issueCertificate,
  downloadCertificate,
  verifyCertificate,
  getMyCertificates,
  getIssuedCertificates,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/certificates/issue/:volunteerId
router.post('/issue/:volunteerId', protect, authorize('ngo'), issueCertificate);

// @route   GET /api/certificates/download/:certificateId
router.get('/download/:certificateId', protect, downloadCertificate);

// @route   GET /api/certificates/verify/:verificationCode
router.get('/verify/:verificationCode', verifyCertificate);

// @route   GET /api/certificates/my-certificates
router.get('/my-certificates', protect, authorize('volunteer'), getMyCertificates);

// @route   GET /api/certificates/issued
router.get('/issued', protect, authorize('ngo'), getIssuedCertificates);

module.exports = router;