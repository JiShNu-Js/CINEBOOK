/**
 * CineBook - Bookings Routes
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Handles ticket booking creation, calculation, seat conflict checking,
 * and retrieval of booking confirmations.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

/**
 * POST /api/book
 * Reserve movie tickets. Protected: Must be logged in.
 * Workflow: Movie -> Theater -> Date -> Showtime -> Seats -> Confirmation.
 */
router.post('/book', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        let { movieId, theaterId, theater_id, showDate, showTime, seats } = req.body;

        // Support both theaterId and theater_id
        const parsedTheaterId = parseInt(theaterId || theater_id) || 1;

        // 1. Validate required inputs
        if (!movieId || !showDate || !showTime || !seats) {
            return res.status(400).json({
                success: false,
                message: 'All booking fields (movie, date, time, and seats) are required.'
            });
        }

        const parsedMovieId = parseInt(movieId);
        if (isNaN(parsedMovieId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid movie ID.'
            });
        }

        // Validate theater exists
        const [theaterRows] = await db.query(
            'SELECT theater_id, theater_name, screen_name FROM theaters WHERE theater_id = ?',
            [parsedTheaterId]
        );

        if (!theaterRows || theaterRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selected cinema theater does not exist.'
            });
        }

        // Standardize seats representation
        let seatArray = [];
        if (Array.isArray(seats)) {
            seatArray = seats.map(s => String(s).trim()).filter(Boolean);
        } else if (typeof seats === 'string') {
            seatArray = seats.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (seatArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one seat.'
            });
        }

        // Normalize seat string
        const seatsString = seatArray.join(', ');
        const ticketCount = seatArray.length;

        // 2. Fetch movie details from database to recalculate verified price
        const [movieRows] = await db.query(
            'SELECT movie_id, title, price FROM movies WHERE movie_id = ?',
            [parsedMovieId]
        );

        if (!movieRows || movieRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Selected movie does not exist.'
            });
        }

        const movie = movieRows[0];
        const unitPrice = parseFloat(movie.price);

        // Security check: Recalculate price on the server, NEVER trust client total
        const serverCalculatedTotal = parseFloat((unitPrice * ticketCount).toFixed(2));

        // 3. Prevent duplicate seat reservation for the specific movie + theater + date + showtime
        const [existingBookings] = await db.query(
            'SELECT seats FROM bookings WHERE movie_id = ? AND theater_id = ? AND show_date = ? AND show_time = ?',
            [parsedMovieId, parsedTheaterId, showDate, showTime]
        );

        const occupiedSeats = new Set();
        if (existingBookings && existingBookings.length > 0) {
            existingBookings.forEach(b => {
                if (b.seats) {
                    b.seats.split(',').forEach(s => occupiedSeats.add(s.trim()));
                }
            });
        }

        const conflictSeats = seatArray.filter(seat => occupiedSeats.has(seat));
        if (conflictSeats.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Sorry, seat(s) ${conflictSeats.join(', ')} have already been reserved in this theater for the selected showtime. Please select alternative seats.`
            });
        }

        // 4. Save booking in MySQL database including theater_id
        const [result] = await db.query(
            'INSERT INTO bookings (user_id, movie_id, theater_id, show_date, show_time, seats, ticket_count, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, parsedMovieId, parsedTheaterId, showDate, showTime, seatsString, ticketCount, serverCalculatedTotal]
        );

        return res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully!',
            bookingId: result.insertId,
            theaterId: parsedTheaterId,
            totalPrice: serverCalculatedTotal
        });
    } catch (err) {
        console.error('[Booking Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to process your booking. Please try again.'
        });
    }
});

/**
 * GET /api/my-bookings
 * Retrieve all bookings belonging to the currently logged in user
 */
router.get('/my-bookings', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [bookings] = await db.query(
            `SELECT b.booking_id, b.movie_id, b.theater_id, b.show_date, b.show_time, b.seats, b.ticket_count, b.total_price, b.created_at,
                    m.title, m.poster, m.genre,
                    t.theater_name, t.location AS theater_location, t.screen_name
             FROM bookings b
             JOIN movies m ON b.movie_id = m.movie_id
             LEFT JOIN theaters t ON b.theater_id = t.theater_id
             WHERE b.user_id = ?
             ORDER BY b.booking_id DESC`,
            [userId]
        );

        return res.json({
            success: true,
            bookings: bookings || []
        });
    } catch (err) {
        console.error('[My Bookings Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve your bookings.'
        });
    }
});

/**
 * GET /api/booking/:id
 * Retrieve specific booking details. Protected: Users can only see their own bookings.
 */
router.get('/booking/:id', isAuthenticated, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const userId = req.session.user.id;
        const userRole = req.session.user.role;

        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking reference ID.'
            });
        }

        // Query booking details with joined movie, theater, and user info
        const [rows] = await db.query(
            `SELECT b.booking_id, b.user_id, b.movie_id, b.theater_id, b.show_date, b.show_time, b.seats, b.ticket_count, b.total_price, b.created_at,
                    m.title, m.poster, m.genre, m.price, m.duration,
                    t.theater_name, t.location AS theater_location, t.screen_name,
                    u.name AS user_name, u.email AS user_email
             FROM bookings b
             JOIN movies m ON b.movie_id = m.movie_id
             LEFT JOIN theaters t ON b.theater_id = t.theater_id
             JOIN users u ON b.user_id = u.user_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        const booking = rows[0];

        // Security check: Only the booking owner or an admin can view this booking
        if (booking.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own booking details.'
            });
        }

        return res.json({
            success: true,
            booking
        });
    } catch (err) {
        console.error('[Get Booking Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking information.'
        });
    }
});

module.exports = router;
