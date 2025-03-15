const express = require('express');
const router = express.Router();
const Benefit = require('../models/Benefit');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  next();
}

// Create a new benefit (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, type, description, discount, provider, eligibilityCriteria, category, validUntil } = req.body;
  
  try {
    const benefit = new Benefit({
      name,
      type,
      description,
      discount,
      provider,
      eligibilityCriteria,
      category,
      validUntil
    });
    
    await benefit.save();
    res.json(benefit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all benefits
router.get('/', authMiddleware, async (req, res) => {
  try {
    const benefits = await Benefit.find({ isActive: true });
    res.json(benefits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get benefits for a specific trucker (filtered by eligibility)
router.get('/eligible', authMiddleware, async (req, res) => {
  if (req.user.role !== 'trucker') {
    return res.status(401).json({ msg: 'Only truckers can access their eligible benefits' });
  }
  
  try {
    const trucker = await User.findById(req.user.id);
    
    // Get all active benefits
    const allBenefits = await Benefit.find({ isActive: true });
    
    // Filter benefits based on trucker's eligibility
    const eligibleBenefits = allBenefits.filter(benefit => {
      const criteria = benefit.eligibilityCriteria;
      
      return (
        (!criteria.noAccidents || trucker.accidents === 0) &&
        (!criteria.noTheftComplaints || trucker.theftComplaints === 0) &&
        (!criteria.maxTruckAge || trucker.truckAge <= criteria.maxTruckAge) &&
        (!criteria.minDriverExperience || trucker.driversLicenseYears >= criteria.minDriverExperience)
      );
    });
    
    res.json(eligibleBenefits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific benefit
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id);
    
    if (!benefit) {
      return res.status(404).json({ msg: 'Benefit not found' });
    }
    
    res.json(benefit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a benefit (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const benefit = await Benefit.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!benefit) {
      return res.status(404).json({ msg: 'Benefit not found' });
    }
    
    res.json(benefit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a benefit (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id);
    
    if (!benefit) {
      return res.status(404).json({ msg: 'Benefit not found' });
    }
    
    await benefit.remove();
    res.json({ msg: 'Benefit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;