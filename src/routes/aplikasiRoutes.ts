import { Router } from 'express';
import {
  getAllAplikasi,
  getAplikasiById,
  createAplikasi,
  updateAplikasi,
  deleteAplikasi,
} from '../controllers/aplikasiController';

const router = Router();

router.get('/', getAllAplikasi);
router.get('/:id', getAplikasiById);
router.post('/', createAplikasi);
router.put('/:id', updateAplikasi);
router.delete('/:id', deleteAplikasi);

export default router;
