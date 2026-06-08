import { Exposicion } from '../models/Exposicion.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const parseIntegrantes = (integrantes) => {
  if (Array.isArray(integrantes)) return integrantes;
  try {
    return JSON.parse(integrantes || '[]');
  } catch {
    return String(integrantes || '').split(',').map((item) => item.trim()).filter(Boolean);
  }
};

const mapUploadedFiles = (files = []) =>
  files.map((file) => ({
    nombre_original: file.originalname,
    ruta_archivo: String(file.path).replace(/\\/g, '/'),
    tipo_archivo: file.mimetype,
    tamano: file.size,
  }));

const mapUploadedDbFiles = (files = [], types = []) =>
  files.map((file, index) => ({
    tipo: types[index] || null,
    nombre_original: file.originalname,
    ruta_archivo: String(file.path).replace(/\\/g, '/'),
    tipo_archivo: file.mimetype,
    tamano: file.size,
  }));

export const getAllExposiciones = async (req, res) => {
  try {
    const exposiciones = await Exposicion.findAll();
    res.json(exposiciones || []);
  } catch (error) {
    console.error('Error obteniendo exposiciones:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener los datos' });
  }
};

export const createExposicion = async (req, res) => {
  try {
    const { grupo_id, nombre_equipo, lider, profesor, materia, integrantes, num_proyectores, tiempo_minutos, tipo_exposicion, recursos_ti } = req.body;
    const databaseTypes = req.body.database_type || req.body['database_type[]'] || [];
    const dbTypesArray = Array.isArray(databaseTypes) ? databaseTypes : [databaseTypes].filter(Boolean);

    if (!grupo_id || !nombre_equipo || !lider || !profesor || !materia || !tipo_exposicion) {
      return res.status(400).json({ message: 'Datos requeridos faltantes' });
    }

    if (req.files?.db_files?.length > 0 && dbTypesArray.length !== req.files.db_files.length) {
      return res.status(400).json({ message: 'Debe indicar el tipo de base de datos para cada archivo cargado' });
    }

    const dbFilesIncoming = [ ...(req.files?.db_files || []), ...(req.files?.db_file || []), ...(req.files?.dbFile || []) ];

    const data = {
      nombre_equipo,
      lider,
      profesor,
      materia,
      tipo_exposicion,
      integrantes: parseIntegrantes(integrantes),
      num_proyectores: Number(num_proyectores || 1),
      tiempo_minutos: Number(tiempo_minutos || 20),
      recursos_ti: recursos_ti || null,
      archivos_programas: mapUploadedFiles(req.files?.programas || []),
      db_files: mapUploadedDbFiles(dbFilesIncoming, dbTypesArray),
    };

    if (req.files?.presentacion?.[0]) {
      data.presentacion_path = String(req.files.presentacion[0].path).replace(/\\/g, '/');
      data.presentacion_original_name = req.files.presentacion[0].originalname;
    }
    const estructuraFile = req.files?.estructura_directorios?.[0] || req.files?.estructura_directorios_image?.[0];
    if (estructuraFile) {
      data.estructura_directorios_path = String(estructuraFile.path).replace(/\\/g, '/');
      data.estructura_directorios_original_name = estructuraFile.originalname;
    }
    const envUploaded = req.files?.env_file?.[0] || req.files?.envFile?.[0];
    if (envUploaded) {
      data.env_file_path = String(envUploaded.path).replace(/\\/g, '/');
      data.env_file_original_name = envUploaded.originalname;
    }

    const id = await Exposicion.create(Number(grupo_id), data);
    res.status(201).json({ message: 'Exposición creada correctamente', id });
  } catch (error) {
    console.error('Error creando exposición:', error);
    res.status(500).json({ message: 'Error en el servidor al guardar' });
  }
};

