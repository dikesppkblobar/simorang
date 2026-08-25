import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AlertKGBItem,
  AlertPangkatItem,
  AlertPensiunItem,
  AlertKP4AnakItem,
} from '../types';

/**
 * Validasi NIP ASN 18 Digit Murni
 * Format: YYYYMMDD (TGL LAHIR) YYYYMM (TMT CPNS) G (JENIS KELAMIN 1=L, 2=P) XXX (URUT)
 */
export function validateNIP(nip: string): {
  isValid: boolean;
  error?: string;
  parsedInfo?: { birthDate: string; cpnsDate: string; gender: 'L' | 'P' };
} {
  const cleanNip = nip.replace(/\s+/g, '');
  if (!/^\d{18}$/.test(cleanNip)) {
    return {
      isValid: false,
      error: 'NIP wajib terdiri dari 18 digit angka murni tanpa spasi atau karakter khusus.',
    };
  }

  const yearStr = cleanNip.substring(0, 4);
  const monthStr = cleanNip.substring(4, 6);
  const dayStr = cleanNip.substring(6, 8);
  const cpnsYearStr = cleanNip.substring(8, 12);
  const cpnsMonthStr = cleanNip.substring(12, 14);
  const genderDigit = cleanNip.substring(14, 15);

  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const cpnsMonth = parseInt(cpnsMonthStr, 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, error: 'Format tanggal lahir pada NIP (digit 1-8) tidak valid.' };
  }

  if (cpnsMonth < 1 || cpnsMonth > 12) {
    return { isValid: false, error: 'Format TMT CPNS pada NIP (digit 9-14) tidak valid.' };
  }

  if (genderDigit !== '1' && genderDigit !== '2') {
    return { isValid: false, error: 'Digit jenis kelamin pada NIP (digit 15) harus 1 (Pria) atau 2 (Wanita).' };
  }

  const birthDateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
  const cpnsDateStr = `${cpnsYearStr}-${cpnsMonthStr.padStart(2, '0')}-01`;

  return {
    isValid: true,
    parsedInfo: {
      birthDate: birthDateStr,
      cpnsDate: cpnsDateStr,
      gender: genderDigit === '1' ? 'L' : 'P',
    },
  };
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function getMonthsBetween(startDate: Date, endDate: Date): number {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Menghitung Daftar Alert KGB (Siklus 2 Tahun / 24 Bulan)
 * Alert terpicu jika TMT KGB terakhir > 21 bulan yang lalu (H-3 Bulan)
 */
export function calculateKgbAlerts(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[],
  referenceDateStr?: string
): AlertKGBItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const activePegawai = pegawaiList.filter((p) => !p.is_deleted);
  const alerts: AlertKGBItem[] = [];

  for (const pegawai of activePegawai) {
    // Cari SK KGB terakhir
    const kgbSkList = skList
      .filter((s) => s.nip_pegawai === pegawai.nip && s.jenis_sk === 'KGB')
      .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

    const tmtKgbTerakhir = kgbSkList.length > 0 ? kgbSkList[0].tmt_berlaku : pegawai.tmt_cpns;
    const tmtDate = parseDate(tmtKgbTerakhir);

    // Tanggal jatuh tempo = TMT + 2 Tahun
    const jatuhTempoDate = new Date(tmtDate);
    jatuhTempoDate.setFullYear(jatuhTempoDate.getFullYear() + 2);

    const elapsedMonths = getMonthsBetween(tmtDate, refDate);
    const sisaBulan = getMonthsBetween(refDate, jatuhTempoDate);
    const sisaHari = getDaysBetween(refDate, jatuhTempoDate);

    // Terpicu jika sudah berjalan >= 21 bulan (sisa_bulan <= 3)
    if (elapsedMonths >= 21 || sisaBulan <= 3) {
      let status: 'Bahaya' | 'Peringatan' | 'Aman' = 'Peringatan';
      if (sisaBulan <= 0) {
        status = 'Bahaya'; // Sudah lewat jatuh tempo
      } else if (sisaBulan <= 3) {
        status = 'Peringatan';
      }

      alerts.push({
        nip: pegawai.nip,
        nama_lengkap: pegawai.nama_lengkap,
        unit_kerja: pegawai.unit_kerja,
        jenis_jabatan: pegawai.jenis_jabatan,
        tmt_kgb_terakhir: tmtKgbTerakhir,
        tanggal_jatuh_tempo: formatDate(jatuhTempoDate),
        sisa_bulan: sisaBulan,
        sisa_hari: sisaHari,
        status_alert: status,
      });
    }
  }

  return alerts.sort((a, b) => a.sisa_bulan - b.sisa_bulan);
}

