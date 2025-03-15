const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  shipper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  shipmentDate: { type: Date, required: true },
  weight: { type: Number, required: true },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  status: { type: String, enum: ['pending', 'assigned', 'in transit', 'delivered', 'cancelled'], default: 'pending' },
  winningBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  assignedTrucker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, default: 0 },
  // Load tracking
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    updatedAt: { type: Date }
  },
  // Financial management
  paymentStatus: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
  paymentDate: { type: Date },
  // Alerts and notifications
  alerts: [{
    type: { type: String },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  }],
  // Timestamps
  pickupTime: { type: Date },
  deliveryTime: { type: Date },
  estimatedDeliveryTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Load', loadSchema);
