-- ==============================================================================
-- DATABASE SCHEMA & INITIAL DATA FOR SI-PATUH (SUPABASE / POSTGRESQL)
-- Sistem Informasi Pemantauan ASN Terpadu & Handal - Kab. Lombok Barat
-- ==============================================================================

-- 1. HAPUS TABEL JIKA SUDAH ADA (OPTIONAL - SAFETY CLEANUP)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS keluarga_kp4 CASCADE;
DROP TABLE IF EXISTS riwayat_sk CASCADE;
DROP TABLE IF EXISTS pegawai CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS unit_kerja CASCADE;

DROP TYPE IF EXISTS jenis_jabatan_enum CASCADE;
DROP TYPE IF EXISTS status_kepegawaian_enum CASCADE;
DROP TYPE IF EXISTS sumber_pembiayaan_enum CASCADE;
DROP TYPE IF EXISTS jenis_kelamin_enum CASCADE;
DROP TYPE IF EXISTS jenis_sk_enum CASCADE;
DROP TYPE IF EXISTS status_hubungan_enum CASCADE;
DROP TYPE IF EXISTS role_user_enum CASCADE;
DROP TYPE IF EXISTS kategori_unit_enum CASCADE;

-- 2. CREATE CUSTOM ENUM TYPES
CREATE TYPE jenis_jabatan_enum AS ENUM ('Pelaksana', 'Fungsional', 'Struktural');
CREATE TYPE status_kepegawaian_enum AS ENUM ('PNS', 'PPPK Penuh Waktu', 'PPPK Paruh Waktu', 'Non-ASN');
CREATE TYPE sumber_pembiayaan_enum AS ENUM ('APBD', 'BLUD', 'APBN');
CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');
CREATE TYPE jenis_sk_enum AS ENUM (
  'KGB', 'Pangkat', 'Mutasi', 'Izin Belajar', 'Jafung_PAK',
  'UKOM', 'STLUD', 'Pencantuman_Gelar', 'KP4', 'Pensiun', 'Lainnya'
);
CREATE TYPE status_hubungan_enum AS ENUM ('Suami', 'Istri', 'Anak');
CREATE TYPE role_user_enum AS ENUM ('Admin Dinkes', 'Admin Unit Kerja', 'Operator');
CREATE TYPE kategori_unit_enum AS ENUM ('Dinas', 'Puskesmas', 'Rumah Sakit', 'Lab / UPTD');

