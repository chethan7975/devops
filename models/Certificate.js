const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Volunteer ID is required']
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: [true, 'NGO ID is required']
  },
  volunteerName: {
    type: String,
    required: [true, 'Volunteer name is required']
  },
  ngoName: {
    type: String,
    required: [true, 'NGO name is required']
  },
  serviceDays: {
    type: Number,
    required: [true, 'Service days is required'],
    min: [1, 'Service days must be at least 1']
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  certificateURL: {
    type: String,
    required: [true, 'Certificate URL is required']
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required']
  },
  verificationCode: {
    type: String,
    unique: true,
    required: [true, 'Verification code is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Generate verification code before saving
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = generateVerificationCode();
  }
  next();
});

// Generate a unique verification code
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Index for faster queries
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ volunteerId: 1 });
certificateSchema.index({ ngoId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);