const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  load: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['payment', 'payout', 'refund', 'fee', 'other'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
  description: { type: String },
  reference: { type: String }, // Reference number or ID
  paymentMethod: { type: String },
  paymentDetails: {
    cardLast4: { type: String },
    bankAccount: { type: String },
    provider: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', transactionSchema);