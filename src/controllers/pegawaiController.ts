import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { validateNIP } from '../services/dateCalculator';
import { Pegawai } from '../types';

export function getAllPegawai(req: Request, res: Response) {
  try {
    const search = req.query.search as string;
    const jenisJabatan = req.query.jenis_jabatan as string;
    const includeDeleted = req.query.include_deleted === 'true';

    const list = dbStore.getPegawaiList(includeDeleted, search, jenisJabatan);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getPegawaiDetail(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const pegawai = dbStore.getPegawaiByNip(nip);

    if (!pegawai) {
      return res.status(404).json({ success: false, error: 'Pegawai tidak ditemukan.' });
    }

    const riwayatSk = dbStore.getSkListByNip(nip);
    const keluargaKp4 = dbStore.getKeluargaByNip(nip);

    return res.json({
      success: true,
      data: {
        ...pegawai,
        riwayat_sk: riwayatSk,
        keluarga_kp4: keluargaKp4,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createPegawai(req: Request, res: Response) {
  try {
    const {
      nip,
      nik,
      status_kepegawaian,
      profesi_sdmk,
      nama_lengkap,
      gelar_depan,
      gelar_belakang,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      jenis_jabatan,
      jabatan_spesifik,
      unit_kerja,
      status_ukom,
      tmt_cpns,
      pendidikan_terakhir,
      status_izin_belajar,
      no_whatsapp,
      sisa_cuti_tahunan,
      // PNS
      golongan_pangkat,
      nama_pangkat,
      tmt_golongan,
      masa_kerja_tahun,
      masa_kerja_bulan,
      no_sk_pangkat,
      tgl_sk_pangkat,
      jenis_mutasi,
      no_pertek_bkn,
      tgl_pertek_bkn,
      nama_jabatan_pns,
      tmt_jabatan_pns,
      no_sk_jabatan_pns,
      // PPPK
      ni_pppk,
      no_perjanjian_kerja,
      tgl_perjanjian_kerja,
      tmt_perjanjian_mulai,
      tmt_perjanjian_selesai,
      golongan_pppk,
      no_sk_pppk,
      satker,
      // Non-ASN
      no_sk_kontrak,
      masa_kerja_non_asn,
      sumber_pembiayaan,
    } = req.body;

    const statusKepeg = status_kepegawaian || 'PNS';
    const effectiveNik = nik ? String(nik).trim() : '5201010000000000';
    const effectiveNip = statusKepeg === 'Non-ASN' ? effectiveNik : (nip || '').trim();

    if (!nama_lengkap || !unit_kerja || !jenis_jabatan || !jabatan_spesifik) {
      return res.status(400).json({
        success: false,
        error: 'Nama Lengkap, Unit Kerja, Jenis Jabatan, dan Jabatan Spesifik wajib diisi.',
      });
    }

    const newPegawai: Pegawai = {
      nip: effectiveNip,
      nik: effectiveNik,
      status_kepegawaian: statusKepeg,
      profesi_sdmk: profesi_sdmk || 'Tenaga Kesehatan / Administrasi',
      nama_lengkap: nama_lengkap.trim().toUpperCase(),
      gelar_depan: gelar_depan || null,
      gelar_belakang: gelar_belakang || null,
      tempat_lahir: tempat_lahir || 'Lombok Barat',
      tanggal_lahir: tanggal_lahir || '1990-01-01',
      jenis_kelamin: jenis_kelamin || 'L',
      jenis_jabatan: jenis_jabatan || 'Fungsional',
      jabatan_spesifik: jabatan_spesifik || 'Staff Pelaksana',
      unit_kerja: unit_kerja || 'Dinas Kesehatan Kab. Lombok Barat',
      status_ukom: Boolean(status_ukom),
      tmt_cpns: tmt_cpns || '2015-01-01',
      pendidikan_terakhir: pendidikan_terakhir || 'S1 Kesehatan',
      status_izin_belajar: Boolean(status_izin_belajar),
      no_whatsapp: no_whatsapp || null,
      sisa_cuti_tahunan: sisa_cuti_tahunan || 12,
      is_deleted: false,
      created_at: new Date().toISOString(),

      golongan_pangkat,
      nama_pangkat,
      tmt_golongan,
      masa_kerja_tahun,
      masa_kerja_bulan,
      no_sk_pangkat,
      tgl_sk_pangkat,
      jenis_mutasi,
      no_pertek_bkn,
      tgl_pertek_bkn,
      nama_jabatan_pns,
      tmt_jabatan_pns,
      no_sk_jabatan_pns,

      ni_pppk,
      no_perjanjian_kerja,
      tgl_perjanjian_kerja,
      tmt_perjanjian_mulai,
      tmt_perjanjian_selesai,
      golongan_pppk,
      no_sk_pppk,
      satker,

      no_sk_kontrak,
      masa_kerja_non_asn,
      sumber_pembiayaan,
    };

    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    const created = dbStore.addPegawai(newPegawai, adminEmail);

    return res.status(201).json({
      success: true,
      message: 'Pegawai baru berhasil ditambahkan.',
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function updatePegawai(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    const updated = dbStore.updatePegawai(nip, req.body, adminEmail);
    return res.json({
      success: true,
      message: 'Data pegawai berhasil diperbarui.',
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function softDeletePegawai(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const isPermanent = req.query.permanent === 'true';
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    if (isPermanent) {
      dbStore.deletePegawaiPermanent(nip, adminEmail);
      return res.json({
        success: true,
        message: `Data pegawai NIP ${nip} berhasil dihapus permanen dari database.`,
      });
    }

    const deleted = dbStore.softDeletePegawai(nip, adminEmail);
    return res.json({
      success: true,
      message: `Pegawai ${deleted.nama_lengkap} berhasil di-nonaktifkan (soft-delete). Data tersimpan aman di database untuk histori audit.`,
      data: deleted,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function deletePegawaiPermanent(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    dbStore.deletePegawaiPermanent(nip, adminEmail);
    return res.json({
      success: true,
      message: `Data pegawai NIP ${nip} berhasil dihapus secara permanen dari Supabase & database lokal.`,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export function restorePegawai(req: Request, res: Response) {
  try {
    const { nip } = req.params;
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';

    const restored = dbStore.restorePegawai(nip, adminEmail);
    return res.json({
      success: true,
      message: `Pegawai ${restored.nama_lengkap} telah diaktifkan kembali.`,
      data: restored,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}