/**
 * Menghitung Periode BKN Terdekat (6 Periode: Feb, Apr, Jun, Ags, Okt, Des)
 */
export function getPeriodeBknTerdekat(targetDate: Date): string {
  const bknMonths = [1, 3, 5, 7, 9, 11]; // 0-indexed: Feb(1), Apr(3), Jun(5), Ags(7), Okt(9), Des(11)
  const bknNames = ['Februari', 'April', 'Juni', 'Agustus', 'Oktober', 'Desember'];

  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  for (let i = 0; i < bknMonths.length; i++) {
    if (month <= bknMonths[i]) {
      return `Periode ${bknNames[i]} ${year}`;
    }
  }
  return `Periode Februari ${year + 1}`;
}

/**
 * Menghitung Daftar Alert Kenaikan Pangkat (Siklus 4 Tahun / 48 Bulan)
 * Alert terpicu jika TMT Pangkat terakhir > 45 bulan yang lalu (H-3 Bulan)
 */
export function calculatePangkatAlerts(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[],
  referenceDateStr?: string
): AlertPangkatItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const activePegawai = pegawaiList.filter((p) => !p.is_deleted && p.status_kepegawaian === 'PNS');
  const alerts: AlertPangkatItem[] = [];

  for (const pegawai of activePegawai) {
    const pangkatSkList = skList
      .filter((s) => s.nip_pegawai === pegawai.nip && s.jenis_sk === 'Pangkat')
      .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

    const tmtPangkatTerakhir = pangkatSkList.length > 0 ? pangkatSkList[0].tmt_berlaku : pegawai.tmt_cpns;
    const tmtDate = parseDate(tmtPangkatTerakhir);

    // Tanggal jatuh tempo = TMT + 4 Tahun
    const jatuhTempoDate = new Date(tmtDate);
    jatuhTempoDate.setFullYear(jatuhTempoDate.getFullYear() + 4);

    const elapsedMonths = getMonthsBetween(tmtDate, refDate);
    const sisaBulan = getMonthsBetween(refDate, jatuhTempoDate);

    // Alert terpicu jika elapsed >= 45 bulan (H-3 Bulan)
    if (elapsedMonths >= 45 || sisaBulan <= 3) {
      let status: 'Bahaya' | 'Peringatan' | 'Aman' = 'Peringatan';
      if (sisaBulan <= 0) {
        status = 'Bahaya';
      }

      alerts.push({
        nip: pegawai.nip,
        nama_lengkap: pegawai.nama_lengkap,
        unit_kerja: pegawai.unit_kerja,
        jenis_jabatan: pegawai.jenis_jabatan,
        status_ukom: pegawai.status_ukom,
        tmt_pangkat_terakhir: tmtPangkatTerakhir,
        tanggal_jatuh_tempo: formatDate(jatuhTempoDate),
        periode_bkn_terdekat: getPeriodeBknTerdekat(jatuhTempoDate),
        sisa_bulan: sisaBulan,
        status_alert: status,
      });
    }
  }

  return alerts.sort((a, b) => a.sisa_bulan - b.sisa_bulan);
}

/**
 * Menghitung Batas Usia Pensiun (BUP)
 * Pelaksana: 58 thn, Fungsional: 60 thn (Utama 65), Struktural: 58/60 thn
 */
export function getBUP(jenisJabatan: string, jabatanSpesifik: string): number {
  if (jenisJabatan === 'Fungsional') {
    if (jabatanSpesifik.toLowerCase().includes('utama')) return 65;
    return 60;
  }
  if (jenisJabatan === 'Struktural') {
    if (jabatanSpesifik.toLowerCase().includes('kepala dinas') || jabatanSpesifik.toLowerCase().includes('eselon ii')) {
      return 60;
    }
    return 58;
  }
  return 58; // Pelaksana
}

