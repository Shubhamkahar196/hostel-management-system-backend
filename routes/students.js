// routes/students.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken'); // your JWT middleware

// Add a new student
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year } = req.body;

        // Check required fields
        if (!name || !roll_no || !email || !gender || !dob || !address || !guardian_name || !guardian_phone || !department || !year) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Roll number pattern: 3 digits + (cs|ad|me|ec) + 4 digits
        const rollPattern = /^\d{3}(cs|ad|me|ec)\d{4}$/;
        if (!rollPattern.test(roll_no)) {
            return res.status(400).json({ message: 'Invalid roll number format' });
        }

        // Check if roll_no already exists
        const [existing] = await db.promise().query('SELECT * FROM students WHERE roll_no = ?', [roll_no]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Roll number already exists' });
        }

        // Insert student
        await db.promise().query(
            `INSERT INTO students (name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year]
        );

        res.status(201).json({ message: 'Student added successfully' });

    } catch (err) {
        console.error('Error adding student:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
