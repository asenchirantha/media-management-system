const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Test endpoint to check all users (for debugging)
router.get('/test', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    console.log('All users in database:', users.length);
    res.json({ count: users.length, users: users });
  } catch (error) {
    console.error('Error in test users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('User making request:', req.user);
    console.log('User role:', req.user.role);
    
    // Only allow admin
    if (req.user.role !== 'Admin') {
      console.log('Access denied - user role is not Admin');
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const users = await User.find().select('-password');
    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error in get users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
