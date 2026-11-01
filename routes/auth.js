/**
 * CineBook - Authentication Routes
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Handles user registration (Signup), authentication (Login),
 * session termination (Logout), and current session status (Me).
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Regular expression for basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/signup
 * Register a new user account with hashed password
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        // 2. Validate name length
        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long.'
            });
        }

        // 3. Validate email format
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // 4. Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 5. Check password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        // 6. Check for duplicate email in database
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [trimmedEmail]
        );

        if (existing && existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please log in.'
            });
        }

        // 7. Hash the password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 8. Insert new user into MySQL (enforcing standard 'user' role)
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [trimmedName, trimmedEmail, hashedPassword, 'user']
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.',
            userId: result.insertId
        });
    } catch (err) {
        console.error('[Signup Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred during registration. Please try again.'
        });
    }
});

/**
 * POST /api/login
 * Authenticate user credentials and establish session
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // 2. Query user from database
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [trimmedEmail]
        );

        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = rows[0];

        // 3. Compare password with stored bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // 4. Save user details in express-session (never expose password)
        req.session.user = {
            id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('[Login Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred during login. Please try again.'
        });
    }
});

/**
 * POST /api/logout
 * Destroy session and clear session cookie
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('[Logout Error]:', err);
            return res.status(500).json({
                success: false,
                message: 'Could not log out at this moment.'
            });
        }
        res.clearCookie('connect.sid');
        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

/**
 * GET /api/me
 * Check current authentication state and get user info
 */
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({
            success: true,
            loggedIn: true,
            user: req.session.user
        });
    }
    return res.json({
        success: true,
        loggedIn: false,
        user: null
    });
});

module.exports = router;
