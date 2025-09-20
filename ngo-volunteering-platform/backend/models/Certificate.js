const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
  },
  certificateId: {
    type: String,
    unique: true,
    required: true,
  },
  serviceDays: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  certificateURL: {
    type: String,
  },
  qrCode: {
    type: String, // Base64 encoded QR code
  },
  verificationCode: {
    type: String,
    unique: true,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate unique certificate ID before saving
certificateSchema.pre('save', async function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.certificateId = `CERT-${timestamp}-${randomStr}`.toUpperCase();
  }
  
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);