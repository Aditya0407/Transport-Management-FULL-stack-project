const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['shipper', 'trucker', 'admin', 'superadmin'], default: 'trucker' },
  // Trucker eligibility criteria
  accidents: { type: Number, default: 0 },
  theftComplaints: { type: Number, default: 0 },
  truckAge: { type: Number, default: 0 },
  driversLicenseYears: { type: Number, default: 0 },
  // Financial information
  balance: { type: Number, default: 0 },
  // Benefits eligibility
  benefitsEligible: { type: Boolean, default: false },
  // Verification status
  isVerified: { type: Boolean, default: false },
  // Account status
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if trucker meets eligibility criteria
userSchema.methods.isEligible = function() {
  return (
    this.accidents === 0 &&
    this.theftComplaints === 0 &&
    this.truckAge <= 5 &&
    this.driversLicenseYears >= 5
  );
};

module.exports = mongoose.model('User', userSchema);
