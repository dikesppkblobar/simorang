import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

export function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email dan password wajib diisi.' });
  }

  // Demokrasi login admin Dikes Lombok Barat
  if (email === 'admin@dikes.lombokbarat.go.id' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'jwt-simpeg-admin-token-dikes-lobar-2026',
      user: {
        email: 'admin@dikes.lombokbarat.go.id',
        nama: 'Administrator Dikes & PPKB Lombok Barat',
        role: 'Super Admin',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Kombinasi Email atau Password Admin tidak valid.',
  });
}

export function getMe(req: Request, res: Response) {
  return res.json({
    success: true,
    user: {
      email: 'admin@dikes.lombokbarat.go.id',
      nama: 'Administrator Dikes & PPKB Lombok Barat',
      role: 'Super Admin',
    },
  });
}

// User Accounts CRUD
export function getAllUsers(req: Request, res: Response) {
  try {
    const users = dbStore.getAllUsers();
    return res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createUser(req: Request, res: Response) {
  try {
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const newUser = dbStore.addUser(
      {
        id: `usr-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
      },
      adminEmail
    );
    return res.status(201).json({ success: true, data: newUser });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const updated = dbStore.updateUser(id, req.body, adminEmail);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    dbStore.deleteUser(id, adminEmail);
    return res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// Unit Kerja CRUD
export function getAllUnits(req: Request, res: Response) {
  try {
    const units = dbStore.getAllUnits();
    return res.json({ success: true, count: units.length, data: units });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createUnit(req: Request, res: Response) {
  try {
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const newUnit = dbStore.addUnit(
      {
        id: `unit-${Date.now()}`,
        ...req.body,
      },
      adminEmail
    );
    return res.status(201).json({ success: true, data: newUnit });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function updateUnit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const updated = dbStore.updateUnit(id, req.body, adminEmail);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deleteUnit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    dbStore.deleteUnit(id, adminEmail);
    return res.json({ success: true, message: 'Unit kerja berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

