const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  description: {
    type: String,
    trim: true,
  },
  logo: {
    type: String, // URL to logo image
  },
  certificateThreshold: {
    type: Number,
    default: 30, // Default 30 days to earn certificate
  },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
  }],
  contactInfo: {
    phone: String,
    address: String,
    website: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
ngoSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
ngoSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('NGO', ngoSchema);