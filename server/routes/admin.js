const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Load = require('../models/Load');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Benefit = require('../models/Benefit');

// Middleware to check if user is admin or superadmin
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  next();
}

// Middleware to check if user is superadmin
function superAdminMiddleware(req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(401).json({ msg: 'Unauthorized - Requires SuperAdmin privileges' });
  }
  next();
}

// Get dashboard statistics
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get counts
    const shipperCount = await User.countDocuments({ role: 'shipper' });
    const truckerCount = await User.countDocuments({ role: 'trucker' });
    const loadCount = await Load.countDocuments();
    const pendingLoadCount = await Load.countDocuments({ status: 'pending' });
    const inTransitLoadCount = await Load.countDocuments({ status: 'in transit' });
    const deliveredLoadCount = await Load.countDocuments({ status: 'delivered' });
    const bidCount = await Bid.countDocuments();
    
    // Get recent data
    const recentShippers = await User.find({ role: 'shipper' })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentTruckers = await User.find({ role: 'trucker' })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentLoads = await Load.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('shipper', ['name', 'email'])
      .populate('assignedTrucker', ['name', 'email']);
    
    res.json({
      counts: {
        shippers: shipperCount,
        truckers: truckerCount,
        loads: loadCount,
        pendingLoads: pendingLoadCount,
        inTransitLoads: inTransitLoadCount,
        deliveredLoads: deliveredLoadCount,
        bids: bidCount
      },
      recent: {
        shippers: recentShippers,
        truckers: recentTruckers,
        loads: recentLoads
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all shippers
router.get('/shippers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const shippers = await User.find({ role: 'shipper' })
      .sort({ createdAt: -1 });
    res.json(shippers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all truckers
router.get('/truckers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const truckers = await User.find({ role: 'trucker' })
      .sort({ createdAt: -1 });
    res.json(truckers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific user
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new user (admin or superadmin only)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, password, role, accidents, theftComplaints, truckAge, driversLicenseYears } = req.body;
  
  try {
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      accidents: accidents || 0,
      theftComplaints: theftComplaints || 0,
      truckAge: truckAge || 0,
      driversLicenseYears: driversLicenseYears || 0,
      status: 'active',
      isVerified: true
    });
    
    // Check benefits eligibility for truckers
    if (role === 'trucker') {
      user.benefitsEligible = user.isEligible();
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a user (admin or superadmin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update fields
    const { name, email, role, accidents, theftComplaints, truckAge, driversLicenseYears, status, isVerified } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (accidents !== undefined) user.accidents = accidents;
    if (theftComplaints !== undefined) user.theftComplaints = theftComplaints;
    if (truckAge !== undefined) user.truckAge = truckAge;
    if (driversLicenseYears !== undefined) user.driversLicenseYears = driversLicenseYears;
    if (status) user.status = status;
    if (isVerified !== undefined) user.isVerified = isVerified;
    
    // Update benefits eligibility for truckers
    if (user.role === 'trucker') {
      user.benefitsEligible = user.isEligible();
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all loads with detailed information
router.get('/loads', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const loads = await Load.find()
      .populate('shipper', ['name', 'email'])
      .populate('assignedTrucker', ['name', 'email'])
      .populate('winningBid')
      .sort({ createdAt: -1 });
    res.json(loads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all bids with detailed information
router.get('/bids', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('load', ['origin', 'destination', 'status'])
      .populate('trucker', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get system statistics (superadmin only)
router.get('/system-stats', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    // Get counts for all entities
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const superAdminCount = await User.countDocuments({ role: 'superadmin' });
    const shipperCount = await User.countDocuments({ role: 'shipper' });
    const truckerCount = await User.countDocuments({ role: 'trucker' });
    
    const loadCount = await Load.countDocuments();
    const bidCount = await Bid.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const benefitCount = await Benefit.countDocuments();
    
    // Get eligibility statistics
    const eligibleTruckerCount = await User.countDocuments({
      role: 'trucker',
      accidents: 0,
      theftComplaints: 0,
      truckAge: { $lte: 5 },
      driversLicenseYears: { $gte: 5 }
    });
    
    res.json({
      users: {
        total: userCount,
        admins: adminCount,
        superAdmins: superAdminCount,
        shippers: shipperCount,
        truckers: truckerCount,
        eligibleTruckers: eligibleTruckerCount
      },
      entities: {
        loads: loadCount,
        bids: bidCount,
        transactions: transactionCount,
        benefits: benefitCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
