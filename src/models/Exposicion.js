import { pool } from '../config/database.js';

export class Exposicion {
  static async create(grupo_id, data) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        `INSERT INTO exposiciones (
          grupo_id, nombre_equipo, lider, profesor, materia, integrantes, num_proyectores, 
          tiempo_minutos, presentacion_path, presentacion_original_name, 
          db_files, archivos_programas, recursos_ti, estructura_directorios_path, estructura_directorios_original_name,
          env_file_path, env_file_original_name, tipo_exposicion, orden, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          grupo_id,
          data.nombre_equipo,
          data.lider,
          data.profesor,
          data.materia,
          JSON.stringify(data.integrantes || []),
          data.num_proyectores || 1,
          data.tiempo_minutos || 20,
          data.presentacion_path || null,
          data.presentacion_original_name || null,
          JSON.stringify(data.db_files || []),
          JSON.stringify(data.archivos_programas || []),
          data.recursos_ti || null,
          data.estructura_directorios_path || null,
          data.estructura_directorios_original_name || null,
          data.env_file_path || null,
          data.env_file_original_name || null,
          data.tipo_exposicion || 'Práctica',
          data.orden ?? 0,
        ]
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  static async findAll() {
    const conn = await pool.getConnection();
    try {
      const query = 'SELECT * FROM exposiciones ORDER BY orden ASC, created_at ASC';
      const [rows] = await conn.query(query);
      return rows;
    } catch (error) {
      console.error("Error en el Modelo:", error);
      return [];
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT e.*, g.nombre as grupo_nombre 
         FROM exposiciones e 
         LEFT JOIN grupos g ON e.grupo_id = g.id 
         WHERE e.id = ?`,
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async update(id, data) {
    const conn = await pool.getConnection();
    try {
      const updates = [];
      const values = [];

      if (data.nombre_equipo) { updates.push('nombre_equipo = ?'); values.push(data.nombre_equipo); }
      if (data.lider) { updates.push('lider = ?'); values.push(data.lider); }
      if (data.estado) { updates.push('estado = ?'); values.push(data.estado); }
      if (data.num_proyectores) { updates.push('num_proyectores = ?'); values.push(data.num_proyectores); }
      if (data.tiempo_minutos) { updates.push('tiempo_minutos = ?'); values.push(data.tiempo_minutos); }
      if (data.integrantes) { 
        updates.push('integrantes = ?'); 
        values.push(JSON.stringify(data.integrantes)); 
      }
      if (data.profesor) { updates.push('profesor = ?'); values.push(data.profesor); }
      if (data.materia) { updates.push('materia = ?'); values.push(data.materia); }
      if (data.presentacion_path) {
        updates.push('presentacion_path = ?');
        values.push(data.presentacion_path);
        updates.push('presentacion_original_name = ?');
        values.push(data.presentacion_original_name);
      }
      if (data.db_files) {
        updates.push('db_files = ?');
        values.push(JSON.stringify(data.db_files));
      }
      if (data.archivos_programas) {
        updates.push('archivos_programas = ?');
        values.push(JSON.stringify(data.archivos_programas));
      }
      if (data.recursos_ti !== undefined) {
        updates.push('recursos_ti = ?');
        values.push(data.recursos_ti);
      }
      if (data.estructura_directorios_path) {
        updates.push('estructura_directorios_path = ?');
        values.push(data.estructura_directorios_path);
        updates.push('estructura_directorios_original_name = ?');
        values.push(data.estructura_directorios_original_name);
      }
      if (data.env_file_path) {
        updates.push('env_file_path = ?');
        values.push(data.env_file_path);
        updates.push('env_file_original_name = ?');
        values.push(data.env_file_original_name);
      }
      if (data.tipo_exposicion) { updates.push('tipo_exposicion = ?'); values.push(data.tipo_exposicion); }
      if (data.orden !== undefined && data.orden !== null) { updates.push('orden = ?'); values.push(data.orden); }

      if (updates.length === 0) return;
      values.push(id);
      await conn.query(`UPDATE exposiciones SET ${updates.join(', ')} WHERE id = ?`, values);
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM exposiciones WHERE id = ?', [id]);
    } finally {
      conn.release();
    }
  }
}