export const getExposicion = async (req, res) => {
  try {
    const { id } = req.params;
    const exposicion = await Exposicion.findById(id);
    if (!exposicion) return res.status(404).json({ message: 'Exposición no encontrada' });
    res.json(exposicion);
  } catch (error) {
    console.error('Error obteniendo exposición:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateExposicion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const databaseTypes = req.body.database_type || req.body['database_type[]'] || [];
    const dbTypesArray = Array.isArray(databaseTypes) ? databaseTypes : [databaseTypes].filter(Boolean);
    const dbFilesIncoming = [ ...(req.files?.db_files || []), ...(req.files?.db_file || []), ...(req.files?.dbFile || []) ];

    if (req.files?.programas) data.archivos_programas = mapUploadedFiles(req.files.programas);
    if (req.files?.presentacion?.[0]) {
      data.presentacion_path = String(req.files.presentacion[0].path).replace(/\\/g, '/');
      data.presentacion_original_name = req.files.presentacion[0].originalname;
    }
    if (dbFilesIncoming?.length) {
      data.db_files = mapUploadedDbFiles(dbFilesIncoming, dbTypesArray);
    }
    const estructuraFileUp = req.files?.estructura_directorios?.[0] || req.files?.estructura_directorios_image?.[0];
    if (estructuraFileUp) {
      data.estructura_directorios_path = String(estructuraFileUp.path).replace(/\\/g, '/');
      data.estructura_directorios_original_name = estructuraFileUp.originalname;
    }
    const envUploadedUp = req.files?.env_file?.[0] || req.files?.envFile?.[0];
    if (envUploadedUp) {
      data.env_file_path = String(envUploadedUp.path).replace(/\\/g, '/');
      data.env_file_original_name = envUploadedUp.originalname;
    }
    await Exposicion.update(id, data);
    res.json({ message: 'Exposición actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando exposición:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar' });
  }
};

export const deleteExposicion = async (req, res) => {
  try {
    const { id } = req.params;
    const exposicion = await Exposicion.findById(id);
    if (!exposicion) return res.status(404).json({ message: 'No se encontró la exposición para eliminar' });
    if (exposicion.presentacion_path && fs.existsSync(exposicion.presentacion_path)) fs.unlinkSync(exposicion.presentacion_path);
    if (exposicion.estructura_directorios_path && fs.existsSync(exposicion.estructura_directorios_path)) fs.unlinkSync(exposicion.estructura_directorios_path);
    if (exposicion.env_file_path && fs.existsSync(exposicion.env_file_path)) fs.unlinkSync(exposicion.env_file_path);
    const programas = typeof exposicion.archivos_programas === 'string' ? JSON.parse(exposicion.archivos_programas) : (exposicion.archivos_programas || []);
    programas.forEach((archivo) => {
      if (archivo?.ruta_archivo && fs.existsSync(archivo.ruta_archivo)) fs.unlinkSync(archivo.ruta_archivo);
    });
    const dbFiles = typeof exposicion.db_files === 'string' ? JSON.parse(exposicion.db_files) : (exposicion.db_files || []);
    dbFiles.forEach((archivo) => {
      if (archivo?.ruta_archivo && fs.existsSync(archivo.ruta_archivo)) fs.unlinkSync(archivo.ruta_archivo);
    });
    await Exposicion.delete(id);
    res.json({ message: 'Exposición y archivos eliminados' });
  } catch (error) {
    console.error('Error eliminando exposición:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar' });
  }
};

export const downloadAllCodeFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const exposicion = await Exposicion.findById(id);
    if (!exposicion) return res.status(404).json({ message: 'Exposición no encontrada' });
    const programas = typeof exposicion.archivos_programas === 'string'
      ? JSON.parse(exposicion.archivos_programas)
      : (exposicion.archivos_programas || []);

    if (!programas.length) {
      return res.status(404).json({ message: 'No hay archivos de código para descargar' });
    }

    const zipName = `codigo_exposicion_${id}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Error creando ZIP:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al crear el archivo ZIP' });
      }
    });
    archive.pipe(res);

    let addedFiles = 0;
    programas.forEach((archivo) => {
      const filePath = archivo?.ruta_archivo || archivo?.ruta || archivo;
      if (filePath && fs.existsSync(filePath)) {
        const name = archivo?.nombre_original || path.basename(filePath);
        archive.file(filePath, { name });
        addedFiles += 1;
      }
    });

    if (addedFiles === 0) {
      return res.status(404).json({ message: 'No se encontraron archivos de código válidos' });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error descargando todos los archivos de código:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el servidor al generar el ZIP' });
    }
  }
};

export const streamFile = async (req, res) => {
  try {
    const { id } = req.params;
    const exposicion = await Exposicion.findById(id);
    if (!exposicion?.presentacion_path || !fs.existsSync(exposicion.presentacion_path)) return res.status(404).json({ message: 'Archivo no encontrado' });
    const extension = path.extname(exposicion.presentacion_original_name || '').toLowerCase();
    const contentTypes = { '.pdf': 'application/pdf', '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
    const file = fs.createReadStream(exposicion.presentacion_path);
    res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${exposicion.presentacion_original_name}"`);
    file.pipe(res);
  } catch (error) {
    console.error('Error en el stream de archivo:', error);
    res.status(500).json({ message: 'Error al procesar el archivo' });
  }
};