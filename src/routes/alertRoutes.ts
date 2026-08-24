import { Router } from 'express';
import {
  getKgbAlerts,
  getPangkatAlerts,
  getPensiunAlerts,
  getKp4AnakAlerts,
  getAlertSummary,
} from '../controllers/alertController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/kgb', getKgbAlerts);
router.get('/pangkat', getPangkatAlerts);
router.get('/pensiun', getPensiunAlerts);
router.get('/kp4-anak', getKp4AnakAlerts);
router.get('/summary', getAlertSummary);

export default router;
