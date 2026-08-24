import { Router } from 'express';
import {
  loginAdmin,
  getMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../controllers/authController';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.post('/login', loginAdmin);
router.get('/me', requireAdmin, getMe);

// User Accounts Endpoints
router.get('/users', requireAdmin, getAllUsers);
router.post('/users', requireAdmin, createUser);
router.put('/users/:id', requireAdmin, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);

// Unit Kerja Endpoints
router.get('/units', requireAdmin, getAllUnits);
router.post('/units', requireAdmin, createUnit);
router.put('/units/:id', requireAdmin, updateUnit);
router.delete('/units/:id', requireAdmin, deleteUnit);

export default router;

