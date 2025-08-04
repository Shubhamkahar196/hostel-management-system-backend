const express = require('express');
const cors = require('cors');
const db = require('./db');
const adminRoutes = require('./routes/admin');
const cookieParser = require("cookie-parser");
const studentRoutes = require('./routes/studentRoutes');





require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hostel Management API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



app.use('/admin', adminRoutes);
app.use('/api', studentRoutes);
