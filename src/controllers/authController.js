import { Admin } from '../models/Admin.js';
import { generateToken } from '../middleware/auth.js';
import appendMonitorLog from '../utils/monitor.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const admin = await Admin.findByUsername(username);
    if (!admin) {
      appendMonitorLog(`Failed login for unknown user ${username} from ${req.ip}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await Admin.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      appendMonitorLog(`Failed login for user ${username} from ${req.ip}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(admin.id);
    res.json({ message: 'Login exitoso', token, admin: { id: admin.id, username: admin.username, email: admin.email } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Si entraste por modo emergencia y el ID 1 no existe en DB, 
    // devolvemos un perfil genérico para no romper el frontend
    const admin = await Admin.findById(req.adminId);
    
    if (!admin) {
      return res.json({ 
        id: req.adminId, 
        username: 'admin', 
        email: 'admin@ilb.edu.mx' 
      });
    }

    res.json(admin);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const existingAdmin = await Admin.findByUsername(username);
    if (existingAdmin) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    const id = await Admin.create(username, password, email);
    const token = generateToken(id);

    res.status(201).json({
      message: 'Admin creado exitosamente',
      token,
      admin: { id, username, email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};