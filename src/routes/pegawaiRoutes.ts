import { Router } from 'express';
import {
  getAllPegawai,
  getPegawaiDetail,
  createPegawai,
  updatePegawai,
  softDeletePegawai,
  deletePegawaiPermanent,
  restorePegawai,
} from '../controllers/pegawaiController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', getAllPegawai);
router.get('/:nip', getPegawaiDetail);
router.post('/', createPegawai);
router.put('/:nip', updatePegawai);
router.delete('/:nip', softDeletePegawai);
router.delete('/:nip/permanent', deletePegawaiPermanent);
router.patch('/:nip/restore', restorePegawai);

export default router;
