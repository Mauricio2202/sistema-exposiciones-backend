import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Intentando login para usuario: ${username}`);

    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.log('Usuario no encontrado en la base de datos');
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];
        const isMatch = (password === user.password) || await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('¡Login exitoso!');
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secreto', { expiresIn: '24h' });
            return res.json({ token, message: 'Login exitoso' });
        } else {
            console.log('Fallo de contraseña: La contraseña enviada no coincide');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno' });
    }
};

export const register = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO admin (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email || null]);
        return res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email FROM admin WHERE id = ?', [req.adminId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        return res.status(500).json({ message: 'Error interno' });
    }
};