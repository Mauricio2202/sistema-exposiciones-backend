import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import { checkDeadline } from '../middleware/deadline.js';
import {
  createExposicion,
  getAllExposiciones,
  getExposicion,
  updateExposicion,
  deleteExposicion,
  streamFile,
  downloadAllCodeFiles
} from '../controllers/exposicionController.js';
import { validateUploadedFiles } from '../middleware/fileValidation.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Rutas públicas (para estudiantes)
router.post('/crear', checkDeadline, upload.any(), validateUploadedFiles, createExposicion);

// Rutas protegidas (admin)
router.get('/todas', verifyToken, getAllExposiciones);
router.get('/:id', verifyToken, getExposicion);
router.put('/:id', verifyToken, checkDeadline, upload.any(), validateUploadedFiles, updateExposicion);
router.delete('/:id', verifyToken, deleteExposicion);
router.get('/:id/codigo/zip', verifyToken, downloadAllCodeFiles);
router.get('/:id/stream', verifyToken, streamFile);

export default router;
