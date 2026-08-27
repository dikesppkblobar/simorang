export type JenisJabatan = 'Pelaksana' | 'Fungsional' | 'Struktural';
export type StatusKepegawaian = 'PNS' | 'PPPK Penuh Waktu' | 'PPPK Paruh Waktu' | 'Non-ASN';
export type SumberPembiayaan = 'APBD' | 'BLUD' | 'APBN';
export type JenisKelamin = 'L' | 'P';
export type JenisSK =
  | 'KGB'
  | 'Pangkat'
  | 'Mutasi'
  | 'Izin Belajar'
  | 'Jafung_PAK'
  | 'UKOM'
  | 'STLUD'
  | 'Pencantuman_Gelar'
  | 'KP4'
  | 'Pensiun'
  | 'Lainnya';
export type StatusHubungan = 'Suami' | 'Istri' | 'Anak';

export interface Pegawai {
  nip: string; // NIP 18 digit (PNS), NI PPPK 18 digit (PPPK), or NIK 16 digit (Non-ASN)
  nik: string; // Wajib 16 digit murni
  nama_lengkap: string;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
  tempat_lahir: string;
  tanggal_lahir: string; // YYYY-MM-DD
  jenis_kelamin: JenisKelamin;
  status_kepegawaian: StatusKepegawaian;
  profesi_sdmk: string; // Rumpun Profesi Kesehatan / SDMK
  jenis_jabatan: JenisJabatan;
  jabatan_spesifik: string;
  unit_kerja: string;
  status_ukom: boolean;
  tmt_cpns: string; // YYYY-MM-DD (TMT CPNS / Pengangkatan)
  pendidikan_terakhir: string;
  status_izin_belajar: boolean;
  no_whatsapp?: string | null;
  sisa_cuti_tahunan?: number; // default 12
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;

  // Modul Pemantauan ASN Tambahan (PermenPANRB 1/2023, Per BKN 3/2023)
  jenjang_jabatan?: string; // Ahli Pertama, Ahli Muda, Ahli Madya, Ahli Utama, Penyelia, Mahir, Terampil
  ak_konversi_skp?: number; // Angka Kredit Konversi SKP Tahunan
  total_ak_kumulatif?: number; // Total Angka Kredit PAK Integrasi
  predikat_skp_terakhir?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Sangat Kurang';
  status_ukkj?: 'Lulus UKKJ' | 'Belum UKKJ' | 'Dalam Proses' | 'Bukan Jafung' | 'Tidak ada';
  no_sertifikat_ukkj?: string;
  tgl_lulus_ukkj?: string;
  status_ujian_dinas?: 'Lulus STLUD' | 'Belum Ujian' | 'Penyesuaian Ijazah' | 'Bukan Pelaksana' | 'Tidak ada';
  no_stlud?: string;
  status_pencantuman_gelar?: 'Terverifikasi BKN' | 'Proses Verval' | 'Belum Pengajuan' | 'Bukan Tugas Belajar' | 'Tidak ada';
  nama_universitas_pt?: string;
  program_studi?: string;
  progres_semester?: string;
  akreditasi_pt?: string;
  tmt_kgb_terakhir?: string;
  no_sk_kgb?: string;
  tmt_pangkat_terakhir?: string;

  // PNS Atribut Spesifik
  golongan_pangkat?: string; // e.g. "III/a", "III/b", "IV/a"
  nama_pangkat?: string; // e.g. "Penata Muda"
  tmt_golongan?: string; // YYYY-MM-DD
  masa_kerja_tahun?: number;
  masa_kerja_bulan?: number;
  no_sk_pangkat?: string;
  tgl_sk_pangkat?: string;
  jenis_mutasi?: string;
  no_pertek_bkn?: string;
  tgl_pertek_bkn?: string;
  nama_jabatan_pns?: string;
  tmt_jabatan_pns?: string;
  no_sk_jabatan_pns?: string;

  // PPPK Atribut Spesifik (Penuh / Paruh Waktu)
  ni_pppk?: string;
  no_perjanjian_kerja?: string;
  tgl_perjanjian_kerja?: string;
  tmt_perjanjian_mulai?: string;
  tmt_perjanjian_selesai?: string;
  golongan_pppk?: string; // e.g. "Golongan IX"
  no_sk_pppk?: string;
  satker?: string;

  // Non-ASN Atribut Spesifik (PKWT)
  no_sk_kontrak?: string;
  masa_kerja_non_asn?: string;
  sumber_pembiayaan?: SumberPembiayaan;
}

export interface RiwayatSK {
  id: string;
  nip_pegawai: string;
  jenis_sk: JenisSK;
  nomor_sk: string;
  tmt_berlaku: string; // YYYY-MM-DD
  file_url?: string;
  keterangan?: string;
  created_at: string;
}

export interface KeluargaKP4 {
  id: string;
  nip_pegawai: string;
  nama_keluarga: string;
  status_hubungan: StatusHubungan;
  tanggal_lahir: string; // YYYY-MM-DD
  status_tanggungan: boolean;
  pekerjaan?: string | null;
  surat_ket_kuliah_url?: string | null;
  nama_sekolah_pt?: string | null;
  no_surat_kuliah?: string | null;
  tgl_surat_kuliah?: string | null;
  semester_kuliah?: string | null;
}

