import { Router } from 'express';
import authRoutes from './authRoutes';
import pegawaiRoutes from './pegawaiRoutes';
import kp4Routes from './kp4Routes';
import alertRoutes from './alertRoutes';
import arsipRoutes from './arsipRoutes';
import exportRoutes from './exportRoutes';
import auditLogRoutes from './auditLogRoutes';
import statsRoutes from './statsRoutes';
import supabaseRoutes from './supabaseRoutes';
import aplikasiRoutes from './aplikasiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pegawai', pegawaiRoutes);
router.use('/kp4', kp4Routes);
router.use('/alerts', alertRoutes);
router.use('/arsip', arsipRoutes);
router.use('/export', exportRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/stats', statsRoutes);
router.use('/supabase', supabaseRoutes);
router.use('/aplikasi', aplikasiRoutes);

export default router;
