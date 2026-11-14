const User = require('../models/User');
const bcrypt = require('bcrypt');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;

        // 1. Confirm password validation
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // 2. Prevent duplicate emails
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user' // Allows specifying admin if passed, defaults to user
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PROFILE CONTROLLER (Task 3)
exports.getProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Profile access granted',
            userRole: req.user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};