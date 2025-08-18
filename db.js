const mysql = require('mysql2');
require('dotenv').config();

// Change createConnection to createPool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// You don't need the db.connect() part with a pool
console.log('✅ Connected to MySQL database pool');

module.exports = db;