/**
 * CineBook - Admin Routes (Module IV CRUD Demonstration)
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Demonstrates full CRUD (Create, Read, Update, Delete) operations
 * using MySQL queries, strictly protected by administrator role middleware.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Protect all admin routes with authentication and role check
router.use(isAuthenticated, isAdmin);

/**
 * READ: GET /api/admin/movies
 * List all movies for the administrative control panel
 */
router.get('/movies', async (req, res) => {
    try {
        const [movies] = await db.query(
            'SELECT * FROM movies ORDER BY movie_id ASC'
        );
        return res.json({ success: true, movies });
    } catch (err) {
        console.error('[Admin Get Movies Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
    }
});

/**
 * CREATE: POST /api/admin/movies
 * Add a new movie into the catalog
 */
router.post('/movies', async (req, res) => {
    try {
        const { title, description, genre, duration, price, poster } = req.body;

        if (!title || !genre || !duration || !price) {
            return res.status(400).json({
                success: false,
                message: 'Title, genre, duration, and price are required.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO movies (title, description, genre, duration, price, poster) VALUES (?, ?, ?, ?, ?, ?)',
            [title.trim(), description || '', genre.trim(), parseInt(duration), parseFloat(price), poster || '/images/inception.svg']
        );

        return res.status(201).json({
            success: true,
            message: 'Movie added successfully!',
            movieId: result.insertId
        });
    } catch (err) {
        console.error('[Admin Add Movie Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to add movie.' });
    }
});

/**
 * UPDATE: PUT /api/admin/movies/:id
 * Edit movie details
 */
router.put('/movies/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const { title, description, genre, duration, price, poster } = req.body;

        if (!title || !genre || !duration || !price) {
            return res.status(400).json({
                success: false,
                message: 'Title, genre, duration, and price are required.'
            });
        }

        const [result] = await db.query(
            'UPDATE movies SET title = ?, description = ?, genre = ?, duration = ?, price = ?, poster = ? WHERE movie_id = ?',
            [title.trim(), description || '', genre.trim(), parseInt(duration), parseFloat(price), poster || '/images/inception.svg', movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Movie not found.' });
        }

        return res.json({ success: true, message: 'Movie updated successfully!' });
    } catch (err) {
        console.error('[Admin Update Movie Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to update movie.' });
    }
});

/**
 * DELETE: DELETE /api/admin/movies/:id
 * Remove a movie from the catalog
 */
router.delete('/movies/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);

        const [result] = await db.query(
            'DELETE FROM movies WHERE movie_id = ?',
            [movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Movie not found.' });
        }

        return res.json({ success: true, message: 'Movie deleted successfully!' });
    } catch (err) {
        console.error('[Admin Delete Movie Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete movie.' });
    }
});

/**
 * READ: GET /api/admin/theaters
 * List all theaters for the administrative panel
 */
router.get('/theaters', async (req, res) => {
    try {
        const [theaters] = await db.query(
            'SELECT theater_id, theater_name, location, screen_name FROM theaters ORDER BY theater_id ASC'
        );
        return res.json({ success: true, theaters });
    } catch (err) {
        console.error('[Admin Get Theaters Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch theaters.' });
    }
});

/**
 * CREATE: POST /api/admin/theaters
 * Add a new cinema theater complex
 */
router.post('/theaters', async (req, res) => {
    try {
        const { theater_name, location, screen_name } = req.body;

        if (!theater_name || !location || !screen_name) {
            return res.status(400).json({
                success: false,
                message: 'Theater name, location, and screen name are required.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO theaters (theater_name, location, screen_name) VALUES (?, ?, ?)',
            [theater_name.trim(), location.trim(), screen_name.trim()]
        );

        return res.status(201).json({
            success: true,
            message: 'Theater added successfully!',
            theaterId: result.insertId
        });
    } catch (err) {
        console.error('[Admin Add Theater Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to add theater.' });
    }
});

/**
 * DELETE: DELETE /api/admin/theaters/:id
 * Remove a theater from the database
 */
router.delete('/theaters/:id', async (req, res) => {
    try {
        const theaterId = parseInt(req.params.id);

        const [result] = await db.query(
            'DELETE FROM theaters WHERE theater_id = ?',
            [theaterId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Theater not found.' });
        }

        return res.json({ success: true, message: 'Theater deleted successfully!' });
    } catch (err) {
        console.error('[Admin Delete Theater Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete theater.' });
    }
});

/**
 * READ: GET /api/admin/bookings
 * View all system bookings
 */
router.get('/bookings', async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.booking_id, b.show_date, b.show_time, b.seats, b.ticket_count, b.total_price, b.created_at,
                    m.title, t.theater_name, t.screen_name, u.name AS user_name, u.email AS user_email
             FROM bookings b
             JOIN movies m ON b.movie_id = m.movie_id
             LEFT JOIN theaters t ON b.theater_id = t.theater_id
             JOIN users u ON b.user_id = u.user_id
             ORDER BY b.booking_id DESC`
        );
        return res.json({ success: true, bookings });
    } catch (err) {
        console.error('[Admin Get Bookings Error]:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
    }
});

module.exports = router;
