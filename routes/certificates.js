const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const NGO = require('../models/NGO');
const { auth, ngoAuth, approvedVolunteerAuth } = require('../middleware/auth');
const { sendCertificateIssuedEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/certificates/generate
// @desc    Generate certificate for volunteer
// @access  Private (NGO)
router.post('/generate', [
  auth,
  ngoAuth,
  body('volunteerId').isMongoId().withMessage('Please provide a valid volunteer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { volunteerId } = req.body;

    // Get volunteer details
    const volunteer = await User.findOne({
      _id: volunteerId,
      ngoId: req.user._id,
      role: 'volunteer',
      isApproved: true
    });

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Check if volunteer is eligible for certificate
    if (volunteer.serviceDays < req.user.certificateThreshold) {
      return res.status(400).json({
        message: `Volunteer needs ${req.user.certificateThreshold - volunteer.serviceDays} more service days to be eligible for certificate`
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      volunteerId,
      ngoId: req.user._id
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists for this volunteer' });
    }

    // Generate certificate
    const certificateData = await generateCertificate(volunteer, req.user);

    // Save certificate to database
    const certificate = new Certificate({
      volunteerId: volunteer._id,
      ngoId: req.user._id,
      volunteerName: volunteer.name,
      ngoName: req.user.name,
      serviceDays: volunteer.serviceDays,
      certificateURL: certificateData.url,
      qrCode: certificateData.qrCode,
      verificationCode: certificateData.verificationCode,
      startDate: volunteer.createdAt,
      endDate: new Date()
    });

    await certificate.save();

    // Add certificate to volunteer's certificates array
    await User.findByIdAndUpdate(volunteerId, {
      $push: { certificates: certificate._id }
    });

    // Send email notification
    try {
      await sendCertificateIssuedEmail(
        volunteer.email,
        volunteer.name,
        req.user.name,
        volunteer.serviceDays,
        certificate.verificationCode
      );
    } catch (emailError) {
      console.error('Failed to send certificate email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate._id,
        url: certificate.certificateURL,
        verificationCode: certificate.verificationCode,
        qrCode: certificate.qrCode
      }
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error while generating certificate' });
  }
});

// @route   GET /api/certificates/volunteer
// @desc    Get volunteer's certificates
// @access  Private (Volunteer)
router.get('/volunteer', [auth, approvedVolunteerAuth], async (req, res) => {
  try {
    const certificates = await Certificate.find({
      volunteerId: req.user._id
    }).select('ngoName serviceDays issueDate certificateURL verificationCode status');

    res.json(certificates);
  } catch (error) {
    console.error('Get volunteer certificates error:', error);
    res.status(500).json({ message: 'Server error while fetching certificates' });
  }
});

// @route   GET /api/certificates/ngo/:ngoId
// @desc    Get all certificates for NGO
// @access  Private (NGO)
router.get('/ngo/:ngoId', [auth], async (req, res) => {
  try {
    const { ngoId } = req.params;

    // Check if user is NGO admin
    if (req.user.role !== 'ngo' || req.user._id.toString() !== ngoId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const certificates = await Certificate.find({ ngoId })
      .populate('volunteerId', 'name email')
      .select('volunteerName serviceDays issueDate verificationCode status')
      .sort({ issueDate: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Get NGO certificates error:', error);
    res.status(500).json({ message: 'Server error while fetching certificates' });
  }
});

// @route   GET /api/certificates/verify/:verificationCode
// @desc    Verify certificate
// @access  Public
router.get('/verify/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({ verificationCode })
      .populate('volunteerId', 'name')
      .populate('ngoId', 'name logo');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      valid: true,
      certificate: {
        volunteerName: certificate.volunteerName,
        ngoName: certificate.ngoName,
        serviceDays: certificate.serviceDays,
        issueDate: certificate.issueDate,
        status: certificate.status,
        ngoLogo: certificate.ngoId.logo
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error while verifying certificate' });
  }
});

// @route   GET /api/certificates/download/:certificateId
// @desc    Download certificate PDF
// @access  Private
router.get('/download/:certificateId', [auth], async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check access permissions
    if (req.user.role === 'volunteer' && certificate.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'ngo' && certificate.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Send the PDF file
    const filePath = path.join(__dirname, '..', 'certificates', `${certificateId}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.download(filePath, `certificate-${certificate.verificationCode}.pdf`);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Server error while downloading certificate' });
  }
});

// Helper function to generate certificate
async function generateCertificate(volunteer, ngo) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50
  });

  // Create certificates directory if it doesn't exist
  const certificatesDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const verificationCode = generateVerificationCode();
  const fileName = `${volunteer._id}_${Date.now()}.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(
    `${process.env.CLIENT_URL}/verify/${verificationCode}`
  );

  // Pipe PDF to file
  doc.pipe(fs.createWriteStream(filePath));

  // Certificate design
  doc.rect(0, 0, doc.page.width, doc.page.height)
    .fill('#f8f9fa');

  // Border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .stroke('#2c3e50')
    .lineWidth(3);

  // Inner border
  doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
    .stroke('#34495e')
    .lineWidth(1);

  // Title
  doc.fontSize(36)
    .fill('#2c3e50')
    .text('CERTIFICATE OF APPRECIATION', 0, 100, { align: 'center' });

  // Subtitle
  doc.fontSize(18)
    .fill('#7f8c8d')
    .text('This is to certify that', 0, 160, { align: 'center' });

  // Volunteer name
  doc.fontSize(28)
    .fill('#e74c3c')
    .text(volunteer.name, 0, 200, { align: 'center' });

  // Service description
  doc.fontSize(16)
    .fill('#2c3e50')
    .text(`has successfully completed ${volunteer.serviceDays} days of volunteer service`, 0, 250, { align: 'center' });

  // NGO name
  doc.fontSize(20)
    .fill('#3498db')
    .text(`with ${ngo.name}`, 0, 300, { align: 'center' });

  // Date
  doc.fontSize(14)
    .fill('#7f8c8d')
    .text(`Issued on: ${new Date().toLocaleDateString()}`, 0, 350, { align: 'center' });

  // QR Code
  doc.image(qrCodeDataURL, doc.page.width - 150, doc.page.height - 150, {
    width: 100,
    height: 100
  });

  // Verification code
  doc.fontSize(10)
    .fill('#95a5a6')
    .text(`Verification Code: ${verificationCode}`, 0, doc.page.height - 30, { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      resolve({
        url: `/api/certificates/download/${volunteer._id}_${Date.now()}`,
        qrCode: qrCodeDataURL,
        verificationCode
      });
    });
    doc.on('error', reject);
  });
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;