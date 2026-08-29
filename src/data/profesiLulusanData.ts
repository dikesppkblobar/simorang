// Master Data Profesi & Kualifikasi Lulusan Tenaga Kesehatan & Non-Nakes

export interface LulusanPreset {
  kategori: string;
  label: string;
  profesi_sdmk: string;
  pendidikan_terakhir: string;
  program_studi: string;
  jabatan_spesifik: string;
  jenis_jabatan: 'Fungsional' | 'Pelaksana' | 'Struktural';
  jenjang_jabatan?: string;
}

export const PROFESI_SDMK_LIST = [
  'Dokter Umum',
  'Dokter Gigi',
  'Dokter Spesialis',
  'Bidan',
  'Perawat',
  'Tenaga Farmasi (Apoteker / TTK)',
  'Tenaga Sanitasi Lingkungan / Sanitarian',
  'Nutrisionis / Dietisien',
  'Pranata Laboratorium Kesehatan (ATLM)',
  'Radiografer / Teknisi Medis',
  'Perekam Medis & Informasi Kesehatan',
  'Fisioterapis',
  'Epidemiolog Kesehatan',
  'Administrator Kesehatan',
  'Penyuluh Kesehatan Masyarakat / Promkes',
  'Penata Anestesi',
  'Terapis Gigi dan Mulut',
  'Teknisi Elektromedis',
  'Tenaga Administrasi / Pengadministrasi Perkantoran',
  'Analis SDM Aparatur / Kepegawaian',
  'Analis Keuangan / Perencana',
  'Pranata Komputer / IT',
  'Tenaga Teknis / Penunjang Umum Lainnya',
];

