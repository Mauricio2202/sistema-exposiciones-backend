import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import exposicionRoutes from './src/routes/exposiciones.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

const rateLimitMap = new Map();
function rateLimiter(req, res, next) {
  const key = req.ip || req.connection.remoteAddress || 'global';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 300;
  const entry = rateLimitMap.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(key, entry);
  if (entry.count > max) return res.status(429).json({ message: 'Demasiadas solicitudes, inténtelo más tarde' });
  next();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(rateLimiter);
app.disable('x-powered-by');

function sanitizeInputs(req, res, next) {
  const suspicious = [/\bDROP\b/i, /\bTRUNCATE\b/i, /\bALTER\b/i, /\bDELETE\b/i, /\bINSERT\b/i, /;\s*--/];
  const checkValue = (val) => {
    if (!val || typeof val !== 'string') return false;
    for (const re of suspicious) if (re.test(val)) return true;
    return false;
  };
  for (const key of Object.keys(req.body || {})) {
    if (String(key).toLowerCase().includes('password')) continue;
    const v = req.body[key];
    if (Array.isArray(v)) {
      for (const item of v) if (checkValue(item)) return res.status(400).json({ message: 'Entrada inválida' });
    } else if (checkValue(v)) return res.status(400).json({ message: 'Entrada inválida' });
  }
  next();
}
app.use(sanitizeInputs);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/exposiciones', exposicionRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
