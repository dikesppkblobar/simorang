import { Router } from 'express';
import { getAllSk, getSkHistoryByPegawai, uploadAndCreateSk, deleteSk } from '../controllers/arsipController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', getAllSk);
router.get('/pegawai/:nip', getSkHistoryByPegawai);
router.post('/sk', uploadAndCreateSk);
router.delete('/sk/:id', deleteSk);

export default router;

