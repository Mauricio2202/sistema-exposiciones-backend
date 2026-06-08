import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const username = 'danaeromero';
const password = 'dana290';
const email = 'danaeromero@example.com';

(async () => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
    const [existing] = await conn.query('SELECT id FROM admin WHERE username = ?', [username]);
    if (existing.length) {
      console.log('User already exists:', existing[0]);
      conn.release();
      process.exit(0);
    }
    const [result] = await conn.query('INSERT INTO admin (username, password, email) VALUES (?, ?, ?)', [username, hashed, email]);
    console.log('Inserted admin id:', result.insertId);
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();
