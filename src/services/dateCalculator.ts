import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AlertKGBItem,
  AlertPangkatItem,
  AlertPensiunItem,
  AlertJafungItem,
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
 * Mengambil TMT Pangkat / Golongan yang akurat dan tersinkronisasi
 * Prioritas: tmt_pangkat_terakhir -> tmt_golongan -> SK Pangkat Terakhir -> tmt_cpns
 */
export function getPegawaiTmtPangkat(pegawai: Pegawai, skList: RiwayatSK[] = []): string {
  if (pegawai.tmt_pangkat_terakhir && pegawai.tmt_pangkat_terakhir.trim() !== '') {
    return pegawai.tmt_pangkat_terakhir;
  }
  if (pegawai.tmt_golongan && pegawai.tmt_golongan.trim() !== '') {
    return pegawai.tmt_golongan;
  }
  const pangkatSkList = skList
    .filter((s) => (s.nip_pegawai === pegawai.nip || (s as any).nip === pegawai.nip) && s.jenis_sk === 'Pangkat' && s.tmt_berlaku)
    .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

  if (pangkatSkList.length > 0 && pangkatSkList[0].tmt_berlaku) {
    return pangkatSkList[0].tmt_berlaku;
  }
  if (pegawai.tmt_cpns) return pegawai.tmt_cpns;
  return new Date().toISOString().slice(0, 10);
}

/**
 * Mengambil TMT Kenaikan Gaji Berkala (KGB) yang akurat dan tersinkronisasi
 * Prioritas: tmt_kgb_terakhir (Data Pegawai) -> SK KGB Terakhir -> tmt_golongan -> tmt_pangkat_terakhir -> tmt_perjanjian_mulai -> tmt_cpns
 */
export function getPegawaiTmtKgb(pegawai: Pegawai, skList: RiwayatSK[] = []): string {
  if (pegawai.tmt_kgb_terakhir && pegawai.tmt_kgb_terakhir.trim() !== '') {
    return pegawai.tmt_kgb_terakhir;
  }
  const kgbSkList = skList
    .filter((s) => (s.nip_pegawai === pegawai.nip || (s as any).nip === pegawai.nip) && s.jenis_sk === 'KGB' && s.tmt_berlaku)
    .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

  if (kgbSkList.length > 0 && kgbSkList[0].tmt_berlaku) {
    return kgbSkList[0].tmt_berlaku;
  }
  if (pegawai.tmt_golongan) return pegawai.tmt_golongan;
  if (pegawai.tmt_pangkat_terakhir) return pegawai.tmt_pangkat_terakhir;
  if (pegawai.tmt_perjanjian_mulai) return pegawai.tmt_perjanjian_mulai;
  if (pegawai.tmt_cpns) return pegawai.tmt_cpns;
  return new Date().toISOString().slice(0, 10);
}

/**
 * Mengambil TMT Jabatan Fungsional yang tersinkronisasi
 * Prioritas: tmt_jafung (Data Pegawai) -> tmt_jabatan_pns -> SK Jafung Terakhir -> tmt_golongan -> tmt_cpns
 */
export function getPegawaiTmtJafung(pegawai: Pegawai, skList: RiwayatSK[] = []): string {
  if (pegawai.tmt_jafung && pegawai.tmt_jafung.trim() !== '') {
    return pegawai.tmt_jafung;
  }
  if (pegawai.tmt_jabatan_pns && pegawai.tmt_jabatan_pns.trim() !== '') {
    return pegawai.tmt_jabatan_pns;
  }
  const jafungSkList = skList
    .filter((s) => (s.nip_pegawai === pegawai.nip || (s as any).nip === pegawai.nip) && s.jenis_sk === 'Jafung_PAK' && s.tmt_berlaku)
    .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

  if (jafungSkList.length > 0 && jafungSkList[0].tmt_berlaku) {
    return jafungSkList[0].tmt_berlaku;
  }
  if (pegawai.tmt_golongan) return pegawai.tmt_golongan;
  if (pegawai.tmt_cpns) return pegawai.tmt_cpns;
  return new Date().toISOString().slice(0, 10);
}

/**
 * Menghitung Daftar Alert KGB (Siklus 2 Tahun / 24 Bulan)
 * HANYA menampilkan alert pegawai yang H-3 Bulan (sisa_bulan <= 3) menuju jatuh tempo di tahun berjalan atau yang sudah jatuh tempo sebelumnya.
 */
