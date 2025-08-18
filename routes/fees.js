// routes/fees.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Record a new fee payment
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { student_id, amount_paid, payment_date, remarks } = req.body;

        if (!student_id || !amount_paid || !payment_date) {
            return res.status(400).json({ message: 'Student ID, amount, and payment date are required' });
        }

        // Check if the student exists
        const [student] = await db.promise().query('SELECT id FROM students WHERE id = ?', [student_id]);
        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await db.promise().query(
            'INSERT INTO fees (student_id, amount_paid, payment_date, remarks) VALUES (?, ?, ?, ?)',
            [student_id, amount_paid, payment_date, remarks]
        );

        res.status(201).json({ message: 'Fee payment recorded successfully' });

    } catch (err) {
        console.error('Error recording fee payment:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get payment history for a specific student
router.get('/student/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [payments] = await db.promise().query(
            'SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date DESC',
            [id]
        );

        if (payments.length === 0) {
            return res.status(200).json([]); // Return empty array if no payments found
        }

        res.status(200).json(payments);

    } catch (err) {
        console.error('Error fetching fee history:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;