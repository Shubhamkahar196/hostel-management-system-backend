// routes/students.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken'); // your JWT middleware
const bcrypt = require('bcrypt');


// Add a new student (UPDATED WITH TRANSACTION LOGIC)
router.post('/add', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year } = req.body;

        // --- Start of Transaction ---
        await connection.beginTransaction();

        // Step 1: Hash the initial password (which is the roll_no)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(roll_no, salt);

        // Room availability checks (as you had before)
        const [rooms] = await connection.query('SELECT * FROM rooms WHERE room_number = ?', [room_no]);
        if (rooms.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Room not found' });
        }
        const room = rooms[0];
        if (room.current_occupancy >= room.capacity) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: 'Room is already full' });
        }

        // Step 2: Insert the new student with the corrected SQL
        // The placeholders have been replaced with the actual column names and variables
        await connection.query(
            `INSERT INTO students 
                (name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year, password)
             VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year, hashedPassword]
        );

        // Step 3: Update the room's occupancy
        await connection.query(
            'UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?',
            [room.id]
        );

        await connection.commit();
        // --- End of Transaction ---

        res.status(201).json({ message: 'Student added successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error adding student with transaction:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
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

// routes/students.js

// ... (your other routes)

// Update a student's details (UPDATED WITH TRANSACTION LOGIC)
router.put('/update/:id', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { id } = req.params;
        const { room_no: new_room_no, ...studentDetails } = req.body;

        await connection.beginTransaction();

        // 1. Get the student's current (old) room number
        const [students] = await connection.query('SELECT room_no FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }
        const old_room_no = students[0].room_no;

        // 2. If the room is being changed, handle occupancy updates
        if (new_room_no && old_room_no !== new_room_no) {
            // Check if the new room is available
            const [new_rooms] = await connection.query('SELECT * FROM rooms WHERE room_number = ?', [new_room_no]);
            if (new_rooms.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: 'New room not found' });
            }
            if (new_rooms[0].current_occupancy >= new_rooms[0].capacity) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({ message: 'New room is full' });
            }

            // Decrement old room's occupancy (if they had one)
            if (old_room_no) {
                await connection.query('UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE room_number = ?', [old_room_no]);
            }
            // Increment new room's occupancy
            await connection.query('UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE room_number = ?', [new_room_no]);
        }

        // 3. Update the student's details
        const finalStudentData = { ...studentDetails, room_no: new_room_no };
        await connection.query('UPDATE students SET ? WHERE id = ?', [finalStudentData, id]);

        await connection.commit();
        res.status(200).json({ message: 'Student details updated successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});


// Delete a student (UPDATED WITH TRANSACTION LOGIC)
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // 1. Find the student to get their room number before deleting
        const [students] = await connection.query('SELECT room_no FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            // No student found, but no harm done. We can just end.
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }
        const { room_no } = students[0];

        // 2. Delete the student
        await connection.query('DELETE FROM students WHERE id = ?', [id]);

        // 3. If they had a room, decrement the room's occupancy
        if (room_no) {
            await connection.query(
                'UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE room_number = ? AND current_occupancy > 0',
                [room_no]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Student deleted successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;