-- 3. CREATE TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABEL MASTER UNIT KERJA
-- ==============================================================================
CREATE TABLE unit_kerja (
  id VARCHAR(50) PRIMARY KEY,
  kode_unit VARCHAR(50) UNIQUE NOT NULL,
  nama_unit TEXT NOT NULL,
  kategori kategori_unit_enum NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  kepala_unit TEXT,
  nip_kepala VARCHAR(30),
  status VARCHAR(20) DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_unit_kerja
BEFORE UPDATE ON unit_kerja
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==============================================================================
-- 5. TABEL USER ACCOUNTS
-- ==============================================================================
CREATE TABLE user_accounts (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role role_user_enum NOT NULL DEFAULT 'Operator',
  unit_kerja TEXT NOT NULL,
  no_hp VARCHAR(30),
  status VARCHAR(20) DEFAULT 'Aktif',
  terakhir_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_user_accounts
BEFORE UPDATE ON user_accounts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==============================================================================
-- 6. TABEL MASTER PEGAWAI
-- ==============================================================================
CREATE TABLE pegawai (
  nip VARCHAR(30) PRIMARY KEY,
  nik VARCHAR(20) NOT NULL,
  nama_lengkap TEXT NOT NULL,
  gelar_depan VARCHAR(50),
  gelar_belakang VARCHAR(50),
  tempat_lahir TEXT,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin jenis_kelamin_enum NOT NULL,
  status_kepegawaian status_kepegawaian_enum NOT NULL,
  profesi_sdmk TEXT,
  jenis_jabatan jenis_jabatan_enum NOT NULL,
  jabatan_spesifik TEXT NOT NULL,
  unit_kerja TEXT NOT NULL,
  status_ukom BOOLEAN DEFAULT FALSE,
  tmt_cpns DATE,
  pendidikan_terakhir TEXT,
  status_izin_belajar BOOLEAN DEFAULT FALSE,
  no_whatsapp VARCHAR(30),
  sisa_cuti_tahunan INT DEFAULT 12,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Atribut Tambahan Pemantauan ASN
  jenjang_jabatan TEXT,
  ak_konversi_skp NUMERIC(8,2),
  total_ak_kumulatif NUMERIC(8,2),
  predikat_skp_terakhir VARCHAR(30),
  status_ukkj VARCHAR(50),
  no_sertifikat_ukkj TEXT,
  tgl_lulus_ukkj DATE,
  status_ujian_dinas VARCHAR(50),
  no_stlud TEXT,
  status_pencantuman_gelar VARCHAR(50),
  nama_universitas_pt TEXT,
  program_studi TEXT,
  progres_semester VARCHAR(50),
  akreditasi_pt VARCHAR(20),
  tmt_kgb_terakhir DATE,
  tmt_pangkat_terakhir DATE,

  -- Atribut Spesifik PNS
  golongan_pangkat VARCHAR(20),
  nama_pangkat VARCHAR(100),
  tmt_golongan DATE,
  masa_kerja_tahun INT,
  masa_kerja_bulan INT,
  no_sk_pangkat TEXT,
  tgl_sk_pangkat DATE,
  jenis_mutasi TEXT,
  no_pertek_bkn TEXT,
  tgl_pertek_bkn DATE,
  nama_jabatan_pns TEXT,
  tmt_jabatan_pns DATE,
  no_sk_jabatan_pns TEXT,

  -- Atribut Spesifik PPPK
  ni_pppk VARCHAR(30),
  no_perjanjian_kerja TEXT,
  tgl_perjanjian_kerja DATE,
  tmt_perjanjian_mulai DATE,
  tmt_perjanjian_selesai DATE,
  golongan_pppk VARCHAR(30),
  no_sk_pppk TEXT,
  satker TEXT,

  -- Atribut Spesifik Non-ASN
  no_sk_kontrak TEXT,
  masa_kerja_non_asn VARCHAR(50),
  sumber_pembiayaan sumber_pembiayaan_enum,

  -- Legalitas STR & SIP
  no_str TEXT,
  tgl_terbit_str DATE,
  tgl_akhir_str DATE,
  is_str_seumur_hidup BOOLEAN DEFAULT FALSE,
  no_sip TEXT,
  tgl_berlaku_sip_mulai DATE,
  tgl_berlaku_sip_akhir DATE
);

CREATE TRIGGER set_timestamp_pegawai
BEFORE UPDATE ON pegawai
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- INDEXES FOR PEGAWAI SEARCH & PERFORMANCE
CREATE INDEX idx_pegawai_unit_kerja ON pegawai(unit_kerja);
CREATE INDEX idx_pegawai_jenis_jabatan ON pegawai(jenis_jabatan);
CREATE INDEX idx_pegawai_status_kepegawaian ON pegawai(status_kepegawaian);
CREATE INDEX idx_pegawai_is_deleted ON pegawai(is_deleted);

-- ==============================================================================
-- 7. TABEL RIWAYAT SK KEPEGAWAIAN
-- ==============================================================================
CREATE TABLE riwayat_sk (
  id VARCHAR(50) PRIMARY KEY,
  nip_pegawai VARCHAR(30) NOT NULL REFERENCES pegawai(nip) ON DELETE CASCADE ON UPDATE CASCADE,
  jenis_sk jenis_sk_enum NOT NULL,
  nomor_sk TEXT NOT NULL,
  tmt_berlaku DATE NOT NULL,
  file_url TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_riwayat_sk_nip ON riwayat_sk(nip_pegawai);

-- ==============================================================================
-- 8. TABEL KELUARGA KP4 (TUNJANGAN)
-- ==============================================================================
CREATE TABLE keluarga_kp4 (
  id VARCHAR(50) PRIMARY KEY,
  nip_pegawai VARCHAR(30) NOT NULL REFERENCES pegawai(nip) ON DELETE CASCADE ON UPDATE CASCADE,
  nama_keluarga TEXT NOT NULL,
  status_hubungan status_hubungan_enum NOT NULL,
  tanggal_lahir DATE NOT NULL,
  status_tanggungan BOOLEAN DEFAULT TRUE,
  surat_ket_kuliah_url TEXT,
  nama_sekolah_pt TEXT,
  no_surat_kuliah TEXT,
  tgl_surat_kuliah DATE,
  semester_kuliah VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keluarga_kp4_nip ON keluarga_kp4(nip_pegawai);

-- ==============================================================================
-- 9. TABEL AUDIT LOGS
-- ==============================================================================
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  aksi VARCHAR(50) NOT NULL,
  tabel_terdampak VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ==============================================================================
ALTER TABLE unit_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_sk ENABLE ROW LEVEL SECURITY;
ALTER TABLE keluarga_kp4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to anon & authenticated users
CREATE POLICY "Allow public select on unit_kerja" ON unit_kerja FOR SELECT USING (true);
CREATE POLICY "Allow public select on user_accounts" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public select on pegawai" ON pegawai FOR SELECT USING (true);
CREATE POLICY "Allow public select on riwayat_sk" ON riwayat_sk FOR SELECT USING (true);
CREATE POLICY "Allow public select on keluarga_kp4" ON keluarga_kp4 FOR SELECT USING (true);
CREATE POLICY "Allow public select on audit_logs" ON audit_logs FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated / anon API access
CREATE POLICY "Allow write access on unit_kerja" ON unit_kerja FOR ALL USING (true);
CREATE POLICY "Allow write access on user_accounts" ON user_accounts FOR ALL USING (true);
CREATE POLICY "Allow write access on pegawai" ON pegawai FOR ALL USING (true);
CREATE POLICY "Allow write access on riwayat_sk" ON riwayat_sk FOR ALL USING (true);
CREATE POLICY "Allow write access on keluarga_kp4" ON keluarga_kp4 FOR ALL USING (true);
CREATE POLICY "Allow write access on audit_logs" ON audit_logs FOR ALL USING (true);

-- ==============================================================================
-- 11. INSERT INITIAL SEED DATA
-- ==============================================================================

-- 11.1 SEED UNIT KERJA
INSERT INTO unit_kerja (id, kode_unit, nama_unit, kategori, alamat, telepon, kepala_unit, nip_kepala, status) VALUES
('unit-001', 'DINAS-01', 'Dinas Kesehatan Kab. Lombok Barat', 'Dinas', 'Jl. Soekarno-Hatta No. 1, Gerung', '(0370) 681234', 'dr. H. AHMAD SYAMSUL, M.Kes', '197405122000031005', 'Aktif'),
('unit-002', 'PKM-01', 'Puskesmas Narmada', 'Puskesmas', 'Jl. Raya Narmada, Kec. Narmada', '(0370) 671112', 'dr. I Gede Agus', '198001012005011002', 'Aktif'),
('unit-003', 'PKM-02', 'Puskesmas Meninting', 'Puskesmas', 'Jl. Raya Senggigi, Batu Layar', '(0370) 692223', 'H. SUPARMAN, S.ST, M.Si', '196808201991031008', 'Aktif'),
('unit-004', 'PKM-03', 'Puskesmas Gerung', 'Puskesmas', 'Jl. Gatot Subroto, Gerung', '(0370) 682334', 'dr. Hj. Siti Fatimah', '197904122006042018', 'Aktif'),
('unit-005', 'PKM-04', 'Puskesmas Sekotong', 'Puskesmas', 'Jl. Raya Sekotong, Sekotong Barat', '(0370) 683445', 'dr. M. Ridwan', '198506152010011012', 'Aktif'),
('unit-006', 'PKM-05', 'Puskesmas Labuapi', 'Puskesmas', 'Jl. TGH. Lopan, Labuapi', '(0370) 672556', 'Ns. Hj. Nurhidayah, S.Kep', '198108102005022006', 'Aktif'),
('unit-007', 'RSUD-01', 'RSUD Tripat Gerung', 'Rumah Sakit', 'Jl. H. Lalang Seta, Gerung Utara', '(0370) 681122', 'dr. H. Suriyadi, Sp.B', '197003101999031003', 'Aktif'),
('unit-008', 'LAB-01', 'Labkesda Lombok Barat', 'Lab / UPTD', 'Jl. Pendidikan No. 5, Gerung', '(0370) 682990', 'M. Syahroni, S.ST', '198311122008011005', 'Aktif');

-- 11.2 SEED USER ACCOUNTS
INSERT INTO user_accounts (id, username, nama_lengkap, email, role, unit_kerja, no_hp, status, terakhir_login) VALUES
('usr-001', 'admin.dinkes', 'dr. H. AHMAD SYAMSUL (Admin Utama)', 'admin.dikes@lombokbaratkab.go.id', 'Admin Dinkes', 'Dinas Kesehatan Kab. Lombok Barat', '081234567890', 'Aktif', NOW()),
('usr-002', 'admin.narmada', 'Ns. NI WAYAN SUMARTINI (Admin Puskesmas)', 'admin.narmada@pkm.go.id', 'Admin Unit Kerja', 'Puskesmas Narmada', '081987654321', 'Aktif', NOW()),
('usr-003', 'admin.meninting', 'H. SUPARMAN (Admin Puskesmas)', 'admin.meninting@pkm.go.id', 'Admin Unit Kerja', 'Puskesmas Meninting', '081765432109', 'Aktif', NOW()),
('usr-004', 'admin.rsud', 'Administrator RSUD Tripat', 'admin.rsud@rsud.go.id', 'Admin Unit Kerja', 'RSUD Tripat Gerung', '085234567891', 'Aktif', NOW());

-- 11.3 SEED MASTER PEGAWAI
INSERT INTO pegawai (
  nip, nik, nama_lengkap, gelar_depan, gelar_belakang, tempat_lahir, tanggal_lahir, jenis_kelamin,
  status_kepegawaian, profesi_sdmk, jenis_jabatan, jabatan_spesifik, unit_kerja, status_ukom,
  tmt_cpns, pendidikan_terakhir, status_izin_belajar, no_whatsapp, sisa_cuti_tahunan, is_deleted,
  golongan_pangkat, nama_pangkat, tmt_golongan, masa_kerja_tahun, masa_kerja_bulan, no_sk_pangkat, tgl_sk_pangkat,
  jenis_mutasi, no_pertek_bkn, tgl_pertek_bkn, no_str, tgl_terbit_str, is_str_seumur_hidup, no_sip, tgl_berlaku_sip_mulai, tgl_berlaku_sip_akhir
) VALUES
('197405122000031005', '5201011205740001', 'dr. H. AHMAD SYAMSUL', 'dr. H.', 'M.Kes', 'Gerung', '1974-05-12', 'L', 'PNS', 'Dokter / Dokter Spesialis', 'Struktural', 'Kepala Dinas Kesehatan', 'Dinas Kesehatan Kab. Lombok Barat', true, '2000-03-01', 'S2 Kesehatan Masyarakat', false, '081234567890', 12, false, 'IV/c', 'Pembina Utama Muda', '2021-10-01', 24, 10, '821.2/105/BKD/2021', '2021-09-25', 'Kenaikan Pangkat Reguler', '12890/B-KP.02/2021', '2021-09-10', '311110022334455', '2015-05-12', true, '446/102/SIP-D/2022', '2022-01-01', '2027-12-31'),
('198203152006042012', '5201021503820002', 'NI WAYAN SUMARTINI', 'Ns.', 'S.Kep', 'Narmada', '1982-03-15', 'P', 'PNS', 'Perawat', 'Fungsional', 'Perawat Ahli Muda', 'Puskesmas Narmada', true, '2006-04-01', 'S1 Keperawatan', false, '081987654321', 10, false, 'III/c', 'Penata', '2022-04-01', 19, 11, '821/204/BKPSDM/2022', '2022-03-20', 'Kenaikan Pangkat Pilihan Jafung', '08912/B-KP.03/2022', '2022-03-05', '520102820315001', '2022-03-15', false, '446/088/SIP-P/2023', '2023-04-01', '2026-04-30'),
('196808201991031008', '5201032008680003', 'SUPARMAN', 'H.', 'S.ST, M.Si', 'Kediri', '1968-08-20', 'L', 'PNS', 'Sanitarian / Kesling', 'Fungsional', 'Sanitarian Ahli Madya', 'Puskesmas Meninting', true, '1991-03-01', 'S2 Lingkungan', false, '081333444555', 12, false, 'IV/a', 'Pembina', '2022-10-01', 33, 11, '821/088/BKPSDM/2022', '2022-09-18', 'Kenaikan Pangkat Reguler', '14520/B-KP.01/2022', '2022-09-02', '520103680820002', '2018-08-20', true, '446/012/SIP-S/2022', '2022-10-01', '2027-10-01'),
('199201052019031002', '5201070501920007', 'LALU MUHAMMAD FIRDAUS', NULL, 'S.Tr.Kes', 'Sekotong', '1992-01-05', 'L', 'PNS', 'Pranata Laboratorium Kesehatan', 'Fungsional', 'Pranata Laboratorium Kesehatan Ahli Pertama', 'Puskesmas Sekotong', true, '2019-03-01', 'D4 Analis Kesehatan', false, '081999000111', 12, false, 'III/b', 'Penata Muda Tingkat I', '2023-04-01', 6, 0, '821/112/BKPSDM/2023', '2023-03-22', 'Kenaikan Pangkat Reguler', '09812/B-KP.02/2023', '2023-03-10', '520107920105008', '2019-03-01', true, '446/188/SIP-ATLM/2023', '2023-05-01', '2028-05-01');

-- PPPK PEGAWAI SEED
INSERT INTO pegawai (
  nip, nik, ni_pppk, nama_lengkap, gelar_depan, gelar_belakang, tempat_lahir, tanggal_lahir, jenis_kelamin,
  status_kepegawaian, profesi_sdmk, jenis_jabatan, jabatan_spesifik, unit_kerja, status_ukom,
  tmt_cpns, pendidikan_terakhir, status_izin_belajar, no_whatsapp, sisa_cuti_tahunan, is_deleted,
  golongan_pppk, no_perjanjian_kerja, tgl_perjanjian_kerja, tmt_perjanjian_mulai, tmt_perjanjian_selesai,
  no_sk_pppk, satker, no_str, tgl_terbit_str, tgl_akhir_str, is_str_seumur_hidup, no_sip, tgl_berlaku_sip_mulai, tgl_berlaku_sip_akhir
) VALUES
('198811102014022003', '5201041011880004', '198811102014022003', 'MADE DIAN INDRAYANI', 'dr.', NULL, 'Mataram', '1988-11-10', 'P', 'PPPK Penuh Waktu', 'Dokter / Dokter Spesialis', 'Fungsional', 'Dokter Ahli Muda', 'Puskesmas Gerung', true, '2014-02-01', 'S1 Kedokteran', false, '081777888999', 12, false, 'Golongan X', '800/120/PPPK-DK/2023', '2023-01-02', '2023-01-01', '2028-12-31', '810/055/SK-PPPK/2023', 'Dinas Kesehatan Lombok Barat', '520104881110003', '2021-11-10', '2026-11-10', false, '446/201/SIP-D/2023', '2023-01-15', '2028-01-15'),
('199004182015032007', '5201051804900005', '199004182015032007', 'BAIQ NURHASANAH', NULL, 'A.Md.Keb', 'Labuapi', '1990-04-18', 'P', 'PPPK Paruh Waktu', 'Bidan', 'Fungsional', 'Bidan Mahir', 'Puskesmas Gunungsari', true, '2015-03-01', 'D3 Kebidanan', true, '081555666777', 8, false, 'Golongan VII', '800/089/PPPK-PW/2024', '2024-02-01', '2024-02-01', '2027-01-31', '810/012/SK-PW/2024', 'Puskesmas Gunungsari', '520105900418004', '2021-04-18', '2026-04-18', false, '446/055/SIP-B/2024', '2024-02-10', '2026-04-18');

-- NON-ASN PEGAWAI SEED
INSERT INTO pegawai (
  nip, nik, nama_lengkap, gelar_depan, gelar_belakang, tempat_lahir, tanggal_lahir, jenis_kelamin,
  status_kepegawaian, profesi_sdmk, jenis_jabatan, jabatan_spesifik, unit_kerja, status_ukom,
  tmt_cpns, pendidikan_terakhir, status_izin_belajar, no_whatsapp, sisa_cuti_tahunan, is_deleted,
  no_sk_kontrak, masa_kerja_non_asn, sumber_pembiayaan
) VALUES
('5201062506850006', '5201062506850006', 'AHMAD ZULKARNAEN', NULL, 'S.KM', 'Lingsar', '1985-06-25', 'L', 'Non-ASN', 'Administrator Kesehatan', 'Pelaksana', 'Pengelola Data Pelayanan Kesehatan', 'Puskesmas Labuapi', false, '2020-01-01', 'S1 Kesehatan Masyarakat', true, '081222333444', 12, false, '800/045/SK-NONASN/2026', '4 Tahun 2 Bulan', 'BLUD');

-- 11.4 SEED RIWAYAT SK
INSERT INTO riwayat_sk (id, nip_pegawai, jenis_sk, nomor_sk, tmt_berlaku, file_url, keterangan) VALUES
('sk-001', '197405122000031005', 'KGB', '822/012/KGB/DIKES/2024', '2024-07-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Kenaikan Gaji Berkala Terakhir'),
('sk-002', '197405122000031005', 'Pangkat', '821.2/105/BKD/2021', '2021-10-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'SK Pangkat Pembina Utama Muda IV/c'),
('sk-003', '198203152006042012', 'Pangkat', '821/204/BKPSDM/2022', '2022-04-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'SK Pangkat Penata III/c'),
('sk-004', '198203152006042012', 'KGB', '822/115/KGB/NRM/2025', '2025-05-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'KGB Rutin 2 Tahun'),
('sk-005', '196808201991031008', 'Pangkat', '821/088/BKPSDM/2022', '2022-10-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'SK Pangkat Pembina IV/a'),
('sk-006', '196808201991031008', 'KGB', '822/045/MNT/2024', '2024-08-01', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'SK KGB Sanitarian Madya');

-- 11.5 SEED KELUARGA KP4
INSERT INTO keluarga_kp4 (id, nip_pegawai, nama_keluarga, status_hubungan, tanggal_lahir, status_tanggungan, surat_ket_kuliah_url, nama_sekolah_pt) VALUES
('kp4-101', '198811102014022003', 'I Putu Rizky Pratama', 'Anak', '2005-02-10', true, NULL, 'Universitas Mataram'),
('kp4-102', '198811102014022003', 'I Gede Ananda Putra', 'Suami', '1986-07-20', true, NULL, NULL),
('kp4-103', '199004182015032007', 'Lalu Muhammad Ziad', 'Anak', '2001-09-15', true, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Universitas Mataram (S1 Farmasi)'),
('kp4-104', '198203152006042012', 'I Wayan Kresna', 'Anak', '2012-06-18', true, NULL, 'SMP Negeri 1 Narmada');

-- 11.6 SEED AUDIT LOGS
INSERT INTO audit_logs (id, admin_email, aksi, tabel_terdampak, deskripsi) VALUES
('log-001', 'admin.dikes@lombokbaratkab.go.id', 'Create', 'pegawai', 'Inisialisasi Master Data Pegawai SI-PATUH Lombok Barat'),
('log-002', 'admin.dikes@lombokbaratkab.go.id', 'Upload SK', 'riwayat_sk', 'Pengunggahan SK KGB Terakhir a.n. dr. H. Ahmad Syamsul');

-- ==============================================================================
-- SCHEMA & DATA INITIALIZATION COMPLETED SUCCESSFULLY!
-- ==============================================================================
