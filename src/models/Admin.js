import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class Admin {
  static async create(username, password, email) {
    const conn = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await conn.query(
        'INSERT INTO admin (username, password, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email]
      );
      
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  static async findByUsername(username) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT * FROM admin WHERE username = ?',
        [username]
      );
      
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT id, username, email, created_at FROM admin WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
