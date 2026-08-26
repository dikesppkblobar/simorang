import { Router } from 'express';
import { dbStore } from '../services/dbStore';

const router = Router();

router.get('/', (req, res) => {
  try {
    const config = dbStore.getFeatureConfig();
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const { updates, admin_role } = req.body;
    const config = dbStore.updateFeatureConfig(updates || {}, admin_role);
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

router.post('/reset', (req, res) => {
  try {
    const { admin_role } = req.body;
    const config = dbStore.resetFeatureConfig(admin_role);
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

export default router;
