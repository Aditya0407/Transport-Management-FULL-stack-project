const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Load = require('../models/Load');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  next();
}

// Create a new transaction (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, loadId, amount, type, description, paymentMethod, paymentDetails } = req.body;
  
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      user: userId,
      load: loadId,
      amount,
      type,
      description,
      paymentMethod,
      paymentDetails
    });
    
    await transaction.save();
    
    // Update user balance
    if (type === 'payment') {
      user.balance -= amount;
    } else if (type === 'payout') {
      user.balance += amount;
    }
    
    await user.save();
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all transactions (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', ['name', 'email', 'role'])
      .populate('load', ['origin', 'destination', 'status'])
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user's transactions
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('load', ['origin', 'destination', 'status'])
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get transactions for a specific load
router.get('/load/:loadId', authMiddleware, async (req, res) => {
  try {
    const load = await Load.findById(req.params.loadId);
    
    // Check if user is authorized to view load transactions
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      if (load.shipper.toString() !== req.user.id && load.assignedTrucker?.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to view these transactions' });
      }
    }
    
    const transactions = await Transaction.find({ load: req.params.loadId })
      .populate('user', ['name', 'email', 'role'])
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update transaction status (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  
  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    // Update transaction
    transaction.status = status;
    if (status === 'completed') {
      transaction.completedAt = Date.now();
    }
    
    await transaction.save();
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;