export interface AlertKGBItem {
  nip: string;
  nama_lengkap: string;
  unit_kerja: string;
  jenis_jabatan: JenisJabatan;
  tmt_kgb_terakhir: string;
  tanggal_jatuh_tempo: string;
  sisa_bulan: number;
  sisa_hari: number;
  status_alert: 'Bahaya' | 'Peringatan' | 'Aman';
}

export interface AlertPangkatItem {
  nip: string;
  nama_lengkap: string;
  unit_kerja: string;
  jenis_jabatan: JenisJabatan;
  status_ukom: boolean;
  tmt_pangkat_terakhir: string;
  tanggal_jatuh_tempo: string;
  periode_bkn_terdekat: string;
  sisa_bulan: number;
  status_alert: 'Bahaya' | 'Peringatan' | 'Aman';
}

export interface AlertPensiunItem {
  nip: string;
  nama_lengkap: string;
  unit_kerja: string;
  jenis_jabatan: JenisJabatan;
  status_kepegawaian?: StatusKepegawaian;
  tanggal_lahir: string;
  umur_saat_ini: number;
  batas_usia_pensiun: number;
  tanggal_pensiun: string;
  sisa_bulan: number;
  status_alert: string;
}

export interface AlertKP4AnakItem {
  id: string;
  nip_pegawai: string;
  nama_pegawai: string;
  nama_anak: string;
  tanggal_lahir_anak: string;
  umur_tahun: number;
  umur_bulan: number;
  status_tanggungan: boolean;
  surat_ket_kuliah_url?: string | null;
  kategori_alert: 'Batas 21 Tahun (Tanpa Surat Kuliah)' | 'Batas 25 Tahun (Maksimal Tanggungan)';
  rekomendasi_aksi: string;
}

export interface DashboardStats {
  totalPegawaiAktif: number;
  totalPegawaiNonAktif: number;
  pensiunTahunIni: number;
  alertKgbBulanIni: number;
  alertPangkatBulanIni: number;
  alertKp4BulanIni: number;
  izinBelajarAktif: number;
  fungsionalJatuhTempo?: number;
  jabatanDistribution: { name: string; count: number }[];
  unitKerjaDistribution: { name: string; count: number }[];
}

export interface AdminUser {
  email: string;
  nama: string;
  role: string;
}

export type RoleUser = 'Admin Dinkes' | 'Admin Unit Kerja' | 'Operator';

export interface UnitKerjaItem {
  id: string;
  kode_unit: string;
  nama_unit: string;
  kategori: 'Dinas' | 'Dinas Kesehatan' | 'Puskesmas' | 'Rumah Sakit' | 'Lab / UPTD' | 'KB / PPKB';
  alamat?: string;
  telepon?: string;
  kepala_unit?: string;
  nip_kepala?: string;
  status: 'Aktif' | 'Nonaktif' | 'Non-Aktif';
}

export interface UserAccount {
  id: string;
  username: string;
  nama_lengkap: string;
  email: string;
  role: RoleUser;
  unit_kerja: string;
  nip?: string;
  password?: string;
  no_hp?: string;
  status: 'Aktif' | 'Nonaktif';
  terakhir_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface AppFeatureConfig {
  // Fitur Utama Sidebar & Modul
  aplikasi_kepegawaian: boolean;
  arsip_digital_upload: boolean;
  scope_data_unrestricted: boolean;

  // Sub-Fitur Pemantauan ASN
  sub_pangkat: boolean;
  sub_jafung: boolean;
  sub_kgb: boolean;
  sub_ukom: boolean;
  sub_ujian_dinas: boolean;
  sub_izin_belajar: boolean;
  sub_pencantuman_gelar: boolean;
  sub_mutasi: boolean;
  sub_kp4: boolean;
  sub_cuti: boolean;
  sub_pensiun: boolean;

  // Allow dynamic / legacy keys
  [key: string]: boolean | undefined;
}

export const DEFAULT_FEATURE_CONFIG: AppFeatureConfig = {
  aplikasi_kepegawaian: true,
  arsip_digital_upload: true,
  scope_data_unrestricted: true,
  sub_pangkat: true,
  sub_jafung: true,
  sub_kgb: true,
  sub_ukom: true,
  sub_ujian_dinas: true,
  sub_izin_belajar: true,
  sub_pencantuman_gelar: true,
  sub_mutasi: true,
  sub_kp4: true,
  sub_cuti: true,
  sub_pensiun: true,
};

export type KategoriAplikasi =
  | 'Nasional (BKN / Kemenkes)'
  | 'Pemerintah Daerah (Lombok Barat / NTB)'
  | 'Layanan Finansial & Jaminan ASN'
  | 'Lainnya';

export interface AplikasiKepegawaian {
  id: string;
  nama_aplikasi: string;
  kategori: KategoriAplikasi;
  url_aplikasi: string;
  deskripsi?: string;
  username?: string;
  password?: string;
  custom_logo_url?: string;
  unit_kerja?: string;
  status?: 'Aktif' | 'Maintenance' | 'Nonaktif';
  created_at: string;
  updated_at?: string;
}

