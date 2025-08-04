const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

router.post('/students', verifyToken, async (req, res) => {
    const { name, rollNumber, department, roomNumber } = req.body;

    if (!name || !rollNumber || !department || !roomNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existing] = await db.promise().query(
            'SELECT * FROM students WHERE rollNumber = ?',
            [rollNumber]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Student already exists' });
        }

        await db.promise().query(
            'INSERT INTO students (name, rollNumber, department, roomNumber) VALUES (?, ?, ?, ?)',
            [name, rollNumber, department, roomNumber]
        );

        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        console.error('Error adding student:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
