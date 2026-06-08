import { pool } from './src/config/database.js';
import bcrypt from 'bcryptjs';
(async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT username, password FROM admin WHERE username = 'moisesaaron'");
    console.log(JSON.stringify(rows, null, 2));
    if (rows[0]) {
      const match = await bcrypt.compare('moises291', rows[0].password);
      console.log('match', match);
    }
  } catch (e) {
    console.error(e);
  } finally {
    conn.release();
  }
})();
