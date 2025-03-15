const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Load = require('../models/Load');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Place a bid on a load (only truckers allowed)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'trucker') {
    return res.status(401).json({ msg: 'Only truckers can bid on loads' });
  }
  const { loadId, amount, notes } = req.body;
  try {
    const load = await Load.findById(loadId);
    if (!load) return res.status(404).json({ msg: 'Load not found' });

    // Get trucker details to check eligibility
    const trucker = await User.findById(req.user.id);
    const isEligible = trucker.isEligible();

    // Create the bid with eligibility status
    const bid = new Bid({
      load: loadId,
      trucker: req.user.id,
      amount,
      notes,
      truckerEligible: isEligible,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });
    await bid.save();

    // Only update winning bid if trucker is eligible and bid is lowest
    if (isEligible && (!load.winningBid || amount < load.winningBid.amount)) {
      load.winningBid = bid._id;
      await load.save();
    }
    
    res.json({
      bid,
      isEligible,
      message: isEligible ? 'Bid placed successfully' : 'Bid placed but you are not eligible for this load due to eligibility criteria'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all bids for a specific load
router.get('/load/:loadId', authMiddleware, async (req, res) => {
  try {
    const bids = await Bid.find({ load: req.params.loadId })
      .populate('trucker', ['name', 'email', 'accidents', 'theftComplaints', 'truckAge', 'driversLicenseYears'])
      .sort({ amount: 1 }); // Sort by lowest bid first
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all bids by a trucker
router.get('/trucker', authMiddleware, async (req, res) => {
  if (req.user.role !== 'trucker') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  
  try {
    const bids = await Bid.find({ trucker: req.user.id })
      .populate('load', ['origin', 'destination', 'shipmentDate', 'status'])
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Accept a bid (only shipper who owns the load can accept)
router.put('/accept/:bidId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'shipper') {
    return res.status(401).json({ msg: 'Only shippers can accept bids' });
  }
  
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ msg: 'Bid not found' });
    
    const load = await Load.findById(bid.load);
    if (!load) return res.status(404).json({ msg: 'Load not found' });
    
    // Check if the shipper owns the load
    if (load.shipper.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to accept this bid' });
    }
    
    // Check if trucker is eligible
    if (!bid.truckerEligible) {
      return res.status(400).json({ msg: 'Cannot accept bid from ineligible trucker' });
    }
    
    // Update bid status
    bid.status = 'accepted';
    bid.acceptedAt = Date.now();
    await bid.save();
    
    // Update load status and assigned trucker
    load.status = 'assigned';
    load.assignedTrucker = bid.trucker;
    load.price = bid.amount;
    load.winningBid = bid._id;
    await load.save();
    
    res.json({ bid, load });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
