// routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Add a new room
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { room_number, capacity } = req.body;

        if (!room_number || !capacity) {
            return res.status(400).json({ message: 'Room number and capacity are required' });
        }

        // Check if room number already exists
        const [existing] = await db.promise().query('SELECT * FROM rooms WHERE room_number = ?', [room_number]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Room number already exists' });
        }

        await db.promise().query(
            'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)',
            [room_number, capacity]
        );

        res.status(201).json({ message: 'Room added successfully' });

    } catch (err) {
        console.error('Error adding room:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all rooms
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rooms] = await db.promise().query('SELECT * FROM rooms ORDER BY room_number');
        res.status(200).json(rooms);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;