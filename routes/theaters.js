/**
 * CineBook - Theaters Routes
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Provides REST endpoints for fetching available cinema theaters,
 * locations, and screen specifications.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/theaters
 * Retrieve all theaters from MySQL database
 */
router.get('/', async (req, res) => {
    try {
        const [theaters] = await db.query(
            'SELECT theater_id, theater_name, location, screen_name FROM theaters ORDER BY theater_id ASC'
        );
        return res.json({
            success: true,
            count: theaters.length,
            theaters
        });
    } catch (err) {
        console.error('[Theaters List Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve theaters from database.'
        });
    }
});

/**
 * GET /api/theaters/:id
 * Retrieve specific theater details
 */
router.get('/:id', async (req, res) => {
    try {
        const theaterId = parseInt(req.params.id);
        if (isNaN(theaterId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid theater ID.'
            });
        }

        const [rows] = await db.query(
            'SELECT theater_id, theater_name, location, screen_name FROM theaters WHERE theater_id = ?',
            [theaterId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found.'
            });
        }

        return res.json({
            success: true,
            theater: rows[0]
        });
    } catch (err) {
        console.error('[Theater Details Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve theater information.'
        });
    }
});

module.exports = router;
