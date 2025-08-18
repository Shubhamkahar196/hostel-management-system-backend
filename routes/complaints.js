// routes/complaints.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET: Admin gets a list of all complaints
router.get('/', verifyToken, async (req, res) => {
    try {
        const [complaints] = await db.promise().query(
            `SELECT c.id, c.description, c.status, c.created_at, s.name as student_name, s.roll_no, s.room_no 
             FROM complaints c 
             JOIN students s ON c.student_id = s.id 
             ORDER BY c.created_at DESC`
        );
        res.status(200).json(complaints);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT: Admin updates the status of a complaint
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'A valid status is required' });
        }

        await db.promise().query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Complaint status updated successfully' });
    } catch (err) {
        console.error('Error updating complaint status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;