import { pool } from '../src/config/database.js';

const username = 'danaeromero';
const password = 'dana290'; // Contraseña en texto plano

(async () => {
  try {
    const conn = await pool.getConnection();
    // ACTUALIZA el usuario existente con la contraseña en texto plano
    await conn.query('UPDATE admin SET password = ? WHERE username = ?', [password, username]);
    console.log('Usuario actualizado exitosamente con contraseña plana');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();