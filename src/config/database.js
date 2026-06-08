import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initializeDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS grupos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        grado INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS exposiciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        grupo_id INT NOT NULL,
        nombre_equipo VARCHAR(100) NOT NULL,
        lider VARCHAR(100) NOT NULL,
        profesor VARCHAR(100) NOT NULL,
        materia VARCHAR(100) NOT NULL,
        tipo_exposicion VARCHAR(20) NOT NULL DEFAULT 'Práctica',
        integrantes JSON,
        num_proyectores INT,
        tiempo_minutos INT DEFAULT 20,
        presentacion_path VARCHAR(255),
        presentacion_original_name VARCHAR(255),
        db_files JSON,
        archivos_programas JSON,
        recursos_ti TEXT,
        estructura_directorios_path VARCHAR(255),
        estructura_directorios_original_name VARCHAR(255),
        env_file_path VARCHAR(255),
        env_file_original_name VARCHAR(255),
        orden INT DEFAULT 0,
        estado ENUM('pendiente', 'completada', 'en_revision') DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS archivos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        exposicion_id INT NOT NULL,
        nombre_original VARCHAR(255) NOT NULL,
        ruta_archivo VARCHAR(255) NOT NULL,
        tipo_archivo VARCHAR(50),
        tamano INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exposicion_id) REFERENCES exposiciones(id) ON DELETE CASCADE
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  } finally {
    conn.release();
  }
}