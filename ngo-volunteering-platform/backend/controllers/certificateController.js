const Certificate = require('../models/Certificate');
const User = require('../models/User');
const NGO = require('../models/NGO');
const { generateCertificate } = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Issue certificate to volunteer
// @route   POST /api/certificates/issue/:volunteerId
// @access  Private (NGO only)
const issueCertificate = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const ngoId = req.user._id;

    // Get volunteer and NGO details
    const volunteer = await User.findById(volunteerId).populate('ngoId');
    const ngo = await NGO.findById(ngoId);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Verify volunteer belongs to this NGO
    if (volunteer.ngoId._id.toString() !== ngoId.toString()) {
      return res.status(403).json({ message: 'Not authorized to issue certificate for this volunteer' });
    }

    // Check if volunteer is approved
    if (!volunteer.isApproved) {
      return res.status(400).json({ message: 'Volunteer must be approved before issuing certificate' });
    }

    // Check if volunteer meets service day threshold
    if (volunteer.serviceDays < ngo.certificateThreshold) {
      return res.status(400).json({ 
        message: `Volunteer needs ${ngo.certificateThreshold - volunteer.serviceDays} more service days to earn certificate` 
      });
    }

    // Check if certificate already exists for this volunteer
    const existingCertificate = await Certificate.findOne({ 
      volunteerId, 
      ngoId,
      isValid: true 
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already issued for this volunteer' });
    }

    // Calculate service period (from first service to last service)
    const firstService = volunteer.serviceHistory.length > 0 
      ? volunteer.serviceHistory.sort((a, b) => a.date - b.date)[0].date
      : volunteer.createdAt;
    
    const lastService = volunteer.lastServiceDate || new Date();

    // Create certificate record
    const certificate = new Certificate({
      volunteerId,
      ngoId,
      serviceDays: volunteer.serviceDays,
      startDate: firstService,
      endDate: lastService,
    });

    await certificate.save();

    // Generate PDF certificate
    const certificateData = {
      volunteerId: volunteer._id,
      volunteerName: volunteer.name,
      ngoName: ngo.name,
      serviceDays: volunteer.serviceDays,
      startDate: firstService,
      endDate: lastService,
      certificateId: certificate.certificateId,
      verificationCode: certificate.verificationCode,
      ngoLogo: ngo.logo,
    };

    const pdfResult = await generateCertificate(certificateData);

    // Update certificate with file path
    certificate.certificateURL = `/api/certificates/download/${certificate._id}`;
    await certificate.save();

    // Add certificate to volunteer's certificates array
    volunteer.certificates.push(certificate._id);
    await volunteer.save();

    // Add certificate to NGO's certificates array
    ngo.certificates.push(certificate._id);
    await ngo.save();

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        serviceDays: certificate.serviceDays,
        issueDate: certificate.issueDate,
        downloadUrl: certificate.certificateURL,
        verificationCode: certificate.verificationCode,
      },
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ message: 'Server error issuing certificate' });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/download/:certificateId
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId)
      .populate('volunteerId', 'name')
      .populate('ngoId', 'name');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if user is authorized to download this certificate
    const userId = req.user._id.toString();
    const isVolunteer = certificate.volunteerId._id.toString() === userId;
    const isNGO = certificate.ngoId._id.toString() === userId;

    if (!isVolunteer && !isNGO) {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }

    const fileName = `certificate_${certificate.certificateId}.pdf`;
    const filePath = path.join(__dirname, '..', 'certificates', fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Server error downloading certificate' });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({ 
      verificationCode,
      isValid: true 
    })
      .populate('volunteerId', 'name email')
      .populate('ngoId', 'name email logo');

    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        message: 'Certificate not found or invalid' 
      });
    }

    res.json({
      success: true,
      message: 'Certificate verified successfully',
      certificate: {
        certificateId: certificate.certificateId,
        volunteer: {
          name: certificate.volunteerId.name,
          email: certificate.volunteerId.email,
        },
        ngo: {
          name: certificate.ngoId.name,
          logo: certificate.ngoId.logo,
        },
        serviceDays: certificate.serviceDays,
        serviceStartDate: certificate.startDate,
        serviceEndDate: certificate.endDate,
        issueDate: certificate.issueDate,
        isValid: certificate.isValid,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Server error verifying certificate' });
  }
};

// @desc    Get volunteer's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private (Volunteer only)
const getMyCertificates = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    const certificates = await Certificate.find({ 
      volunteerId,
      isValid: true 
    })
      .populate('ngoId', 'name logo')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      data: certificates.map(cert => ({
        id: cert._id,
        certificateId: cert.certificateId,
        ngo: cert.ngoId,
        serviceDays: cert.serviceDays,
        serviceStartDate: cert.startDate,
        serviceEndDate: cert.endDate,
        issueDate: cert.issueDate,
        downloadUrl: cert.certificateURL,
        verificationCode: cert.verificationCode,
      })),
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server error fetching certificates' });
  }
};

// @desc    Get NGO's issued certificates
// @route   GET /api/certificates/issued
// @access  Private (NGO only)
const getIssuedCertificates = async (req, res) => {
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const totalCertificates = await Certificate.countDocuments({ ngoId, isValid: true });
    
    const certificates = await Certificate.find({ 
      ngoId,
      isValid: true 
    })
      .populate('volunteerId', 'name email')
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: {
        certificates: certificates.map(cert => ({
          id: cert._id,
          certificateId: cert.certificateId,
          volunteer: cert.volunteerId,
          serviceDays: cert.serviceDays,
          serviceStartDate: cert.startDate,
          serviceEndDate: cert.endDate,
          issueDate: cert.issueDate,
          verificationCode: cert.verificationCode,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertificates / limit),
          totalCertificates,
          hasNext: page * limit < totalCertificates,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching issued certificates:', error);
    res.status(500).json({ message: 'Server error fetching issued certificates' });
  }
};

module.exports = {
  issueCertificate,
  downloadCertificate,
  verifyCertificate,
  getMyCertificates,
  getIssuedCertificates,
};