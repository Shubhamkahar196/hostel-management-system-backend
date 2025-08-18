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

// Get all students
router.get('/', verifyToken, async (req, res) => {
    try {
        const [students] = await db.promise().query('SELECT id, name, roll_no, department, year, room_no FROM students ORDER BY name');
        res.status(200).json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a student's details
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch the existing student from the database
        const [existingStudentRows] = await db.promise().query('SELECT * FROM students WHERE id = ?', [id]);
        if (existingStudentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 2. Create an updated student object
        // It takes the original student's data and overwrites it with any new data from the request body.
        const updatedStudent = {
            ...existingStudentRows[0], // The original data
            ...req.body              // The new data to update
        };

        // Destructure all fields from the final merged object
        const { name, email, phone, address, guardian_name, guardian_phone, room_no } = updatedStudent;

        // 3. Update the student record in the database using the merged data
        await db.promise().query(
            `UPDATE students SET 
                name = ?, email = ?, phone = ?, address = ?, 
                guardian_name = ?, guardian_phone = ?, room_no = ? 
            WHERE id = ?`,
            [name, email, phone, address, guardian_name, guardian_phone, room_no, id]
        );

        res.status(200).json({ message: 'Student details updated successfully' });

    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete a student
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the student exists before deleting
        const [student] = await db.promise().query('SELECT * FROM students WHERE id = ?', [id]);
        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete the student record
        await db.promise().query('DELETE FROM students WHERE id = ?', [id]);

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;