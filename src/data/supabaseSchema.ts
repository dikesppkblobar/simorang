export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
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
  password TEXT DEFAULT 'admin',
  role TEXT NOT NULL DEFAULT 'Admin Unit Kerja',
  unit_kerja TEXT NOT NULL,
  nip TEXT,
  no_hp TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Aktif',
  terakhir_login TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JALANKAN INI JIKA TABEL SUDAH ADA SEBELUMNYA UNTUK MEMASTIKAN KOLOM PASSWORD TERSEDIA
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'admin';

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
`;

