/**
 * CineBook - Main Express Application Server
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Configures Express middleware, session handling, static asset serving,
 * and mounts REST API routes.
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------------
// Middleware Configuration
// -------------------------------------------------------------

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Express Session for user authentication
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'cinebook_default_session_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true if using HTTPS in production
            httpOnly: true, // Prevents client-side script access to cookie
            maxAge: 1000 * 60 * 60 * 24 // 24 hours validity
        }
    })
);

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// REST API Route Mounts
// -------------------------------------------------------------
app.use('/api', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Root route: redirect directly to movie catalog
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'movies.html'));
});

// Fallback 404 handler for unknown API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]:', err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected internal server error occurred.'
    });
});

// -------------------------------------------------------------
// Server Initialization
// -------------------------------------------------------------
async function startServer() {
    // Test MySQL connectivity at boot
    await db.testConnection();

    app.listen(PORT, () => {
        console.log('====================================================');
        console.log(`🎬 CineBook Server is running on http://localhost:${PORT}`);
        console.log(`🍿 Browse Movies:     http://localhost:${PORT}/movies.html`);
        console.log(`🔐 User Login:        http://localhost:${PORT}/login.html`);
        console.log(`📝 User Signup:       http://localhost:${PORT}/signup.html`);
        console.log(`🛡️  Admin Dashboard:   http://localhost:${PORT}/admin.html`);
        console.log('====================================================');
    });
}

// Start server only if executed directly (allows clean testing via supertest/http)
if (require.main === module) {
    startServer();
}

module.exports = app;

