// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken'); // We'll use this to protect the change-password route

// Student Login
router.post('/student/login', async (req, res) => {
    const { roll_no, password } = req.body;
    if (!roll_no || !password) {
        return res.status(400).json({ message: 'Roll number and password are required' });
    }

    try {
        const [rows] = await db.promise().query('SELECT * FROM students WHERE roll_no = ?', [roll_no]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const student = rows[0];
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: student.id, roll_no: student.roll_no, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Correct: Dynamic secure flag
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
      })
      .status(200).json({ message: 'Login successful' });

        // res.cookie("token", token, { httpOnly: true }).status(200).json({ message: 'Login successful' });

    } catch (err) {
        console.error('Student Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Change Password (Protected Route)
router.post('/student/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const studentId = req.user.id; // Get student ID from the verified token

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    try {
        const [rows] = await db.promise().query('SELECT password FROM students WHERE id = ?', [studentId]);
        const student = rows[0];

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await db.promise().query('UPDATE students SET password = ? WHERE id = ?', [hashedNewPassword, studentId]);

        res.status(200).json({ message: 'Password changed successfully' });

    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
