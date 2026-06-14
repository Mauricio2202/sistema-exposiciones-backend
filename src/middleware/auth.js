import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import appendMonitorLog from '../utils/monitor.js';

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    appendMonitorLog(`Unauthorized access attempt: missing token from ${req.ip} ${req.originalUrl}`);
    return res.status(401).json({ message: 'Acceso no autorizado. Esta actividad está siendo monitoreada.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    appendMonitorLog(`Unauthorized access attempt: invalid token from ${req.ip} ${req.originalUrl}`);
    return res.status(403).json({ message: 'Acceso no autorizado. Esta actividad está siendo monitoreada.' });
  }
};

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
