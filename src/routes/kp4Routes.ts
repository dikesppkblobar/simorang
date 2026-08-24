import { Router } from 'express';
import {
  getAllKeluarga,
  getKeluargaByPegawai,
  addAnggotaKeluarga,
  updateTanggunganStatus,
  deleteAnggotaKeluarga,
} from '../controllers/kp4Controller';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', getAllKeluarga);
router.get('/pegawai/:nip', getKeluargaByPegawai);
router.post('/', addAnggotaKeluarga);
router.put('/:id', updateTanggunganStatus);
router.delete('/:id', deleteAnggotaKeluarga);

export default router;

