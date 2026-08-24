import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { KeluargaKP4 } from '../types';

export function getAllKeluarga(req: Request, res: Response) {
  try {
    const list = dbStore.getAllKeluarga();
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getKeluargaByPegawai(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const list = dbStore.getKeluargaByNip(nip);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function addAnggotaKeluarga(req: Request, res: Response) {
  try {
    const {
      nip_pegawai,
      nama_keluarga,
      status_hubungan,
      tanggal_lahir,
      nama_sekolah_pt,
      surat_ket_kuliah_url,
      no_surat_kuliah,
      tgl_surat_kuliah,
      semester_kuliah,
      status_tanggungan,
    } = req.body;

    if (!nip_pegawai || !nama_keluarga || !status_hubungan || !tanggal_lahir) {
      return res.status(400).json({
        success: false,
        error: 'NIP Pegawai, Nama Anggota Keluarga, Status Hubungan, dan Tanggal Lahir wajib diisi.',
      });
    }

    const newKeluarga: KeluargaKP4 = {
      id: `kp4-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nip_pegawai,
      nama_keluarga: nama_keluarga.trim(),
      status_hubungan,
      tanggal_lahir,
      status_tanggungan: status_tanggungan !== undefined ? Boolean(status_tanggungan) : true,
      surat_ket_kuliah_url: surat_ket_kuliah_url || null,
      nama_sekolah_pt: nama_sekolah_pt || null,
      no_surat_kuliah: no_surat_kuliah || null,
      tgl_surat_kuliah: tgl_surat_kuliah || null,
      semester_kuliah: semester_kuliah || null,
    };

    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const created = dbStore.addKeluarga(newKeluarga, adminEmail);

    return res.status(201).json({
      success: true,
      message: 'Anggota keluarga KP4 berhasil ditambahkan.',
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function updateTanggunganStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    const updated = dbStore.updateKeluarga(id, req.body, adminEmail);
    return res.json({
      success: true,
      message: `Data keluarga KP4 a.n ${updated.nama_keluarga} berhasil diperbarui.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deleteAnggotaKeluarga(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    dbStore.deleteKeluarga(id, adminEmail);
    return res.json({
      success: true,
      message: 'Anggota keluarga KP4 berhasil dihapus.',
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

