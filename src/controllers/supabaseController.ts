import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { dbStore } from '../services/dbStore';

export async function getSupabaseStatus(req: Request, res: Response) {
  try {
    const health = await supabaseService.checkConnection();
    return res.json({
      success: true,
      url: 'https://pjofydlrdyxttogrxaju.supabase.co',
      health,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function syncSupabaseNow(req: Request, res: Response) {
  try {
    // First attempt to merge data from Supabase into memory
    await dbStore.fetchAndMergeSupabaseData();

    // Then push local data to Supabase
    const syncRes = await supabaseService.syncBulkToSupabase({
      pegawai: dbStore.getPegawaiList(true),
      skHistory: dbStore.getAllSk(),
      keluarga: dbStore.getAllKeluarga(),
      auditLogs: dbStore.getAuditLogs(),
      units: dbStore.getAllUnits(),
      users: dbStore.getAllUsers(),
      aplikasi: dbStore.getAllAplikasi(),
    });

    return res.json({
      success: true,
      message: 'Sinkronisasi dengan Database Supabase Berhasil!',
      details: syncRes.details,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getSupabaseSchemaSql(req: Request, res: Response) {
  const sql = `-- ==============================================================================
-- SKEMA LENGKAP DATABASE DARI 0 (CLEAN PRODUCTION SCHEMA)
-- SISTEM: SIMORANG DINKES-PPKB KABUPATEN LOMBOK BARAT
-- (Sistem Monitoring Ruang Kepegawaian Dinas Kesehatan, Pengendalian Penduduk
--  dan Keluarga Berencana Kab. Lombok Barat)
-- ==============================================================================

-- 0. HAPUS TABEL JIKA INGIN SETUP ULANG SECARA BERSIH DARI 0 (OPSIONAL)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS keluarga_kp4 CASCADE;
-- DROP TABLE IF EXISTS sk_history CASCADE;
-- DROP TABLE IF EXISTS pegawai CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS units CASCADE;
-- DROP TABLE IF EXISTS aplikasi_kepegawaian CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TABEL MASTER UNIT KERJA (PUSKESMAS, RSUD, LABKESDA, BALAI KB, DINAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  kode_unit TEXT UNIQUE NOT NULL,
  nama_unit TEXT UNIQUE NOT NULL,
  kategori TEXT NOT NULL,
  alamat TEXT,
  telepon TEXT,
  kepala_unit TEXT,
  nip_kepala TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABEL AKUN PENGGUNA & HAK AKSES (USER MANAGEMENT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'Admin Unit Kerja',
  unit_kerja TEXT NOT NULL,
  nip TEXT,
  no_hp TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Aktif',
  terakhir_login TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABEL UTAMA PEGAWAI (PNS, PPPK, NON-ASN / BLUD / KONTRAK)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pegawai (
  nip TEXT PRIMARY KEY,
  nik TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  gelar_depan TEXT,
  gelar_belakang TEXT,
  tempat_lahir TEXT,
  tanggal_lahir TEXT,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  status_kepegawaian TEXT NOT NULL, -- 'PNS', 'PPPK', 'Non-ASN'
  profesi_sdmk TEXT,
  jenis_jabatan TEXT, -- 'Struktural', 'Fungsional', 'Pelaksana'
  jabatan_spesifik TEXT,
  unit_kerja TEXT NOT NULL,
  status_ukom BOOLEAN DEFAULT FALSE,
  tmt_cpns TEXT,
  pendidikan_terakhir TEXT,
  status_izin_belajar BOOLEAN DEFAULT FALSE,
  no_whatsapp TEXT,
  sisa_cuti_tahunan INT DEFAULT 12,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Atribut Pemantauan Karir & Kinerja (BKN / E-Kinerja)
  jenjang_jabatan TEXT,
  ak_konversi_skp DOUBLE PRECISION DEFAULT 0,
  total_ak_kumulatif DOUBLE PRECISION DEFAULT 0,
  predikat_skp_terakhir TEXT,
  status_ukkj TEXT DEFAULT 'Belum UKKJ',
  no_sertifikat_ukkj TEXT,
  tgl_lulus_ukkj TEXT,
  status_ujian_dinas TEXT DEFAULT 'Bukan Pelaksana',
  no_stlud TEXT,
  status_pencantuman_gelar TEXT DEFAULT 'Terverifikasi BKN',
  nama_universitas_pt TEXT,
  program_studi TEXT,
  progres_semester TEXT,
  akreditasi_pt TEXT,
  tmt_kgb_terakhir TEXT,
  tmt_pangkat_terakhir TEXT,

  -- Atribut Khusus PNS
  golongan_pangkat TEXT,
  nama_pangkat TEXT,
  tmt_golongan TEXT,
  masa_kerja_tahun INT DEFAULT 0,
  masa_kerja_bulan INT DEFAULT 0,
  no_sk_pangkat TEXT,
  tgl_sk_pangkat TEXT,
  jenis_mutasi TEXT,
  no_pertek_bkn TEXT,
  tgl_pertek_bkn TEXT,
  nama_jabatan_pns TEXT,
  tmt_jabatan_pns TEXT,
  no_sk_jabatan_pns TEXT,

  -- Atribut Khusus PPPK
  ni_pppk TEXT,
  no_perjanjian_kerja TEXT,
  tgl_perjanjian_kerja TEXT,
  tmt_perjanjian_mulai TEXT,
  tmt_perjanjian_selesai TEXT,
  golongan_pppk TEXT,
  no_sk_pppk TEXT,
  satker TEXT,

  -- Atribut Khusus Non-ASN
  no_sk_kontrak TEXT,
  masa_kerja_non_asn TEXT,
  sumber_pembiayaan TEXT,

  -- Tenaga Medis / Kesehatan (STR & SIP Kemenkes)
  no_str TEXT,
  tgl_terbit_str TEXT,
  tgl_akhir_str TEXT,
  is_str_seumur_hidup BOOLEAN DEFAULT FALSE,
  no_sip TEXT,
  tgl_berlaku_sip_mulai TEXT,
  tgl_berlaku_sip_akhir TEXT
);

-- Indexing untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pegawai_unit_kerja ON pegawai(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_pegawai_status_kepegawaian ON pegawai(status_kepegawaian);
CREATE INDEX IF NOT EXISTS idx_pegawai_is_deleted ON pegawai(is_deleted);

-- ------------------------------------------------------------------------------
-- 4. TABEL RIWAYAT SK PEGAWAI (PANGKAT, JABATAN, KGB, PPPK, DIKLAT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sk_history (
  id TEXT PRIMARY KEY,
  nip_pegawai TEXT NOT NULL REFERENCES pegawai(nip) ON DELETE CASCADE,
  jenis_sk TEXT NOT NULL,
  nomor_sk TEXT NOT NULL,
  tmt_berlaku TEXT,
  file_url TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sk_history_nip ON sk_history(nip_pegawai);

-- ------------------------------------------------------------------------------
-- 5. TABEL KELUARGA & TANGGUNGAN KP4 (TUNJANGAN PASANGAN & ANAK)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keluarga_kp4 (
  id TEXT PRIMARY KEY,
  nip_pegawai TEXT NOT NULL REFERENCES pegawai(nip) ON DELETE CASCADE,
  nama_keluarga TEXT NOT NULL,
  status_hubungan TEXT NOT NULL, -- 'Suami', 'Istri', 'Anak'
  tanggal_lahir TEXT,
  status_tanggungan BOOLEAN DEFAULT TRUE,
  pekerjaan TEXT,
  nama_sekolah_pt TEXT,
  surat_ket_kuliah_url TEXT,
  no_surat_kuliah TEXT,
  tgl_surat_kuliah TEXT,
  semester_kuliah TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keluarga_kp4_nip ON keluarga_kp4(nip_pegawai);

-- ------------------------------------------------------------------------------
-- 6. TABEL APLIKASI & PORTAL KEPEGAWAIAN (SIASN, SIMPEG, E-KINERJA, DLL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aplikasi_kepegawaian (
  id TEXT PRIMARY KEY,
  nama_aplikasi TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Nasional (BKN / Kemenkes)',
  url_aplikasi TEXT NOT NULL,
  deskripsi TEXT,
  username TEXT,
  password TEXT,
  custom_logo_url TEXT,
  unit_kerja TEXT DEFAULT 'Semua Unit',
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penyesuaian tipe kolom ID jika sebelumnya dibuat sebagai UUID
ALTER TABLE IF EXISTS aplikasi_kepegawaian ALTER COLUMN id TYPE TEXT;

CREATE INDEX IF NOT EXISTS idx_aplikasi_kategori ON aplikasi_kepegawaian(kategori);
CREATE INDEX IF NOT EXISTS idx_aplikasi_unit_kerja ON aplikasi_kepegawaian(unit_kerja);

-- ------------------------------------------------------------------------------
-- 7. TABEL AUDIT LOG AKTIVITAS SISTEM
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL,
  aksi TEXT NOT NULL,
  tabel_terdampak TEXT NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. PENGATURAN AKSES SUPABASE (ROW LEVEL SECURITY)
-- ------------------------------------------------------------------------------
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai DISABLE ROW LEVEL SECURITY;
ALTER TABLE sk_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE keluarga_kp4 DISABLE ROW LEVEL SECURITY;
ALTER TABLE aplikasi_kepegawaian DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 8. DATA AWAL MASTER UNIT KERJA LOMBOK BARAT (REAL MASTER DATA)
-- ------------------------------------------------------------------------------
INSERT INTO units (id, kode_unit, nama_unit, kategori, alamat, telepon, kepala_unit, status)
VALUES
  ('unit-001', 'DINAS-01', 'Dinas Kesehatan Kab. Lombok Barat', 'Dinas', 'Jl. Soekarno-Hatta No. 1, Gerung', '(0370) 681234', 'Kepala Dinas Kesehatan', 'Aktif'),
  ('unit-002', 'PKM-01', 'Puskesmas Gerung', 'Puskesmas', 'Jl. Gatot Subroto, Gerung', '(0370) 682334', 'Kepala Puskesmas Gerung', 'Aktif'),
  ('unit-003', 'PKM-02', 'Puskesmas Narmada', 'Puskesmas', 'Jl. Raya Narmada, Kec. Narmada', '(0370) 671112', 'Kepala Puskesmas Narmada', 'Aktif'),
  ('unit-004', 'PKM-03', 'Puskesmas Meninting', 'Puskesmas', 'Jl. Raya Senggigi, Batu Layar', '(0370) 692223', 'Kepala Puskesmas Meninting', 'Aktif'),
  ('unit-005', 'PKM-04', 'Puskesmas Labuapi', 'Puskesmas', 'Jl. TGH. Lopan, Labuapi', '(0370) 672556', 'Kepala Puskesmas Labuapi', 'Aktif'),
  ('unit-006', 'PKM-05', 'Puskesmas Gunungsari', 'Puskesmas', 'Jl. Pariwisata Gunungsari', '(0370) 673441', 'Kepala Puskesmas Gunungsari', 'Aktif'),
  ('unit-007', 'PKM-06', 'Puskesmas Sekotong', 'Puskesmas', 'Jl. Raya Sekotong, Sekotong Barat', '(0370) 683445', 'Kepala Puskesmas Sekotong', 'Aktif'),
  ('unit-008', 'PKM-07', 'Puskesmas Kediri', 'Puskesmas', 'Jl. TGH. Abdul Karim, Kediri', '(0370) 671882', 'Kepala Puskesmas Kediri', 'Aktif'),
  ('unit-009', 'PKM-08', 'Puskesmas Lingsar', 'Puskesmas', 'Jl. Raya Lingsar, Kec. Lingsar', '(0370) 672110', 'Kepala Puskesmas Lingsar', 'Aktif'),
  ('unit-010', 'PKM-09', 'Puskesmas Suranadi', 'Puskesmas', 'Jl. Wisata Suranadi, Narmada', '(0370) 674550', 'Kepala Puskesmas Suranadi', 'Aktif'),
  ('unit-011', 'PKM-10', 'Puskesmas Penimbung', 'Puskesmas', 'Jl. Raya Penimbung, Gunungsari', '(0370) 675001', 'Kepala Puskesmas Penimbung', 'Aktif'),
  ('unit-012', 'PKM-11', 'Puskesmas Lembar', 'Puskesmas', 'Jl. Pelabuhan Lembar, Kec. Lembar', '(0370) 681900', 'Kepala Puskesmas Lembar', 'Aktif'),
  ('unit-013', 'PKM-12', 'Puskesmas Eyat Mayang', 'Puskesmas', 'Jl. Raya Eyat Mayang, Lembar', '(0370) 681912', 'Kepala Puskesmas Eyat Mayang', 'Aktif'),
  ('unit-014', 'PKM-13', 'Puskesmas Jembatan Kembar', 'Puskesmas', 'Jl. Raya Lembar, Jembatan Kembar', '(0370) 681925', 'Kepala Puskesmas Jembatan Kembar', 'Aktif'),
  ('unit-015', 'PKM-14', 'Puskesmas Kuripan', 'Puskesmas', 'Jl. TGH. Lalu Panji, Kuripan', '(0370) 684110', 'Kepala Puskesmas Kuripan', 'Aktif'),
  ('unit-016', 'PKM-15', 'Puskesmas Sigerongan', 'Puskesmas', 'Jl. Raya Sigerongan, Lingsar', '(0370) 672440', 'Kepala Puskesmas Sigerongan', 'Aktif'),
  ('unit-017', 'PKM-16', 'Puskesmas Pelangan', 'Puskesmas', 'Jl. Pariwisata Pelangan, Sekotong', '(0370) 683990', 'Kepala Puskesmas Pelangan', 'Aktif'),
  ('unit-018', 'PKM-17', 'Puskesmas Sedau', 'Puskesmas', 'Jl. Raya Sedau, Narmada', '(0370) 674992', 'Kepala Puskesmas Sedau', 'Aktif'),
  ('unit-019', 'PKM-18', 'Puskesmas Banyumulek', 'Puskesmas', 'Jl. Wisata Banyumulek, Kediri', '(0370) 671550', 'Kepala Puskesmas Banyumulek', 'Aktif'),
  ('unit-020', 'PKM-19', 'Puskesmas Parampuan', 'Puskesmas', 'Jl. Raya Labuapi, Parampuan', '(0370) 672901', 'Kepala Puskesmas Parampuan', 'Aktif'),
  ('unit-021', 'RSUD-01', 'RSUD Tripat Gerung', 'Rumah Sakit', 'Jl. H. Lalang Seta, Gerung Utara', '(0370) 681122', 'Direktur RSUD Tripat', 'Aktif'),
  ('unit-022', 'RSUD-02', 'RSUD Awet Muda Narmada', 'Rumah Sakit', 'Jl. Ahmad Yani No. 1, Narmada', '(0370) 671800', 'Direktur RSUD Awet Muda', 'Aktif'),
  ('unit-023', 'LAB-01', 'Labkesda Lombok Barat', 'Lab / UPTD', 'Jl. Pendidikan No. 5, Gerung', '(0370) 682990', 'Kepala Labkesda', 'Aktif'),
  ('unit-024', 'KB-01', 'Balai Penyuluhan KB Kec. Gerung', 'KB / PPKB', 'Jl. Gatot Subroto, Gerung', '(0370) 682500', 'Koordinator KB Gerung', 'Aktif'),
  ('unit-025', 'KB-02', 'Balai Penyuluhan KB Kec. Narmada', 'KB / PPKB', 'Jl. Raya Narmada, Narmada', '(0370) 671400', 'Koordinator KB Narmada', 'Aktif'),
  ('unit-026', 'KB-03', 'Balai Penyuluhan KB Kec. Gunungsari', 'KB / PPKB', 'Jl. Pariwisata Gunungsari', '(0370) 673100', 'Koordinator KB Gunungsari', 'Aktif')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. DATA AWAL AKUN ADMINISTRATOR UTAMA
-- ------------------------------------------------------------------------------
INSERT INTO users (id, username, nama_lengkap, email, role, unit_kerja, no_hp, status)
VALUES
  ('usr-001', 'admin.dinkes', 'Administrator DINKES-PPKB (Admin Utama)', 'admin.dikes@lombokbaratkab.go.id', 'Admin Dinkes', 'Dinas Kesehatan Kab. Lombok Barat', '081234567890', 'Aktif'),
  ('usr-002', 'admin.gerung', 'Admin Puskesmas Gerung', 'admin.gerung@pkm.go.id', 'Admin Unit Kerja', 'Puskesmas Gerung', '081987654321', 'Aktif'),
  ('usr-003', 'admin.narmada', 'Admin Puskesmas Narmada', 'admin.narmada@pkm.go.id', 'Admin Unit Kerja', 'Puskesmas Narmada', '081765432109', 'Aktif'),
  ('usr-004', 'admin.tripat', 'Admin RSUD Tripat Gerung', 'admin.tripat@rsud.go.id', 'Admin Unit Kerja', 'RSUD Tripat Gerung', '085234567891', 'Aktif')
ON CONFLICT (id) DO NOTHING;
`;

  return res.json({ success: true, sql });
}
