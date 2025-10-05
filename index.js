const express = require('express');
const cors = require('cors');
const db = require('./db');
const cookieParser = require("cookie-parser");

const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');
const roomRoutes = require('./routes/rooms');
const feeRoutes = require('./routes/fees');
const authRoutes = require('./routes/auth');
const studentPortalRoutes = require('./routes/studentPortal');
const complaintRoutes = require('./routes/complaints');

require('dotenv').config();

const allowedOrigins = ['http://localhost:5173']

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));


const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hostel Management API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



app.use('/admin', adminRoutes);
app.use('/students', studentRoutes);
app.use('/rooms', roomRoutes);
app.use('/fees', feeRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentPortalRoutes);
app.use('/complaints', complaintRoutes);
