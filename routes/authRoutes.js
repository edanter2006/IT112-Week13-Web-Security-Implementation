const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { body } = require('express-validator');

router.post('/register',
  [
    body('username').notEmpty().withMessage('Username required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/[A-Z]/).withMessage('Must include at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Must include at least one number')
  ],
  register
);

router.post('/login', login);

// Task 3: Protected Profile Route (accessible to any logged-in user)
router.get('/profile', protect, getProfile);

// Admin Test Route
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

module.exports = router;