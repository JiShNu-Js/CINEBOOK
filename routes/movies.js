/**
 * CineBook - Movies Routes
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Provides REST endpoints for fetching movie catalog items
 * and checking occupied seats for specific showtimes.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/movies
 * Retrieve all movies from MySQL database
 */
router.get('/', async (req, res) => {
    try {
        const [movies] = await db.query(
            'SELECT movie_id, title, description, genre, duration, price, poster FROM movies ORDER BY movie_id ASC'
        );
        return res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (err) {
        console.error('[Movies List Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve movies from database.'
        });
    }
});

/**
 * GET /api/movies/:id
 * Retrieve single movie by primary key
 */
router.get('/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        if (isNaN(movieId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid movie ID.'
            });
        }

        const [rows] = await db.query(
            'SELECT movie_id, title, description, genre, duration, price, poster FROM movies WHERE movie_id = ?',
            [movieId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found.'
            });
        }

        return res.json({
            success: true,
            movie: rows[0]
        });
    } catch (err) {
        console.error('[Movie Details Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve movie details.'
        });
    }
});

/**
 * GET /api/movies/:id/booked-seats
 * Returns list of already booked seats for a particular movie, theater, date, and showtime
 */
router.get('/:id/booked-seats', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const { date, time, theaterId, theater_id } = req.query;
        const targetTheaterId = parseInt(theaterId || theater_id);

        if (!movieId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Movie ID, date, and time are required query parameters.'
            });
        }

        let sql;
        let queryParams;

        if (targetTheaterId && !isNaN(targetTheaterId)) {
            // Theater-specific occupied seat checking
            sql = 'SELECT seats FROM bookings WHERE movie_id = ? AND theater_id = ? AND show_date = ? AND show_time = ?';
            queryParams = [movieId, targetTheaterId, date, time];
        } else {
            // Backward-compatible query without theater filter
            sql = 'SELECT seats FROM bookings WHERE movie_id = ? AND show_date = ? AND show_time = ?';
            queryParams = [movieId, date, time];
        }

        const [rows] = await db.query(sql, queryParams);

        // Aggregate booked seats into a single flat array
        const bookedSeats = [];
        if (rows && rows.length > 0) {
            rows.forEach(row => {
                if (row.seats) {
                    const seatList = row.seats.split(',').map(s => s.trim());
                    bookedSeats.push(...seatList);
                }
            });
        }

        return res.json({
            success: true,
            theaterId: targetTheaterId || null,
            bookedSeats
        });
    } catch (err) {
        console.error('[Booked Seats Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to check seat availability.'
        });
    }
});

module.exports = router;
