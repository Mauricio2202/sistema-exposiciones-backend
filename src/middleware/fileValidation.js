import fs from 'fs';
import path from 'path';
import appendMonitorLog from '../utils/monitor.js';

function deleteFiles(files) {
  Object.values(files || {}).flat().forEach((file) => {
    try { if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
  });
}

export function validateUploadedFiles(req, res, next) {
  let files = req.files || {};
  // If multer used upload.any(), req.files is an array — convert to object keyed by fieldname
  if (Array.isArray(files)) {
    const obj = {};
    files.forEach((f) => {
      if (!obj[f.fieldname]) obj[f.fieldname] = [];
      obj[f.fieldname].push(f);
    });
    files = obj;
    // replace req.files so downstream middlewares/controllers see normalized object
    req.files = files;
  }

  const allowedPresentation = ['.pdf', '.ppt', '.pptx'];
  const allowedDatabaseFiles = ['.sql', '.db', '.sqlite', '.json', '.zip'];

    const presentacion = files.presentacion && files.presentacion[0];
    const programas = files.programas || [];
    const dbFiles = [
      ...(files.db_files || []),
      ...(files.db_file || []),
      ...(files.dbFile || []),
    ];
    const estructuraImagen = (files.estructura_directorios && files.estructura_directorios[0]) || (files.estructura_directorios_image && files.estructura_directorios_image[0]);
    const envFile = (files.env_file && files.env_file[0]) || (files.envFile && files.envFile[0]);

  const databaseTypeValues = req.body.database_type || req.body['database_type[]'];
  const hasDbTypes = Array.isArray(databaseTypeValues)
    ? databaseTypeValues.filter(Boolean).length > 0
    : Boolean(databaseTypeValues);

  if (dbFiles.length > 0 && !hasDbTypes) {
    deleteFiles(files);
    appendMonitorLog(`Upload rejected: missing database type from ${req.ip} ${req.originalUrl}`);
    return res.status(400).json({ message: 'Debe indicar el tipo de base de datos para la subida' });
  }
  if (presentacion) {
    const ext = path.extname(presentacion.originalname || '').toLowerCase();
    if (!allowedPresentation.includes(ext)) {
      deleteFiles(files);
      appendMonitorLog(`Upload rejected: invalid presentation type ${ext} from ${req.ip}`);
      return res.status(400).json({ message: 'Tipo de presentación no permitido' });
    }
  }

  for (const file of programas) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (ext === '.sql') {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        if (!/create|insert|alter|--|;/i.test(content)) {
          deleteFiles(files);
          appendMonitorLog(`Upload rejected: suspicious sql content from ${req.ip}`);
          return res.status(400).json({ message: 'Archivo SQL inválido o vacío' });
        }
      } catch (e) {
        deleteFiles(files);
        appendMonitorLog(`Upload rejected: cannot read sql from ${req.ip}`);
        return res.status(400).json({ message: 'Error leyendo archivo SQL' });
      }
    }
  }

  for (const file of dbFiles) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowedDatabaseFiles.includes(ext)) {
      deleteFiles(files);
      appendMonitorLog(`Upload rejected: invalid database file type ${ext} from ${req.ip}`);
      return res.status(400).json({ message: 'Tipo de archivo de base de datos no permitido' });
    }
  }

  if (estructuraImagen) {
    const ext = path.extname(estructuraImagen.originalname || '').toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      deleteFiles(files);
      appendMonitorLog(`Upload rejected: invalid directory image type ${ext} from ${req.ip}`);
      return res.status(400).json({ message: 'Tipo de archivo de estructura de directorios no permitido' });
    }
  }

  if (envFile) {
    const ext = path.extname(envFile.originalname || '').toLowerCase();
    if (ext !== '.txt') {
      deleteFiles(files);
      appendMonitorLog(`Upload rejected: invalid env file type ${ext} from ${req.ip}`);
      return res.status(400).json({ message: 'El archivo de variables de entorno debe ser .txt' });
    }
  }

  next();
}

export default validateUploadedFiles;