/**
 * Menghitung Alert Pensiun & Akhir Masa Kontrak (PNS, PPPK, Non-ASN)
 */
export function calculatePensiunAlerts(
  pegawaiList: Pegawai[],
  referenceDateStr?: string
): AlertPensiunItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const activePegawai = pegawaiList.filter((p) => !p.is_deleted);
  const alerts: AlertPensiunItem[] = [];

  for (const pegawai of activePegawai) {
    const birthDate = parseDate(pegawai.tanggal_lahir);
    const umurSaatIni = parseFloat((getMonthsBetween(birthDate, refDate) / 12).toFixed(1));

    if (pegawai.status_kepegawaian === 'PNS') {
      const bup = getBUP(pegawai.jenis_jabatan, pegawai.jabatan_spesifik);
      const pensiunDate = new Date(birthDate);
      pensiunDate.setFullYear(pensiunDate.getFullYear() + bup);

      const sisaBulan = getMonthsBetween(refDate, pensiunDate);

      // Terpicu jika sisa waktu pensiun <= 18 bulan
      if (sisaBulan <= 18) {
        alerts.push({
          nip: pegawai.nip,
          nama_lengkap: pegawai.nama_lengkap,
          unit_kerja: pegawai.unit_kerja,
          jenis_jabatan: pegawai.jenis_jabatan,
          status_kepegawaian: pegawai.status_kepegawaian,
          tanggal_lahir: pegawai.tanggal_lahir,
          umur_saat_ini: umurSaatIni,
          batas_usia_pensiun: bup,
          tanggal_pensiun: formatDate(pensiunDate),
          sisa_bulan: sisaBulan,
          status_alert: sisaBulan <= 6 ? 'Segera BUP Pensiun' : 'Persiapan DPCP Pensiun',
        });
      }
    } else if (
      pegawai.status_kepegawaian === 'PPPK Penuh Waktu' ||
      pegawai.status_kepegawaian === 'PPPK Paruh Waktu'
    ) {
      let expiryDateStr = pegawai.tmt_perjanjian_selesai;
      if (!expiryDateStr) {
        if (pegawai.tmt_cpns) {
          const startDate = parseDate(pegawai.tmt_cpns);
          const expDate = new Date(startDate);
          expDate.setFullYear(expDate.getFullYear() + 5);
          expiryDateStr = formatDate(expDate);
        } else {
          const expDate = new Date(refDate);
          expDate.setMonth(expDate.getMonth() + 6);
          expiryDateStr = formatDate(expDate);
        }
      }

      const expDate = parseDate(expiryDateStr);
      const sisaBulan = getMonthsBetween(refDate, expDate);

      if (sisaBulan <= 18) {
        alerts.push({
          nip: pegawai.nip,
          nama_lengkap: pegawai.nama_lengkap,
          unit_kerja: pegawai.unit_kerja,
          jenis_jabatan: pegawai.jenis_jabatan,
          status_kepegawaian: pegawai.status_kepegawaian,
          tanggal_lahir: pegawai.tanggal_lahir,
          umur_saat_ini: umurSaatIni,
          batas_usia_pensiun: 5, // Masa Perjanjian Kontrak (5 thn)
          tanggal_pensiun: expiryDateStr,
          sisa_bulan: sisaBulan,
          status_alert: sisaBulan <= 6 ? 'Habis Kontrak PPPK (Evaluasi Kinerja)' : 'Persiapan Perpanjangan Kontrak PPPK',
        });
      }
    } else if (pegawai.status_kepegawaian === 'Non-ASN') {
      let expiryDateStr = pegawai.tmt_perjanjian_selesai;
      if (!expiryDateStr) {
        if (pegawai.tmt_cpns) {
          const startDate = parseDate(pegawai.tmt_cpns);
          const expDate = new Date(startDate);
          expDate.setFullYear(expDate.getFullYear() + 1);
          expiryDateStr = formatDate(expDate);
        } else {
          const expDate = new Date(refDate);
          expDate.setMonth(expDate.getMonth() + 3);
          expiryDateStr = formatDate(expDate);
        }
      }

      const expDate = parseDate(expiryDateStr);
      const sisaBulan = getMonthsBetween(refDate, expDate);

      if (sisaBulan <= 18) {
        alerts.push({
          nip: pegawai.nip,
          nama_lengkap: pegawai.nama_lengkap,
          unit_kerja: pegawai.unit_kerja,
          jenis_jabatan: pegawai.jenis_jabatan,
          status_kepegawaian: pegawai.status_kepegawaian,
          tanggal_lahir: pegawai.tanggal_lahir,
          umur_saat_ini: umurSaatIni,
          batas_usia_pensiun: 1, // Kontrak Tahunan Non-ASN
          tanggal_pensiun: expiryDateStr,
          sisa_bulan: sisaBulan,
          status_alert: sisaBulan <= 3 ? 'Habis Kontrak Non-ASN (Evaluasi)' : 'Persiapan Pembaharuan SK Kontrak',
        });
      }
    }
  }

  return alerts.sort((a, b) => a.sisa_bulan - b.sisa_bulan);
}

