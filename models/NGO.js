const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true,
    maxlength: [100, 'NGO name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  certificateThreshold: {
    type: Number,
    default: 30,
    min: [1, 'Certificate threshold must be at least 1 day']
  },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String
  }],
  totalVolunteers: {
    type: Number,
    default: 0
  },
  totalServiceDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
ngoSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
ngoSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
ngoSchema.methods.toJSON = function() {
  const ngo = this.toObject();
  delete ngo.password;
  return ngo;
};

module.exports = mongoose.model('NGO', ngoSchema);