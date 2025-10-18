// routes/outpasses.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET: Admin gets a list of all out pass requests
router.get('/', verifyToken, async (req, res) => {
    try {
        const [requests] = await db.promise().query(
            `SELECT o.id, o.reason, o.departure_time, o.expected_return_time, o.status, o.created_at,
             s.name as student_name, s.roll_no, s.room_no
             FROM outpasses o
             JOIN students s ON o.student_id = s.id
             ORDER BY o.created_at DESC`
        );
        res.status(200).json(requests);
    } catch (err) {
        console.error('Error fetching out pass requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT: Admin updates the status of an out pass request
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'A valid status (Approved/Rejected) is required.' });
        }

        await db.promise().query('UPDATE outpasses SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Out pass status updated successfully.' });
    } catch (err) {
        console.error('Error updating out pass status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