/**
 * Menghitung Alert KP4 Anak (Batas 21 Tahun tanpa surat kuliah, Batas 25 Tahun batas maksimal)
 */
export function calculateKp4AnakAlerts(
  pegawaiList: Pegawai[],
  keluargaList: KeluargaKP4[],
  referenceDateStr?: string
): AlertKP4AnakItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const activePegawaiMap = new Map(
    pegawaiList.filter((p) => !p.is_deleted).map((p) => [p.nip, p])
  );

  const anakList = keluargaList.filter(
    (k) => k.status_hubungan === 'Anak' && k.status_tanggungan && activePegawaiMap.has(k.nip_pegawai)
  );

  const alerts: AlertKP4AnakItem[] = [];

  for (const anak of anakList) {
    const pegawai = activePegawaiMap.get(anak.nip_pegawai)!;
    const birthDate = parseDate(anak.tanggal_lahir);
    const totalMonths = getMonthsBetween(birthDate, refDate);

    const umurTahun = Math.floor(totalMonths / 12);
    const umurBulan = totalMonths % 12;

    const hasSuratKuliah = Boolean(anak.surat_ket_kuliah_url && anak.surat_ket_kuliah_url.trim().length > 0);

    // Kasus 1: Tanpa Surat Kuliah & Umur > 20 Tahun 9 Bulan (249 Bulan)
    if (!hasSuratKuliah && totalMonths >= 249) {
      alerts.push({
        id: anak.id,
        nip_pegawai: pegawai.nip,
        nama_pegawai: pegawai.nama_lengkap,
        nama_anak: anak.nama_keluarga,
        tanggal_lahir_anak: anak.tanggal_lahir,
        umur_tahun: umurTahun,
        umur_bulan: umurBulan,
        status_tanggungan: anak.status_tanggungan,
        surat_ket_kuliah_url: anak.surat_ket_kuliah_url,
        kategori_alert: 'Batas 21 Tahun (Tanpa Surat Kuliah)',
        rekomendasi_aksi:
          'Unggah Surat Keterangan Kuliah aktif jika anak masih berkuliah, atau ubah status tanggungan menjadi non-aktif untuk mencegah temuan BPK.',
      });
    }
    // Kasus 2: Ada Surat Kuliah & Umur > 24 Tahun 9 Bulan (297 Bulan) - Batas Maksimal 25 Thn
    else if (hasSuratKuliah && totalMonths >= 297) {
      alerts.push({
        id: anak.id,
        nip_pegawai: pegawai.nip,
        nama_pegawai: pegawai.nama_lengkap,
        nama_anak: anak.nama_keluarga,
        tanggal_lahir_anak: anak.tanggal_lahir,
        umur_tahun: umurTahun,
        umur_bulan: umurBulan,
        status_tanggungan: anak.status_tanggungan,
        surat_ket_kuliah_url: anak.surat_ket_kuliah_url,
        kategori_alert: 'Batas 25 Tahun (Maksimal Tanggungan)',
        rekomendasi_aksi:
          'Anak telah mendekati/mencapai usia maksimal 25 tahun. Wajib segera dikeluarkan dari daftar tanggungan tunjangan KP4.',
      });
    }
  }

  return alerts.sort((a, b) => b.umur_tahun * 12 + b.umur_bulan - (a.umur_tahun * 12 + a.umur_bulan));
}

