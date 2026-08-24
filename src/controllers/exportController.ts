import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { dbStore } from '../services/dbStore';
import { formatDateIndonesian } from '../services/dateCalculator';

export function exportPegawaiData(req: Request, res: Response) {
  try {
    const type = (req.query.type as string) || 'all';
    const activePegawai = dbStore.getPegawaiList(false);
    const skList = dbStore.getAllSk();
    const keluargaList = dbStore.getAllKeluarga();

    let exportRows: any[] = [];
    let filename = `Laporan_Pegawai_Dikes_Lobar_${type}_${new Date().toISOString().substring(0, 10)}.xlsx`;

    if (type === 'all' || type === 'pegawai') {
      exportRows = activePegawai.map((p, idx) => ({
        No: idx + 1,
        NIP: p.nip,
        'Nama Lengkap': `${p.gelar_depan ? p.gelar_depan + ' ' : ''}${p.nama_lengkap}${p.gelar_belakang ? ', ' + p.gelar_belakang : ''}`,
        'Jenis Kelamin': p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan',
        'Tempat, Tgl Lahir': `${p.tempat_lahir}, ${formatDateIndonesian(p.tanggal_lahir)}`,
        'Jenis Jabatan': p.jenis_jabatan,
        'Jabatan Spesifik': p.jabatan_spesifik,
        'Unit Kerja': p.unit_kerja,
        'Status UKOM': p.status_ukom ? 'LULUS / WAJIB' : 'BELUM',
        'TMT CPNS': formatDateIndonesian(p.tmt_cpns),
        'Pendidikan Terakhir': p.pendidikan_terakhir,
        'Status Izin Belajar': p.status_izin_belajar ? 'Aktif' : 'Tidak',
      }));
    } else if (type === 'kp4') {
      filename = `Laporan_KP4_Tunjangan_Keluarga_${new Date().toISOString().substring(0, 10)}.xlsx`;
      const pegawaiMap = new Map(activePegawai.map((p) => [p.nip, p]));
      exportRows = keluargaList.map((k, idx) => {
        const p = pegawaiMap.get(k.nip_pegawai);
        return {
          No: idx + 1,
          'NIP Pegawai': k.nip_pegawai,
          'Nama Pegawai': p?.nama_lengkap || '-',
          'Unit Kerja': p?.unit_kerja || '-',
          'Nama Anggota Keluarga': k.nama_keluarga,
          'Status Hubungan': k.status_hubungan,
          'Tanggal Lahir': formatDateIndonesian(k.tanggal_lahir),
          'Status Tanggungan': k.status_tanggungan ? 'DAPAT TUNJANGAN (AKTIF)' : 'NON-AKTIF',
          'Surat Ket Kuliah': k.surat_ket_kuliah_url ? 'Ada / Terverifikasi' : 'Tidak Ada',
          'Instansi / PT': k.nama_sekolah_pt || '-',
        };
      });
    } else if (type === 'sk') {
      filename = `Laporan_Riwayat_SK_Arsip_${new Date().toISOString().substring(0, 10)}.xlsx`;
      const pegawaiMap = new Map(activePegawai.map((p) => [p.nip, p]));
      exportRows = skList.map((s, idx) => {
        const p = pegawaiMap.get(s.nip_pegawai);
        return {
          No: idx + 1,
          'NIP Pegawai': s.nip_pegawai,
          'Nama Pegawai': p?.nama_lengkap || '-',
          'Jenis SK': s.jenis_sk,
          'Nomor SK': s.nomor_sk,
          'TMT Berlaku': formatDateIndonesian(s.tmt_berlaku),
          Keterangan: s.keterangan || '-',
          'Tanggal Upload': formatDateIndonesian(s.created_at.substring(0, 10)),
        };
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
