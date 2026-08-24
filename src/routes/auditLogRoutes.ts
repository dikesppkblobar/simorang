import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(requireAdmin);

router.get('/', getAuditLogs);

export default router;
