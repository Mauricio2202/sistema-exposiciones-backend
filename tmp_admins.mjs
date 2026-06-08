import { pool } from './src/config/database.js';
(async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, username, email, created_at FROM admin');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    conn.release();
  }
})();
