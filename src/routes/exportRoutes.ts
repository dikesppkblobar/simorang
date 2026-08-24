import { Router } from 'express';
import { exportPegawaiData } from '../controllers/exportController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/pegawai', exportPegawaiData);

export default router;
