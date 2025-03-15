const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['insurance', 'discount', 'service'], required: true },
  description: { type: String, required: true },
  discount: { type: Number }, // Percentage discount if applicable
  provider: { type: String },
  eligibilityCriteria: {
    minDriverExperience: { type: Number, default: 0 }, // Minimum years of driving experience
    noAccidents: { type: Boolean, default: false }, // No accidents required
    noTheftComplaints: { type: Boolean, default: false }, // No theft complaints required
    maxTruckAge: { type: Number } // Maximum truck age allowed
  },
  category: { type: String, enum: ['tires', 'spare_parts', 'service', 'lodging', 'food', 'fuel', 'insurance', 'other'] },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Benefit', benefitSchema);