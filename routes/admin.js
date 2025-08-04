const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const [rows] = await db.promise().query('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = rows[0];

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res
            .cookie("token", token, {
                httpOnly: true,
                secure: false,        // Set to true in production with HTTPS
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                message: 'Login successful',
                admin: {
                    id: admin.id,
                    name: admin.name,
                    username: admin.username,
                    email: admin.email,
                }
            });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