export function calculateKgbAlerts(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[],
  referenceDateStr?: string
): AlertKGBItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const currentYear = refDate.getFullYear();
  const activePegawai = pegawaiList.filter((p) => !p.is_deleted && p.status_kepegawaian === 'PNS');
  const alerts: AlertKGBItem[] = [];

  for (const pegawai of activePegawai) {
    const tmtKgbTerakhir = getPegawaiTmtKgb(pegawai, skList);
    const tmtDate = parseDate(tmtKgbTerakhir);

    // Tanggal jatuh tempo = TMT + 2 Tahun
    const jatuhTempoDate = new Date(tmtDate);
    jatuhTempoDate.setFullYear(jatuhTempoDate.getFullYear() + 2);

    const elapsedMonths = getMonthsBetween(tmtDate, refDate);
    const sisaBulan = getMonthsBetween(refDate, jatuhTempoDate);
    const sisaHari = getDaysBetween(refDate, jatuhTempoDate);

    // Saring HANYA pegawai yang H-3 Bulan (sisaBulan <= 3 atau elapsedMonths >= 21) pada tahun berjalan atau overdue sebelumnya
    const isTahunBerjalanOrOverdue = jatuhTempoDate.getFullYear() <= currentYear || sisaBulan <= 3;

    if (isTahunBerjalanOrOverdue && (sisaBulan <= 3 || elapsedMonths >= 21 || sisaHari <= 90)) {
      let status: 'Bahaya' | 'Peringatan' | 'Aman' = 'Peringatan';
      if (sisaBulan <= 0 || sisaHari <= 0) {
        status = 'Bahaya'; // Sudah lewat / jatuh tempo saat ini
      } else if (sisaBulan <= 3) {
        status = 'Peringatan'; // H-3 Bulan
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

export const PANGKAT_HIERARCHY: Record<string, { nama: string; next: string; nextNama: string }> = {
  'I/a': { nama: 'Juru Muda', next: 'I/b', nextNama: 'Juru Muda Tk. I' },
  'I/b': { nama: 'Juru Muda Tk. I', next: 'I/c', nextNama: 'Juru' },
  'I/c': { nama: 'Juru', next: 'I/d', nextNama: 'Juru Tk. I' },
  'I/d': { nama: 'Juru Tk. I', next: 'II/a', nextNama: 'Pengatur Muda' },
  'II/a': { nama: 'Pengatur Muda', next: 'II/b', nextNama: 'Pengatur Muda Tk. I' },
  'II/b': { nama: 'Pengatur Muda Tk. I', next: 'II/c', nextNama: 'Pengatur' },
  'II/c': { nama: 'Pengatur', next: 'II/d', nextNama: 'Pengatur Tk. I' },
  'II/d': { nama: 'Pengatur Tk. I', next: 'III/a', nextNama: 'Penata Muda' },
  'III/a': { nama: 'Penata Muda', next: 'III/b', nextNama: 'Penata Muda Tk. I' },
  'III/b': { nama: 'Penata Muda Tk. I', next: 'III/c', nextNama: 'Penata' },
  'III/c': { nama: 'Penata', next: 'III/d', nextNama: 'Penata Tk. I' },
  'III/d': { nama: 'Penata Tk. I', next: 'IV/a', nextNama: 'Pembina' },
  'IV/a': { nama: 'Pembina', next: 'IV/b', nextNama: 'Pembina Tk. I' },
  'IV/b': { nama: 'Pembina Tk. I', next: 'IV/c', nextNama: 'Pembina Utama Muda' },
  'IV/c': { nama: 'Pembina Utama Muda', next: 'IV/d', nextNama: 'Pembina Utama Madya' },
  'IV/d': { nama: 'Pembina Utama Madya', next: 'IV/e', nextNama: 'Pembina Utama' },
  'IV/e': { nama: 'Pembina Utama', next: 'IV/e', nextNama: 'Pembina Utama' },
};

/**
 * Menghitung detail jalur kenaikan pangkat, golongan tujuan, dan status syarat khusus
 */
export function getPangkatProgressionDetail(pegawai: Pegawai) {
  const gol = (pegawai.golongan_pangkat || 'III/a').trim();
  const info = PANGKAT_HIERARCHY[gol] || {
    nama: pegawai.nama_pangkat || 'Penata Muda',
    next: 'III/b',
    nextNama: 'Penata Muda Tk. I',
  };

  const namaPangkatSekarang = pegawai.nama_pangkat || info.nama;
  const golTujuan = info.next;
  const namaPangkatTujuan = info.nextNama;

  const isS1OrAbove =
    Boolean(pegawai.pendidikan_terakhir && /s-?1|sarjana|s-?2|magister|s-?3|doktor/i.test(pegawai.pendidikan_terakhir)) ||
    pegawai.status_ujian_dinas === 'Penyesuaian Ijazah';

  const isTugasBelajar =
    pegawai.status_izin_belajar ||
    pegawai.status_ujian_dinas === 'Penyesuaian Ijazah' ||
    pegawai.status_pencantuman_gelar === 'Proses Verval' ||
    pegawai.status_pencantuman_gelar === 'Terverifikasi BKN' ||
    Boolean(pegawai.nama_universitas_pt && pegawai.nama_universitas_pt.trim() !== '');

  // 1. STRUKTURAL: Tidak butuh UKOM/Ujian Dinas, melainkan validasi Diklat Kepemimpinan (Diklatpim/PKP/PKA), SPMT Jabatan >= 1 Thn, dan SKP 2 Thn Baik
  if (pegawai.jenis_jabatan === 'Struktural') {
    // Eselon III / Administrator (III/d -> IV/a atau IV/a -> IV/b) butuh PKA / Diklatpim III
    // Eselon IV / Pengawas (III/c -> III/d) butuh PKP / Diklatpim IV
    const isPkaLevel = gol === 'III/d' || gol === 'IV/a' || gol === 'IV/b';
    const diklatBadgeLabel = isPkaLevel ? 'Diklatpim / PKA' : 'Diklatpim / PKP';
    const jabatanLabel = pegawai.jabatan_spesifik || 'Pejabat Struktural';

    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: golTujuan,
      namaPangkatTujuan,
      jalurKenaikanText: `${gol} → ${golTujuan}`,
      subtextJalur: `Struktural (${jabatanLabel})`,
      syaratKhususType: 'struktural' as const,
      syaratKhususBadgeText: diklatBadgeLabel,
      syaratKhususStatus: 'perlu' as const,
      syaratKhususDesc: 'Lulus Diklat Kepemimpinan (PKA/PKP), Masa Jabatan Struktural >= 1 Thn, SKP 2 Thn Baik',
    };
  }

  // 2. PELAKSANA II/d -> III/a
  if (pegawai.jenis_jabatan === 'Pelaksana' && gol === 'II/d') {
    const jabatanLabel = pegawai.jabatan_spesifik || 'Pelaksana';
    // Jika ada peningkatan kualifikasi ijazah S1 / Penyesuaian Ijazah
    if (isS1OrAbove || isTugasBelajar) {
      const isVervalDone = pegawai.status_pencantuman_gelar === 'Terverifikasi BKN';
      return {
        golonganSekarang: gol,
        namaPangkatSekarang,
        golonganTujuan: 'III/a',
        namaPangkatTujuan: 'Penata Muda',
        jalurKenaikanText: `${gol} → III/a`,
        subtextJalur: `Pelaksana (${jabatanLabel})`,
        syaratKhususType: 'tugas_belajar' as const,
        syaratKhususBadgeText: isVervalDone ? 'Syarat Lengkap' : 'Validasi S1',
        syaratKhususStatus: (isVervalDone ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
        syaratKhususDesc: isVervalDone
          ? 'Gelar & Ijazah S1 Terverifikasi BKN'
          : 'Wajib Verval Ijazah S1 & SK Izin Belajar / BKN untuk Penyesuaian Ijazah',
      };
    }

    // Reguler II/d ke III/a wajib Ujian Dinas (STLUD Tk. I)
    const isStludLulus =
      pegawai.status_ujian_dinas === 'Lulus STLUD' ||
      Boolean(pegawai.no_stlud && pegawai.no_stlud.trim() !== '');
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: 'III/a',
      namaPangkatTujuan: 'Penata Muda',
      jalurKenaikanText: `${gol} → III/a`,
      subtextJalur: `Pelaksana (${jabatanLabel})`,
      syaratKhususType: 'ujian_dinas' as const,
      syaratKhususBadgeText: isStludLulus ? 'Syarat Lengkap' : 'Wajib Ujian Dinas',
      syaratKhususStatus: (isStludLulus ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
      syaratKhususDesc: isStludLulus
        ? `Lulus Ujian Dinas Tk. I (STLUD: ${pegawai.no_stlud || 'Terdata'})`
        : 'Wajib Lulus Ujian Dinas Tingkat I (STLUD) untuk pindah Golongan II ke III',
    };
  }

  // 3. FUNGSIONAL II/d -> III/a (Wajib UKOM Alih Kategori Keterampilan ke Keahlian)
  if (pegawai.jenis_jabatan === 'Fungsional' && gol === 'II/d') {
    const isUkomLulus = Boolean(pegawai.status_ukom || pegawai.status_ukkj === 'Lulus UKKJ');
    const jabatanLabel = pegawai.jabatan_spesifik || 'Kategori Keterampilan';
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: 'III/a',
      namaPangkatTujuan: 'Penata Muda',
      jalurKenaikanText: `${gol} → III/a`,
      subtextJalur: `Fungsional (${jabatanLabel})`,
      syaratKhususType: 'ukom' as const,
      syaratKhususBadgeText: isUkomLulus ? 'Syarat Lengkap' : 'Wajib UKOM',
      syaratKhususStatus: (isUkomLulus ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
      syaratKhususDesc: isUkomLulus
        ? 'Lulus Uji Kompetensi Alih Kategori Keterampilan ke Keahlian'
        : `Wajib UKOM Alih Kategori: ${jabatanLabel} → Keahlian (Ahli Pertama)`,
    };
  }

  // 4. FUNGSIONAL III/b -> III/c (Wajib UKOM Kenaikan Jenjang Ahli Pertama ke Ahli Muda)
  if (pegawai.jenis_jabatan === 'Fungsional' && gol === 'III/b') {
    const isUkomLulus = Boolean(pegawai.status_ukom || pegawai.status_ukkj === 'Lulus UKKJ');
    const jabatanLabel = pegawai.jabatan_spesifik || 'Ahli Pertama';
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: 'III/c',
      namaPangkatTujuan: 'Penata',
      jalurKenaikanText: `${gol} → III/c`,
      subtextJalur: `Fungsional (${jabatanLabel})`,
      syaratKhususType: 'ukom' as const,
      syaratKhususBadgeText: isUkomLulus ? 'Syarat Lengkap' : 'Wajib UKOM',
      syaratKhususStatus: (isUkomLulus ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
      syaratKhususDesc: isUkomLulus
        ? 'Lulus Uji Kompetensi Kenaikan Jenjang Ahli Muda'
        : 'Wajib Uji Kompetensi Kenaikan Jenjang (UKKJ) Ahli Pertama ke Ahli Muda',
    };
  }

  // 5. FUNGSIONAL III/d -> IV/a (Wajib UKOM Kenaikan Jenjang Ahli Muda ke Ahli Madya)
  if (pegawai.jenis_jabatan === 'Fungsional' && gol === 'III/d') {
    const isUkomLulus = Boolean(pegawai.status_ukom || pegawai.status_ukkj === 'Lulus UKKJ');
    const jabatanLabel = pegawai.jabatan_spesifik || 'Ahli Muda';
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: 'IV/a',
      namaPangkatTujuan: 'Pembina',
      jalurKenaikanText: `${gol} → IV/a`,
      subtextJalur: `Fungsional (${jabatanLabel})`,
      syaratKhususType: 'ukom' as const,
      syaratKhususBadgeText: isUkomLulus ? 'Syarat Lengkap' : 'Wajib UKOM',
      syaratKhususStatus: (isUkomLulus ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
      syaratKhususDesc: isUkomLulus
        ? 'Lulus Uji Kompetensi Kenaikan Jenjang Ahli Madya'
        : 'Wajib Uji Kompetensi Kenaikan Jenjang (UKKJ) Ahli Muda ke Ahli Madya',
    };
  }

  // 6. KASUS TUGAS BELAJAR / PENINGKATAN PENDIDIKAN DI LUAR II/d
  if (
    isTugasBelajar &&
    (pegawai.status_ujian_dinas === 'Penyesuaian Ijazah' ||
      pegawai.status_izin_belajar ||
      pegawai.status_pencantuman_gelar === 'Proses Verval')
  ) {
    const isVervalDone = pegawai.status_pencantuman_gelar === 'Terverifikasi BKN';
    const jabatanLabel = pegawai.jabatan_spesifik || pegawai.jenis_jabatan;
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: golTujuan,
      namaPangkatTujuan,
      jalurKenaikanText: `${gol} → ${golTujuan}`,
      subtextJalur: `${pegawai.jenis_jabatan} (${jabatanLabel})`,
      syaratKhususType: 'tugas_belajar' as const,
      syaratKhususBadgeText: isVervalDone ? 'Syarat Lengkap' : 'Validasi S1',
      syaratKhususStatus: (isVervalDone ? 'terpenuhi' : 'perlu') as 'terpenuhi' | 'perlu',
      syaratKhususDesc: isVervalDone
        ? 'Ijazah & Gelar Terverifikasi BKN'
        : 'Perlu Verval Ijazah & SK Izin Belajar / BKN',
    };
  }

  // 7. FUNGSIONAL REGULER DALAM JENJANG (misal III/a -> III/b, III/c -> III/d, IV/a -> IV/b)
  if (pegawai.jenis_jabatan === 'Fungsional') {
    const jabatanLabel = pegawai.jabatan_spesifik || 'Jabatan Fungsional';
    return {
      golonganSekarang: gol,
      namaPangkatSekarang,
      golonganTujuan: golTujuan,
      namaPangkatTujuan,
      jalurKenaikanText: `${gol} → ${golTujuan}`,
      subtextJalur: `Fungsional (${jabatanLabel})`,
      syaratKhususType: 'none' as const,
      syaratKhususBadgeText: 'Syarat Lengkap',
      syaratKhususStatus: 'terpenuhi' as const,
      syaratKhususDesc: 'Reguler Angka Kredit Konversi SKP / PAK Integrasi Memenuhi (Tanpa UKOM)',
    };
  }

  // 8. PELAKSANA REGULER LAINNYA (misal II/a -> II/b, II/b -> II/c, II/c -> II/d, I/a -> I/b)
  const jabatanLabel = pegawai.jabatan_spesifik || 'Pelaksana';
  return {
    golonganSekarang: gol,
    namaPangkatSekarang,
    golonganTujuan: golTujuan,
    namaPangkatTujuan,
    jalurKenaikanText: `${gol} → ${golTujuan}`,
    subtextJalur: `Pelaksana (${jabatanLabel})`,
    syaratKhususType: 'none' as const,
    syaratKhususBadgeText: 'Syarat Lengkap',
    syaratKhususStatus: 'terpenuhi' as const,
    syaratKhususDesc: 'Masa Kerja Golongan 4 Tahun Terpenuhi (SKP Baik/Sangat Baik)',
  };
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
 * Menghitung Periode BKN Singkat (Format: 'Okt 2026', 'Feb 2027')
 */
export function getPeriodeBknShort(targetDate: Date): string {
  const bknMonths = [1, 3, 5, 7, 9, 11]; // 0-indexed: Feb(1), Apr(3), Jun(5), Ags(7), Okt(9), Des(11)
  const bknShortNames = ['Feb', 'Apr', 'Jun', 'Ags', 'Okt', 'Des'];

  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  for (let i = 0; i < bknMonths.length; i++) {
    if (month <= bknMonths[i]) {
      return `${bknShortNames[i]} ${year}`;
    }
  }
  return `Feb ${year + 1}`;
}

/**
 * Menghitung Daftar Alert Kenaikan Pangkat (Siklus 4 Tahun / 48 Bulan)
 * Logika Alert Baru:
 * - H-3 Bulan: Jika periode usulan jatuh pada tahun berjalan dan berada di rentang 90 hari / <= 3 bulan (🔴 H-3 Bln (Bulan Tahun))
 * - Lewat Tempo: Jika tahun/tanggal target sudah terlewat (⚠️ Lewat Tempo (Bulan Tahun))
 * - Belum Waktunya: Jika belum masuk waktu usulan (⚪ Aman / Belum Waktunya)
 */
export function calculatePangkatAlerts(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[],
  referenceDateStr?: string
): AlertPangkatItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const currentYear = refDate.getFullYear();
  const activePegawai = pegawaiList.filter((p) => !p.is_deleted && p.status_kepegawaian === 'PNS');
  const alerts: AlertPangkatItem[] = [];

  for (const pegawai of activePegawai) {
    const tmtPangkatTerakhir = getPegawaiTmtPangkat(pegawai, skList);
    const tmtDate = parseDate(tmtPangkatTerakhir);

    // Tanggal jatuh tempo = TMT + 4 Tahun
    const jatuhTempoDate = new Date(tmtDate);
    jatuhTempoDate.setFullYear(jatuhTempoDate.getFullYear() + 4);

    const sisaBulan = getMonthsBetween(refDate, jatuhTempoDate);
    const targetYear = jatuhTempoDate.getFullYear();
    const shortPeriode = getPeriodeBknShort(jatuhTempoDate);
    const progression = getPangkatProgressionDetail(pegawai);

    // Penentuan Kategori Alert Baru:
    let alertBadgeType: 'h3' | 'overdue' | 'aman' = 'aman';
    let alertBadgeText = '⚪ Aman / Belum Waktunya';
    let statusAlert: 'Bahaya' | 'Peringatan' | 'Aman' = 'Aman';

    // 1. Lewat Tempo (Overdue) - jika tanggal jatuh tempo sudah lewat di masa lalu
    if (sisaBulan < 0 || (targetYear < currentYear && sisaBulan <= 0)) {
      alertBadgeType = 'overdue';
      alertBadgeText = `⚠️ Lewat Tempo (${shortPeriode})`;
      statusAlert = 'Bahaya';
    }
    // 2. H-3 Bulan (Periode Usulan Tahun Berjalan / Terdekat dalam rentang 90 hari)
    else if (sisaBulan >= 0 && sisaBulan <= 3) {
      alertBadgeType = 'h3';
      alertBadgeText = `🔴 H-3 Bln (${shortPeriode})`;
      statusAlert = 'Peringatan';
    }
    // 3. Belum Waktunya / Aman
    else {
      alertBadgeType = 'aman';
      alertBadgeText = '⚪ Aman / Belum Waktunya';
      statusAlert = 'Aman';
    }

    alerts.push({
      nip: pegawai.nip,
      nama_lengkap: pegawai.nama_lengkap,
      unit_kerja: pegawai.unit_kerja,
      jenis_jabatan: pegawai.jenis_jabatan,
      status_ukom: Boolean(pegawai.status_ukom || pegawai.status_ukkj === 'Lulus UKKJ'),
      tmt_pangkat_terakhir: tmtPangkatTerakhir,
      tanggal_jatuh_tempo: formatDate(jatuhTempoDate),
      periode_bkn_terdekat: getPeriodeBknTerdekat(jatuhTempoDate),
      periode_bkn_short: shortPeriode,
      sisa_bulan: sisaBulan,
      status_alert: statusAlert,
      alert_badge_type: alertBadgeType,
      alert_badge_text: alertBadgeText,
      golongan_sekarang: progression.golonganSekarang,
      nama_pangkat_sekarang: progression.namaPangkatSekarang,
      golongan_tujuan: progression.golonganTujuan,
      nama_pangkat_tujuan: progression.namaPangkatTujuan,
      jalur_kenaikan: progression.jalurKenaikanText,
      subtext_jalur: progression.subtextJalur,
      syarat_khusus_type: progression.syaratKhususType,
      syarat_khusus_label: progression.syaratKhususBadgeText,
      syarat_khusus_status: progression.syaratKhususStatus,
      syarat_khusus_desc: progression.syaratKhususDesc,
    });
  }

  // Urutkan: Yang Lewat Tempo & H-3 Bulan terlebih dahulu (sisaBulan terkecil), lalu yang Aman
  return alerts.sort((a, b) => {
    // Prioritas: overdue (1) -> h3 (2) -> aman (3)
    const priority = { overdue: 1, h3: 2, aman: 3 };
    const pA = priority[a.alert_badge_type || 'aman'];
    const pB = priority[b.alert_badge_type || 'aman'];
    if (pA !== pB) return pA - pB;
    return a.sisa_bulan - b.sisa_bulan;
  });
}

/**
 * Menghitung Daftar Alert Kenaikan Jabatan Fungsional (Jafung) di Tahun Berjalan
 * Menampilkan ASN Fungsional PNS yang siap UKKJ / memenuhi target AK Kumulatif / jatuh tempo evaluasi jenjang di tahun berjalan.
 */
export function calculateJafungAlerts(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[] = [],
  referenceDateStr?: string
): AlertJafungItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const currentYear = refDate.getFullYear();
  const activePnsJafung = pegawaiList.filter(
    (p) => !p.is_deleted && p.status_kepegawaian === 'PNS' && p.jenis_jabatan === 'Fungsional'
  );
  const alerts: AlertJafungItem[] = [];

  for (const pegawai of activePnsJafung) {
    const rawJabatan = (pegawai.jabatan_spesifik || '').toLowerCase();
    const isMadya = rawJabatan.includes('madya');
    const isMuda = rawJabatan.includes('muda');
    const isPertama = rawJabatan.includes('pertama');

    const currentJenjang =
      pegawai.jenjang_jabatan ||
      (isMadya ? 'Ahli Madya' : isMuda ? 'Ahli Muda' : isPertama ? 'Ahli Pertama' : 'Kategori Keterampilan');
    const targetJenjang =
      currentJenjang === 'Ahli Madya'
        ? 'Ahli Utama'
        : currentJenjang === 'Ahli Muda'
        ? 'Ahli Madya'
        : currentJenjang === 'Ahli Pertama'
        ? 'Ahli Muda'
        : 'Alih Kategori / Penyelia';
    const estAngkaKredit = pegawai.total_ak_kumulatif ?? (isMadya ? 187.5 : isMuda ? 125.0 : 87.5);
    const targetAk = currentJenjang === 'Ahli Madya' ? 225 : currentJenjang === 'Ahli Muda' ? 150 : 100;
    const akKonversi = pegawai.ak_konversi_skp ?? 12.5;

    const tmtJafungStr = getPegawaiTmtJafung(pegawai, skList);
    const tmtDate = parseDate(tmtJafungStr);

    // Evaluasi jenjang: siklus 2-3 tahun TMT Jafung
    const evaluasiDate = new Date(tmtDate);
    evaluasiDate.setFullYear(evaluasiDate.getFullYear() + 2);

    const siapUkkj = estAngkaKredit >= targetAk || pegawai.status_ukkj === 'Lulus UKKJ' || Boolean(pegawai.status_ukom);
    const isTahunBerjalan = evaluasiDate.getFullYear() <= currentYear || siapUkkj;

    if (isTahunBerjalan) {
      alerts.push({
        nip: pegawai.nip,
        nama_lengkap: pegawai.nama_lengkap,
        unit_kerja: pegawai.unit_kerja,
        jenis_jabatan: pegawai.jenis_jabatan,
        jabatan_spesifik: pegawai.jabatan_spesifik || currentJenjang,
        jenjang_jabatan: currentJenjang,
        target_jenjang: targetJenjang,
        golongan_pangkat: pegawai.golongan_pangkat || 'III/a',
        nama_pangkat: pegawai.nama_pangkat || 'Penata Muda',
        total_ak_kumulatif: estAngkaKredit,
        target_ak: targetAk,
        ak_konversi_skp: akKonversi,
        tmt_jafung: tmtJafungStr,
        status_siap_ukkj: siapUkkj,
        status_alert: siapUkkj ? 'Bahaya' : 'Peringatan',
      });
    }
  }

  return alerts.sort((a, b) => (b.status_siap_ukkj ? 1 : 0) - (a.status_siap_ukkj ? 1 : 0));
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
 * Menghitung Alert Pensiun (BUP) & Akhir Masa Kontrak di TAHUN INI & TAHUN DEPAN
 * Menampilkan ASN/Non-ASN yang akan pensiun (PNS BUP) atau habis masa kontrak (PPPK / Non-ASN)
 * Memberikan status peringatan tegas ketika sudah mendekati H-3 Bulan (sisa_bulan <= 3).
 */
export function calculatePensiunAlerts(
  pegawaiList: Pegawai[],
  referenceDateStr?: string
): AlertPensiunItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const currentYear = refDate.getFullYear();
  const nextYear = currentYear + 1;
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
      const pensiunYear = pensiunDate.getFullYear();

      // Saring untuk tahun ini, tahun depan, atau yang overdue sebelumnya
      const isTargetYear = pensiunYear === currentYear || pensiunYear === nextYear || (pensiunYear < currentYear && sisaBulan <= 0);

      if (isTargetYear) {
        let statusAlert = '';
        if (sisaBulan <= 0) {
          statusAlert = 'Sudah Memasuki BUP Pensiun';
        } else if (sisaBulan <= 3) {
          statusAlert = '⚠️ Mendesak: BUP Pensiun (H-3 Bulan)';
        } else if (sisaBulan <= 6) {
          statusAlert = 'Persiapan DPCP Pensiun (H-6 Bulan)';
        } else if (pensiunYear === currentYear) {
          statusAlert = `BUP Pensiun Tahun Ini (${currentYear})`;
        } else {
          statusAlert = `BUP Pensiun Tahun Depan (${nextYear})`;
        }

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
          status_alert: statusAlert,
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
      const expYear = expDate.getFullYear();

      // Saring untuk tahun ini, tahun depan, atau overdue
      const isTargetYear = expYear === currentYear || expYear === nextYear || (expYear < currentYear && sisaBulan <= 0);

      if (isTargetYear) {
        let statusAlert = '';
        if (sisaBulan <= 0) {
          statusAlert = 'Masa Perjanjian Kerja Telah Berakhir';
        } else if (sisaBulan <= 3) {
          statusAlert = '⚠️ Mendesak: Habis Kontrak PPPK (H-3 Bulan)';
        } else if (sisaBulan <= 6) {
          statusAlert = 'Evaluasi Kinerja & Persiapan Perpanjangan Kontrak';
        } else if (expYear === currentYear) {
          statusAlert = `Habis Kontrak PPPK Tahun Ini (${currentYear})`;
        } else {
          statusAlert = `Habis Kontrak PPPK Tahun Depan (${nextYear})`;
        }

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
          status_alert: statusAlert,
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
      const expYear = expDate.getFullYear();

      // Saring untuk tahun ini, tahun depan, atau overdue
      const isTargetYear = expYear === currentYear || expYear === nextYear || (expYear < currentYear && sisaBulan <= 0);

      if (isTargetYear) {
        let statusAlert = '';
        if (sisaBulan <= 0) {
          statusAlert = 'Masa SK Kontrak Non-ASN Telah Berakhir';
        } else if (sisaBulan <= 3) {
          statusAlert = '⚠️ Mendesak: Habis Kontrak Non-ASN (H-3 Bulan)';
        } else if (sisaBulan <= 6) {
          statusAlert = 'Persiapan Evaluasi & Pembaharuan SK Kontrak';
        } else if (expYear === currentYear) {
          statusAlert = `Habis Kontrak Non-ASN Tahun Ini (${currentYear})`;
        } else {
          statusAlert = `Habis Kontrak Non-ASN Tahun Depan (${nextYear})`;
        }

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
          status_alert: statusAlert,
        });
      }
    }
  }

  return alerts.sort((a, b) => a.sisa_bulan - b.sisa_bulan);
}

