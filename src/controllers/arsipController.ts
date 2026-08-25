import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { RiwayatSK } from '../types';

export function getAllSk(req: Request, res: Response) {
  try {
    const list = dbStore.getAllSk();
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getSkHistoryByPegawai(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const list = dbStore.getSkListByNip(nip);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


export function uploadAndCreateSk(req: Request, res: Response) {
  try {
    const { nip_pegawai, jenis_sk, nomor_sk, tmt_berlaku, file_url, keterangan, golongan_pangkat, nama_pangkat } = req.body;

    if (!nip_pegawai || !jenis_sk || !nomor_sk || !tmt_berlaku) {
      return res.status(400).json({
        success: false,
        error: 'NIP Pegawai, Jenis SK, Nomor SK, dan TMT Berlaku wajib diisi.',
      });
    }

    const pegawai = dbStore.getPegawaiByNip(nip_pegawai);
    if (!pegawai) {
      return res.status(404).json({ success: false, error: 'Pegawai tidak ditemukan.' });
    }

    const newSk: RiwayatSK & { golongan_pangkat?: string; nama_pangkat?: string } = {
      id: `sk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nip_pegawai,
      jenis_sk,
      nomor_sk: nomor_sk.trim(),
      tmt_berlaku,
      file_url: file_url || undefined,
      keterangan: keterangan || `Diunggah via Sistem SIMORANG Dikes Lombok Barat`,
      golongan_pangkat: golongan_pangkat || undefined,
      nama_pangkat: nama_pangkat || undefined,
      created_at: new Date().toISOString(),
    };

    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const created = dbStore.addSk(newSk as any, adminEmail);

    return res.status(201).json({
      success: true,
      message: `SK ${jenis_sk} berhasil ditambahkan dan arsip terdaftar. Hitungan jatuh tempo alert otomatis diperbarui.`,
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deleteSk(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    dbStore.deleteSk(id, adminEmail);
    return res.json({
      success: true,
      message: 'Berkas SK digital berhasil dihapus dari arsip.',
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
