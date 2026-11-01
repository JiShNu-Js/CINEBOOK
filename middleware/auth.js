/**
 * CineBook - Authentication & Authorization Middleware
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Middleware functions to protect sensitive API endpoints
 * and enforce role-based access control.
 */

// Check if user has an active session
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
    });
}

// Check if authenticated user has 'admin' privileges
function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrator privileges required.'
    });
}

module.exports = {
    isAuthenticated,
    isAdmin
};
