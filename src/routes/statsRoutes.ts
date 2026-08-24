import { Router } from 'express';
import { getDashboardStats, clearDummyData, resetSampleData } from '../controllers/statsController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', getDashboardStats);
router.post('/clear-dummy', clearDummyData);
router.post('/reset-sample', resetSampleData);

export default router;