/**
 * Menghitung Alert KP4 Anak di TAHUN BERJALAN (Batas 21 Tahun tanpa surat kuliah, Batas 25 Tahun batas maksimal)
 */
export function calculateKp4AnakAlerts(
  pegawaiList: Pegawai[],
  keluargaList: KeluargaKP4[],
  referenceDateStr?: string
): AlertKP4AnakItem[] {
  const refDate = referenceDateStr ? parseDate(referenceDateStr) : new Date();
  const currentYear = refDate.getFullYear();
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

    const umur21Year = birthDate.getFullYear() + 21;
    const umur25Year = birthDate.getFullYear() + 25;

    const hasSuratKuliah = Boolean(anak.surat_ket_kuliah_url && anak.surat_ket_kuliah_url.trim().length > 0);

    // Kasus 1: Tanpa Surat Kuliah & Umur mendekati / melewati 21 Tahun di Tahun Berjalan
    if (!hasSuratKuliah && totalMonths >= 249 && umur21Year <= currentYear) {
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
    // Kasus 2: Ada Surat Kuliah & Umur mendekati / melewati 25 Tahun di Tahun Berjalan - Batas Maksimal 25 Thn
    else if (hasSuratKuliah && totalMonths >= 297 && umur25Year <= currentYear) {
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

