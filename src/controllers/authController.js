import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';

// 1. Función de Login
export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Intento de login para: ${username}`);

    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Comparación directa (asegúrate de que en BD la pass sea 'dana290')
        if (password === user.password) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });
            console.log('Login exitoso');
            return res.json({ token, message: 'Login exitoso' });
        } else {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// 2. Función de Registro (placeholder para que no falle)
export const register = async (req, res) => {
    res.status(501).json({ message: 'Registro no implementado' });
};

// 3. Función getProfile (ESTA ES LA QUE FALTABA Y CAUSABA EL ERROR)
export const getProfile = async (req, res) => {
    try {
        // Asumiendo que el middleware verifyToken puso el usuario en req.user
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT id, username, email FROM admin WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};