export const LULUSAN_PRESETS: LulusanPreset[] = [
  {
    kategori: 'Dokter',
    label: 'Dokter Umum (Profesi Dokter)',
    profesi_sdmk: 'Dokter Umum',
    pendidikan_terakhir: 'Profesi Dokter / S1 Kedokteran',
    program_studi: 'Pendidikan Profesi Dokter',
    jabatan_spesifik: 'Dokter Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Dokter Gigi',
    label: 'Dokter Gigi (Profesi Dokter Gigi)',
    profesi_sdmk: 'Dokter Gigi',
    pendidikan_terakhir: 'Profesi Dokter Gigi / S1 Kedokteran Gigi',
    program_studi: 'Pendidikan Dokter Gigi',
    jabatan_spesifik: 'Dokter Gigi Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Dokter Spesialis',
    label: 'Dokter Spesialis (Sp.1 / Sp.2)',
    profesi_sdmk: 'Dokter Spesialis',
    pendidikan_terakhir: 'Spesialis (Sp.1)',
    program_studi: 'Kedokteran Spesialis',
    jabatan_spesifik: 'Dokter Spesialis Ahli Muda',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Muda',
  },
  {
    kategori: 'Bidan',
    label: 'Bidan D3 (Terampil)',
    profesi_sdmk: 'Bidan',
    pendidikan_terakhir: 'D3 Kebidanan',
    program_studi: 'Kebidanan',
    jabatan_spesifik: 'Bidan Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Bidan',
    label: 'Bidan Profesi / S1 (Ahli Pertama)',
    profesi_sdmk: 'Bidan',
    pendidikan_terakhir: 'Profesi Bidan / S1 Kebidanan',
    program_studi: 'Kebidanan',
    jabatan_spesifik: 'Bidan Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Perawat',
    label: 'Perawat D3 (Terampil)',
    profesi_sdmk: 'Perawat',
    pendidikan_terakhir: 'D3 Keperawatan',
    program_studi: 'Keperawatan',
    jabatan_spesifik: 'Perawat Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Perawat',
    label: 'Perawat Ners / S1 (Ahli Pertama)',
    profesi_sdmk: 'Perawat',
    pendidikan_terakhir: 'Profesi Ners / S1 Keperawatan',
    program_studi: 'Ilmu Keperawatan',
    jabatan_spesifik: 'Perawat Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Farmasi',
    label: 'Apoteker (Profesi / S1 Farmasi)',
    profesi_sdmk: 'Tenaga Farmasi (Apoteker / TTK)',
    pendidikan_terakhir: 'Profesi Apoteker / S1 Farmasi',
    program_studi: 'Farmasi / Profesi Apoteker',
    jabatan_spesifik: 'Apoteker Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Farmasi',
    label: 'Asisten Apoteker (D3 Farmasi / TTK)',
    profesi_sdmk: 'Tenaga Farmasi (Apoteker / TTK)',
    pendidikan_terakhir: 'D3 Farmasi',
    program_studi: 'Farmasi',
    jabatan_spesifik: 'Asisten Apoteker Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Laboratorium',
    label: 'Pranata Labkes / ATLM (D3 Analis Kesehatan)',
    profesi_sdmk: 'Pranata Laboratorium Kesehatan (ATLM)',
    pendidikan_terakhir: 'D3 Analis Kesehatan / TLM',
    program_studi: 'Teknologi Laboratorium Medis',
    jabatan_spesifik: 'Pranata Laboratorium Kesehatan Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Gizi',
    label: 'Nutrisionis (D3 / S1 Gizi)',
    profesi_sdmk: 'Nutrisionis / Dietisien',
    pendidikan_terakhir: 'D3 Gizi / S1 Gizi',
    program_studi: 'Ilmu Gizi',
    jabatan_spesifik: 'Nutrisionis Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Sanitarian',
    label: 'Tenaga Sanitasi Lingkungan / Sanitarian (D3 / S1)',
    profesi_sdmk: 'Tenaga Sanitasi Lingkungan / Sanitarian',
    pendidikan_terakhir: 'D3 Sanitasi / S1 Kesehatan Lingkungan',
    program_studi: 'Kesehatan Lingkungan',
    jabatan_spesifik: 'Tenaga Sanitasi Lingkungan Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Perekam Medis',
    label: 'Perekam Medis (D3 Rekam Medis / RMIK)',
    profesi_sdmk: 'Perekam Medis & Informasi Kesehatan',
    pendidikan_terakhir: 'D3 Rekam Medis',
    program_studi: 'Rekam Medis & Informasi Kesehatan',
    jabatan_spesifik: 'Perekam Medis Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Radiografer',
    label: 'Radiografer (D3 Radiologi / Teknik Radiodiagnostik)',
    profesi_sdmk: 'Radiografer / Teknisi Medis',
    pendidikan_terakhir: 'D3 Radiologi',
    program_studi: 'Teknik Radiodiagnostik & Radioterapi',
    jabatan_spesifik: 'Radiografer Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Fisioterapis',
    label: 'Fisioterapis (D3 / S1 Fisioterapi)',
    profesi_sdmk: 'Fisioterapis',
    pendidikan_terakhir: 'D3 Fisioterapi',
    program_studi: 'Fisioterapi',
    jabatan_spesifik: 'Fisioterapis Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Epidemiolog',
    label: 'Epidemiolog Kesehatan (S1 Kesmas / Epidemiologi)',
    profesi_sdmk: 'Epidemiolog Kesehatan',
    pendidikan_terakhir: 'S1 Kesehatan Masyarakat',
    program_studi: 'Epidemiologi',
    jabatan_spesifik: 'Epidemiolog Kesehatan Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Admin Kes',
    label: 'Administrator Kesehatan (S1 Kesmas / AKK)',
    profesi_sdmk: 'Administrator Kesehatan',
    pendidikan_terakhir: 'S1 Kesehatan Masyarakat',
    program_studi: 'Administrasi Kebijakan Kesehatan',
    jabatan_spesifik: 'Administrator Kesehatan Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Promkes',
    label: 'Promosi Kesehatan (S1 Kesmas / Promkes)',
    profesi_sdmk: 'Penyuluh Kesehatan Masyarakat / Promkes',
    pendidikan_terakhir: 'S1 Kesehatan Masyarakat',
    program_studi: 'Promosi Kesehatan & Ilmu Perilaku',
    jabatan_spesifik: 'Tenaga Promosi Kesehatan dan Ilmu Perilaku Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Anestesi',
    label: 'Penata Anestesi (D3 / D4 Keperawatan Anestesi)',
    profesi_sdmk: 'Penata Anestesi',
    pendidikan_terakhir: 'D4 Penata Anestesi',
    program_studi: 'Keperawatan Anestesiologi',
    jabatan_spesifik: 'Penata Anestesi Terampil',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Terampil',
  },
  {
    kategori: 'Administrasi',
    label: 'Pengadministrasi Perkantoran / Umum (SMA / D3 / S1)',
    profesi_sdmk: 'Tenaga Administrasi / Pengadministrasi Perkantoran',
    pendidikan_terakhir: 'SMA / SMK / D3 / S1 Manajemen',
    program_studi: 'Administrasi Perkantoran',
    jabatan_spesifik: 'Pengadministrasi Perkantoran',
    jenis_jabatan: 'Pelaksana',
  },
  {
    kategori: 'Kepegawaian',
    label: 'Analis SDM Aparatur / Kepegawaian (S1 Administrasi / Hukum)',
    profesi_sdmk: 'Analis SDM Aparatur / Kepegawaian',
    pendidikan_terakhir: 'S1 Ilmu Administrasi Negara / S1 Hukum',
    program_studi: 'Ilmu Administrasi Negara',
    jabatan_spesifik: 'Analis SDM Aparatur Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
  {
    kategori: 'Keuangan',
    label: 'Analis Keuangan / Perencana (S1 Akuntansi / Ekonomi)',
    profesi_sdmk: 'Analis Keuangan / Perencana',
    pendidikan_terakhir: 'S1 Akuntansi / S1 Ekonomi',
    program_studi: 'Akuntansi',
    jabatan_spesifik: 'Analis Keuangan',
    jenis_jabatan: 'Pelaksana',
  },
  {
    kategori: 'IT',
    label: 'Pranata Komputer / IT (D3 / S1 Informatika)',
    profesi_sdmk: 'Pranata Komputer / IT',
    pendidikan_terakhir: 'S1 Teknik Informatika / S1 Sistem Informasi',
    program_studi: 'Teknik Informatika',
    jabatan_spesifik: 'Pranata Komputer Ahli Pertama',
    jenis_jabatan: 'Fungsional',
    jenjang_jabatan: 'Ahli Pertama',
  },
];

/**
 * Mendeteksi & menyarankan jabatan dan rumpun profesi secara otomatis
 * berdasarkan input pendidikan terakhir atau program studi lulusan.
 */
export function detectProfesiFromLulusan(pendidikan: string = '', prodi: string = ''): Partial<LulusanPreset> | null {
  const combined = `${pendidikan} ${prodi}`.toLowerCase();

  if (combined.includes('dokter gigi')) {
    return {
      profesi_sdmk: 'Dokter Gigi',
      jabatan_spesifik: 'Dokter Gigi Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('spesialis') || combined.includes('sp.1') || combined.includes('sp.2')) {
    return {
      profesi_sdmk: 'Dokter Spesialis',
      jabatan_spesifik: 'Dokter Spesialis Ahli Muda',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Muda',
    };
  }
  if (combined.includes('dokter') || combined.includes('kedokteran')) {
    return {
      profesi_sdmk: 'Dokter Umum',
      jabatan_spesifik: 'Dokter Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('bidan') || combined.includes('kebidanan')) {
    const isAhli = combined.includes('s1') || combined.includes('profesi') || combined.includes('d4');
    return {
      profesi_sdmk: 'Bidan',
      jabatan_spesifik: isAhli ? 'Bidan Ahli Pertama' : 'Bidan Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: isAhli ? 'Ahli Pertama' : 'Terampil',
    };
  }
  if (combined.includes('apoteker') || (combined.includes('farmasi') && (combined.includes('s1') || combined.includes('profesi')))) {
    return {
      profesi_sdmk: 'Tenaga Farmasi (Apoteker / TTK)',
      jabatan_spesifik: 'Apoteker Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('farmasi') || combined.includes('ttk')) {
    return {
      profesi_sdmk: 'Tenaga Farmasi (Apoteker / TTK)',
      jabatan_spesifik: 'Asisten Apoteker Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('analis kesehatan') || combined.includes('tlm') || combined.includes('laboratorium')) {
    return {
      profesi_sdmk: 'Pranata Laboratorium Kesehatan (ATLM)',
      jabatan_spesifik: 'Pranata Laboratorium Kesehatan Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('gizi') || combined.includes('nutrisi') || combined.includes('dietisien')) {
    const isAhli = combined.includes('s1') || combined.includes('profesi');
    return {
      profesi_sdmk: 'Nutrisionis / Dietisien',
      jabatan_spesifik: isAhli ? 'Nutrisionis Ahli Pertama' : 'Nutrisionis Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: isAhli ? 'Ahli Pertama' : 'Terampil',
    };
  }
  if (combined.includes('sanitasi') || combined.includes('kesling') || combined.includes('kesehatan lingkungan')) {
    return {
      profesi_sdmk: 'Tenaga Sanitasi Lingkungan / Sanitarian',
      jabatan_spesifik: 'Tenaga Sanitasi Lingkungan Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('rekam medis') || combined.includes('rmik') || combined.includes('mik')) {
    return {
      profesi_sdmk: 'Perekam Medis & Informasi Kesehatan',
      jabatan_spesifik: 'Perekam Medis Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('radiologi') || combined.includes('radiografer')) {
    return {
      profesi_sdmk: 'Radiografer / Teknisi Medis',
      jabatan_spesifik: 'Radiografer Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('fisioterapi')) {
    return {
      profesi_sdmk: 'Fisioterapis',
      jabatan_spesifik: 'Fisioterapis Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('epidemiologi')) {
    return {
      profesi_sdmk: 'Epidemiolog Kesehatan',
      jabatan_spesifik: 'Epidemiolog Kesehatan Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('promkes') || combined.includes('promosi kesehatan')) {
    return {
      profesi_sdmk: 'Penyuluh Kesehatan Masyarakat / Promkes',
      jabatan_spesifik: 'Tenaga Promosi Kesehatan dan Ilmu Perilaku Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('kesmas') || combined.includes('kesehatan masyarakat')) {
    return {
      profesi_sdmk: 'Administrator Kesehatan',
      jabatan_spesifik: 'Administrator Kesehatan Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('anestesi')) {
    return {
      profesi_sdmk: 'Penata Anestesi',
      jabatan_spesifik: 'Penata Anestesi Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Terampil',
    };
  }
  if (combined.includes('informatika') || combined.includes('komputer') || combined.includes('sistem informasi')) {
    return {
      profesi_sdmk: 'Pranata Komputer / IT',
      jabatan_spesifik: 'Pranata Komputer Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('akuntansi') || combined.includes('keuangan') || combined.includes('ekonomi')) {
    return {
      profesi_sdmk: 'Analis Keuangan / Perencana',
      jabatan_spesifik: 'Analis Keuangan',
      jenis_jabatan: 'Pelaksana',
    };
  }
  if (combined.includes('hukum') || combined.includes('administrasi negara') || combined.includes('pemerintahan')) {
    return {
      profesi_sdmk: 'Analis SDM Aparatur / Kepegawaian',
      jabatan_spesifik: 'Analis SDM Aparatur Ahli Pertama',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: 'Ahli Pertama',
    };
  }
  if (combined.includes('perawat') || combined.includes('keperawatan') || combined.includes('ners')) {
    const isAhli = combined.includes('s1') || combined.includes('ners') || combined.includes('profesi');
    return {
      profesi_sdmk: 'Perawat',
      jabatan_spesifik: isAhli ? 'Perawat Ahli Pertama' : 'Perawat Terampil',
      jenis_jabatan: 'Fungsional',
      jenjang_jabatan: isAhli ? 'Ahli Pertama' : 'Terampil',
    };
  }

  return null;
}
