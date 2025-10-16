// routes/announcements.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// POST: Admin creates a new announcement
router.post('/add', verifyToken, async (req, res) => {
    try {
        // We can add a check here to ensure only an admin can post
        // For now, we'll assume the frontend calls this for admins only.
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        await db.promise().query(
            'INSERT INTO announcements (title, content) VALUES (?, ?)',
            [title, content]
        );

        res.status(201).json({ message: 'Announcement created successfully' });

    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Any logged-in user (student or admin) can view announcements
router.get('/', verifyToken, async (req, res) => {
    try {
        const [announcements] = await db.promise().query(
            'SELECT * FROM announcements ORDER BY created_at DESC'
        );
        res.status(200).json(announcements);
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
