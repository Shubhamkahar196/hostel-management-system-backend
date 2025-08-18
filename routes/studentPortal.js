// routes/studentPortal.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET: A logged-in student's own profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // The student's ID is available from the token
        const studentId = req.user.id;

        const [rows] = await db.promise().query(
            // Select all columns EXCEPT the password
            'SELECT id, name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year FROM students WHERE id = ?',
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.status(200).json(rows[0]);

    } catch (err) {
        console.error('Error fetching student profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: A logged-in student's own fee payment history
router.get('/fees', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;

        const [payments] = await db.promise().query(
            'SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date DESC',
            [studentId]
        );

        res.status(200).json(payments);

    } catch (err) {
        console.error('Error fetching student fee history:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/complaint', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Complaint description is required' });
        }

        await db.promise().query(
            'INSERT INTO complaints (student_id, description) VALUES (?, ?)',
            [studentId, description]
        );

        res.status(201).json({ message: 'Complaint submitted successfully' });

    } catch (err) {
        console.error('Error submitting complaint:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/complaint', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;

        const [complaints] = await db.promise().query(
            'SELECT id, description, status, created_at FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
            [studentId]
        );

        res.status(200).json(complaints);

    } catch (err) {
        console.error('Error fetching student complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;