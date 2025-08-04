const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'admin123'; // your actual admin password
    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed);
}

hashPassword();
