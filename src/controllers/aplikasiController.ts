import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

export function getAllAplikasi(req: Request, res: Response) {
  try {
    const list = dbStore.getAllAplikasi();
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getAplikasiById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = dbStore.getAplikasiById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Aplikasi tidak ditemukan' });
    }
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createAplikasi(req: Request, res: Response) {
  try {
    const { nama_aplikasi, kategori, url_aplikasi, deskripsi, username, password, custom_logo_url, unit_kerja, status, admin_email } = req.body;

    if (!nama_aplikasi || !url_aplikasi) {
      return res.status(400).json({
        success: false,
        error: 'Nama Aplikasi dan URL Link Aplikasi wajib diisi.',
      });
    }

    const email = admin_email || (req as any).user?.email || 'admin.dikes@lombokbaratkab.go.id';
    const created = dbStore.addAplikasi(
      {
        nama_aplikasi: nama_aplikasi.trim(),
        kategori: kategori || 'Nasional (BKN / Kemenkes)',
        url_aplikasi: url_aplikasi.trim(),
        deskripsi: deskripsi || '',
        username: username || '',
        password: password || '',
        custom_logo_url: custom_logo_url || '',
        unit_kerja: unit_kerja || 'Semua Unit',
        status: status || 'Aktif',
      },
      email
    );

    return res.status(201).json({
      success: true,
      message: `Aplikasi ${created.nama_aplikasi} berhasil ditambahkan ke direktori.`,
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function updateAplikasi(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { admin_email, ...updates } = req.body;
    const email = admin_email || (req as any).user?.email || 'admin.dikes@lombokbaratkab.go.id';

    const updated = dbStore.updateAplikasi(id, updates, email);
    return res.json({
      success: true,
      message: `Aplikasi ${updated.nama_aplikasi} berhasil diperbarui.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deleteAplikasi(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { admin_email } = req.body;
    const email = admin_email || (req as any).user?.email || 'admin.dikes@lombokbaratkab.go.id';

    dbStore.deleteAplikasi(id, email);
    return res.json({
      success: true,
      message: 'Aplikasi kepegawaian berhasil dihapus dari direktori.',
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
