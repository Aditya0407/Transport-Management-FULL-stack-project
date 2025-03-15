const express = require('express');
const router = express.Router();
const Load = require('../models/Load');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Post a new load (only shippers allowed)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'shipper') {
    return res.status(401).json({ msg: 'Only shippers can post loads' });
  }
  const { origin, destination, shipmentDate, weight, dimensions, estimatedDeliveryTime } = req.body;
  try {
    let load = new Load({
      shipper: req.user.id,
      origin,
      destination,
      shipmentDate,
      weight,
      dimensions,
      estimatedDeliveryTime
    });
    load = await load.save();
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all loads
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filter parameters
    const { origin, destination, shipmentDate, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (origin) filter.origin = new RegExp(origin, 'i');
    if (destination) filter.destination = new RegExp(destination, 'i');
    if (shipmentDate) filter.shipmentDate = { $gte: new Date(shipmentDate) };
    if (status) filter.status = status;
    
    // For truckers, only show pending loads
    if (req.user.role === 'trucker') {
      filter.status = 'pending';
    }
    
    // For shippers, only show their own loads
    if (req.user.role === 'shipper') {
      filter.shipper = req.user.id;
    }
    
    const loads = await Load.find(filter)
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

// Get a single load by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('shipper', ['name', 'email'])
      .populate('assignedTrucker', ['name', 'email'])
      .populate('winningBid');
    
    if (!load) return res.status(404).json({ msg: 'Load not found' });
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update load tracking information (only assigned trucker can update)
router.put('/tracking/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'trucker') {
    return res.status(401).json({ msg: 'Only truckers can update tracking information' });
  }
  
  try {
    const load = await Load.findById(req.params.id);
    
    if (!load) {
      return res.status(404).json({ msg: 'Load not found' });
    }
    
    // Check if the trucker is assigned to this load
    if (!load.assignedTrucker || load.assignedTrucker.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this load' });
    }
    
    const { lat, lng, address } = req.body;
    
    // Update tracking information
    load.currentLocation = {
      lat,
      lng,
      address,
      updatedAt: Date.now()
    };
    
    // If status is 'assigned' and this is the first tracking update, change to 'in transit'
    if (load.status === 'assigned') {
      load.status = 'in transit';
      load.pickupTime = Date.now();
    }
    
    await load.save();
    
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark load as delivered (only assigned trucker can update)
router.put('/deliver/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'trucker') {
    return res.status(401).json({ msg: 'Only truckers can mark loads as delivered' });
  }
  
  try {
    const load = await Load.findById(req.params.id);
    
    if (!load) {
      return res.status(404).json({ msg: 'Load not found' });
    }
    
    // Check if the trucker is assigned to this load
    if (!load.assignedTrucker || load.assignedTrucker.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this load' });
    }
    
    // Update load status
    load.status = 'delivered';
    load.deliveryTime = Date.now();
    
    await load.save();
    
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add alert to load (admin or shipper only)
router.post('/alert/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'shipper') {
    return res.status(401).json({ msg: 'Not authorized to add alerts' });
  }
  
  try {
    const load = await Load.findById(req.params.id);
    
    if (!load) {
      return res.status(404).json({ msg: 'Load not found' });
    }
    
    // If shipper, check if they own the load
    if (req.user.role === 'shipper' && load.shipper.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to add alerts to this load' });
    }
    
    const { type, message } = req.body;
    
    // Add alert
    load.alerts.push({
      type,
      message,
      createdAt: Date.now(),
      isRead: false
    });
    
    await load.save();
    
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
