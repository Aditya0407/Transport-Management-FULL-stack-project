const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  load: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
  trucker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' },
  notes: { type: String },
  // Trucker eligibility at time of bid
  truckerEligible: { type: Boolean, default: false },
  // Timestamps
  expiresAt: { type: Date },
  acceptedAt: { type: Date },
  rejectedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', bidSchema);
