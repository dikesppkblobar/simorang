import { Router } from 'express';
import {
  getSupabaseStatus,
  syncSupabaseNow,
  getSupabaseSchemaSql,
} from '../controllers/supabaseController';

const router = Router();

router.get('/status', getSupabaseStatus);
router.get('/schema', getSupabaseSchemaSql);
router.post('/sync', syncSupabaseNow);

export default router;
