import { pool } from '../src/config/database.js';

(async () => {
  try {
    const conn = await pool.getConnection();
    const [[dbRow]] = await conn.query('SELECT DATABASE() AS db');
    const [[userRow]] = await conn.query('SELECT USER() AS user');
    const [rows] = await conn.query('SELECT id, username, email, created_at FROM admin');
    console.log('Connection info as seen by backend:');
    console.log({ database: dbRow.db, user: userRow.user });
    console.log('Admins in DB (as seen by backend):');
    console.log(JSON.stringify(rows, null, 2));
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error querying admin table:', err);
    process.exit(1);
  }
})();