/**
 * Validasi NIK 16 Digit Murni
 */
export function validateNIK(nik: string): { isValid: boolean; error?: string } {
  const cleanNik = nik.trim();
  if (!/^\d{16}$/.test(cleanNik)) {
    return {
      isValid: false,
      error: 'NIK wajib diisi 16 digit angka murni tanpa spasi atau karakter khusus.',
    };
  }
  return { isValid: true };
}

export const PANGKAT_GOLONGAN_MAP: Record<string, string> = {
  'I/a': 'Juru Muda',
  'I/b': 'Juru Muda Tingkat I',
  'I/c': 'Juru',
  'I/d': 'Juru Tingkat I',
  'II/a': 'Pengatur Muda',
  'II/b': 'Pengatur Muda Tingkat I',
  'II/c': 'Pengatur',
  'II/d': 'Pengatur Tingkat I',
  'III/a': 'Penata Muda',
  'III/b': 'Penata Muda Tingkat I',
  'III/c': 'Penata',
  'III/d': 'Penata Tingkat I',
  'IV/a': 'Pembina',
  'IV/b': 'Pembina Tingkat I',
  'IV/c': 'Pembina Utama Muda',
  'IV/d': 'Pembina Utama Madya',
  'IV/e': 'Pembina Utama',
};

const NEXT_GOLONGAN_MAP: Record<string, string> = {
  'I/a': 'I/b',
  'I/b': 'I/c',
  'I/c': 'I/d',
  'I/d': 'II/a',
  'II/a': 'II/b',
  'II/b': 'II/c',
  'II/c': 'II/d',
  'II/d': 'III/a',
  'III/a': 'III/b',
  'III/b': 'III/c',
  'III/c': 'III/d',
  'III/d': 'IV/a',
  'IV/a': 'IV/b',
  'IV/b': 'IV/c',
  'IV/c': 'IV/d',
  'IV/d': 'IV/e',
  'IV/e': 'IV/e',
};

export function getPangkatNameByGolongan(golongan: string): string {
  return PANGKAT_GOLONGAN_MAP[golongan] || '-';
}

export function getProyeksiKenaikanPangkat(golongan?: string, tmtGolongan?: string): string {
  if (!golongan || !tmtGolongan) return 'Data Golongan / TMT Pangkat belum lengkap';
  const nextGol = NEXT_GOLONGAN_MAP[golongan];
  if (!nextGol || nextGol === golongan) return 'Sudah mencapai Pangkat Tertinggi (IV/e)';
  const nextPangkatName = PANGKAT_GOLONGAN_MAP[nextGol];
  const tmtDate = parseDate(tmtGolongan);
  const targetYear = tmtDate.getFullYear() + 4;
  const month = tmtDate.getMonth() + 1;
  const periodeBkn = month <= 4 ? `April ${targetYear}` : `Oktober ${targetYear}`;
  return `Proyeksi Kenaikan Pangkat ke ${nextGol} (${nextPangkatName}) - Periode BKN ${periodeBkn}`;
}

/**
 * Memeriksa apakah suatu kategori unit kerja termasuk dalam kategori 'Dinas' / 'Dinas Kesehatan'
 */
export function isDinasCategory(kategori?: string): boolean {
  if (!kategori) return false;
  const k = kategori.toLowerCase().trim();
  return (
    k === 'dinas' ||
    k === 'dinas kesehatan' ||
    k.includes('dinas') ||
    k.includes('dikes') ||
    k.includes('dinkes')
  );
}

/**
 * Memeriksa apakah cakupan (scope) saat ini adalah Dinas Kesehatan
 */
export function isDinasScope(scope?: string): boolean {
  if (!scope) return false;
  const s = scope.toLowerCase().trim();
  return (
    s === 'dinas' ||
    s === 'dinas kesehatan' ||
    s === 'dinas kesehatan kab. lombok barat' ||
    s === 'semual_dinas' ||
    s.includes('dinas kesehatan') ||
    s.includes('dikes') ||
    s.includes('dinkes')
  );
}

