const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Task 3: Protected Profile Route (accessible to any logged-in user)
router.get('/profile', protect, getProfile);

// Admin Test Route
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

module.exports = router;