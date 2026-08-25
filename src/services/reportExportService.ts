import { Pegawai, RiwayatSK, KeluargaKP4 } from '../types';
import {
  parseDate,
  formatDate,
  formatDateIndonesian,
  PANGKAT_GOLONGAN_MAP,
} from './dateCalculator';

// Golongan Progression Order
export const GOLONGAN_ORDER = [
  'I/a', 'I/b', 'I/c', 'I/d',
  'II/a', 'II/b', 'II/c', 'II/d',
  'III/a', 'III/b', 'III/c', 'III/d',
  'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e',
];

// Jafung Hierarchy
export const JAFUNG_LEVELS = [
  'Pemula',
  'Terampil',
  'Mahir',
  'Penyelia',
  'Ahli Pertama',
  'Ahli Muda',
  'Ahli Madya',
  'Ahli Utama',
];

export interface EmployeeExportRow {
  no: number;
  nip: string;
  nik: string;
  namaLengkap: string;
  unitKerja: string;
  statusKepegawaian: string;
  jenisJabatan: string;
  jabatanSpesifik: string;

  // Pangkat Information (Sebelumnya, Sekarang, Selanjutnya)
  golonganSekarang: string;
  namaPangkatSekarang: string;
  tmtPangkatSekarang: string;
  pangkatSebelumnya: string;
  tmtPangkatSebelumnya: string;
  proyeksiPangkatSelanjutnya: string;
  tmtProyeksiPangkatSelanjutnya: string;

  // Jafung Information (Jika Fungsional)
  isFungsional: boolean;
  jenjangJafungSekarang: string;
  jenjangJafungSebelumnya: string;
  proyeksiJenjangJafungSelanjutnya: string;
  angkaKreditKumulatif: number | string;
  statusUkom: string;

  // Masa Kerja (MKG & Total)
  masaKerjaGolongan: string;
  masaKerjaTahun: number;
  masaKerjaBulan: number;
  tmtCpnsPengangkatan: string;

  // KGB (Sebelumnya, Sekarang / Terakhir, Selanjutnya)
  tmtKgbSebelumnya: string;
  tmtKgbTerakhir: string;
  tmtKgbSelanjutnya: string;
  statusJatuhTempoKgb: string;

  // KP4 Tunjangan Keluarga
  jumlahTanggunganKp4: number;
  jumlahPasanganKp4: number;
  jumlahAnakKp4: number;
  daftarNamaTanggunganKp4: string;
  statusTunjanganKp4: string;

  // Pendidikan & STR / SIP
  pendidikanTerakhir: string;
  noWhatsapp: string;
  legalitasStrSip: string;
}

/**
 * Calculates Previous Pangkat from SK History or Derivation
 */
export function getPreviousPangkat(pegawai: Pegawai, skList: RiwayatSK[]): {
  pangkatSebelumnya: string;
  tmtSebelumnya: string;
} {
  const currentGol = pegawai.golongan_pangkat || (pegawai as any).golongan;
  const currentTmt = pegawai.tmt_pangkat_terakhir || pegawai.tmt_golongan || pegawai.tmt_cpns;

  // Search in SK Pangkat history
  const pangkatSk = skList
    .filter((s) => s.nip_pegawai === pegawai.nip && s.jenis_sk === 'Pangkat')
    .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

  if (pangkatSk.length > 1) {
    // Second newest is the previous one
    const prev = pangkatSk[1];
    return {
      pangkatSebelumnya: prev.keterangan || prev.nomor_sk || 'Golongan Terdaftar',
      tmtSebelumnya: prev.tmt_berlaku ? formatDateIndonesian(prev.tmt_berlaku) : '-',
    };
  }

  // If only 1 or 0 SK, derive previous rank if exists
  if (currentGol) {
    const idx = GOLONGAN_ORDER.indexOf(currentGol);
    if (idx > 0) {
      const prevGol = GOLONGAN_ORDER[idx - 1];
      const prevPangkatName = PANGKAT_GOLONGAN_MAP[prevGol] || prevGol;
      let prevTmtStr = '-';
      if (currentTmt && currentTmt.includes('-')) {
        try {
          const curDate = parseDate(currentTmt);
          const prevDate = new Date(curDate);
          prevDate.setFullYear(prevDate.getFullYear() - 4);
          prevTmtStr = formatDateIndonesian(formatDate(prevDate));
        } catch {
          prevTmtStr = '-';
        }
      }
      return {
        pangkatSebelumnya: `${prevPangkatName} (${prevGol})`,
        tmtSebelumnya: prevTmtStr,
      };
    }
  }

  return {
    pangkatSebelumnya: pegawai.status_kepegawaian === 'PNS' ? 'Pangkat Pertama (CPNS/PNS Awal)' : '-',
    tmtSebelumnya: pegawai.tmt_cpns ? formatDateIndonesian(pegawai.tmt_cpns) : '-',
  };
}

/**
 * Calculates Next Pangkat projection
 */
export function getNextPangkat(pegawai: Pegawai): {
  nextPangkat: string;
  nextTmt: string;
} {
  const currentGol = pegawai.golongan_pangkat || (pegawai as any).golongan;
  const currentTmt = pegawai.tmt_pangkat_terakhir || pegawai.tmt_golongan || pegawai.tmt_cpns;

  if (!currentGol) {
    return { nextPangkat: '-', nextTmt: '-' };
  }

  const idx = GOLONGAN_ORDER.indexOf(currentGol);
  if (idx < 0) {
    return { nextPangkat: '-', nextTmt: '-' };
  }

  if (idx === GOLONGAN_ORDER.length - 1) {
    return { nextPangkat: 'Mencapai Pangkat Puncak (IV/e)', nextTmt: '-' };
  }

  const nextGol = GOLONGAN_ORDER[idx + 1];
  const nextPangkatName = PANGKAT_GOLONGAN_MAP[nextGol] || nextGol;

  let nextTmtStr = '-';
  if (currentTmt && currentTmt.includes('-')) {
    try {
      const curDate = parseDate(currentTmt);
      const nextDate = new Date(curDate);
      nextDate.setFullYear(nextDate.getFullYear() + 4);
      nextTmtStr = formatDateIndonesian(formatDate(nextDate));
    } catch {
      nextTmtStr = '-';
    }
  }

  return {
    nextPangkat: `${nextPangkatName} (${nextGol})`,
    nextTmt: nextTmtStr,
  };
}

/**
 * Calculates Jafung Previous & Next Progression
 */
export function getJafungProgression(pegawai: Pegawai): {
  jenjangSekarang: string;
  jenjangSebelumnya: string;
  jenjangSelanjutnya: string;
} {
  if (pegawai.jenis_jabatan !== 'Fungsional') {
    return {
      jenjangSekarang: 'Bukan Fungsional',
      jenjangSebelumnya: '-',
      jenjangSelanjutnya: '-',
    };
  }

  const spesifik = pegawai.jabatan_spesifik || '';
  let curJenjang = pegawai.jenjang_jabatan || '';

  if (!curJenjang) {
    // Detect from jabatan_spesifik
    for (const lvl of JAFUNG_LEVELS) {
      if (spesifik.toLowerCase().includes(lvl.toLowerCase())) {
        curJenjang = lvl;
        break;
      }
    }
  }

  if (!curJenjang) {
    curJenjang = 'Ahli Pertama';
  }

  const idx = JAFUNG_LEVELS.indexOf(curJenjang);
  const prevJenjang = idx > 0 ? JAFUNG_LEVELS[idx - 1] : 'Jenjang Awal';
  const nextJenjang = idx >= 0 && idx < JAFUNG_LEVELS.length - 1 ? JAFUNG_LEVELS[idx + 1] : 'Jenjang Utama Tertinggi';

  return {
    jenjangSekarang: curJenjang,
    jenjangSebelumnya: prevJenjang,
    jenjangSelanjutnya: nextJenjang,
  };
}

/**
 * Calculates KGB Previous, Current, Next, and Due Status
 */
export function getKgbProgression(pegawai: Pegawai, skList: RiwayatSK[]): {
  kgbSebelumnya: string;
  kgbTerakhir: string;
  kgbSelanjutnya: string;
  statusKgb: string;
} {
  const kgbSkList = skList
    .filter((s) => s.nip_pegawai === pegawai.nip && s.jenis_sk === 'KGB')
    .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());

  let tmtTerakhirRaw = pegawai.tmt_kgb_terakhir;
  if (!tmtTerakhirRaw && kgbSkList.length > 0) {
    tmtTerakhirRaw = kgbSkList[0].tmt_berlaku;
  }
  if (!tmtTerakhirRaw) {
    tmtTerakhirRaw = pegawai.tmt_cpns || '2022-01-01';
  }

  let tmtSebelumnyaStr = '-';
  if (kgbSkList.length > 1) {
    tmtSebelumnyaStr = formatDateIndonesian(kgbSkList[1].tmt_berlaku);
  } else if (tmtTerakhirRaw && tmtTerakhirRaw.includes('-')) {
    try {
      const cur = parseDate(tmtTerakhirRaw);
      const prev = new Date(cur);
      prev.setFullYear(prev.getFullYear() - 2);
      tmtSebelumnyaStr = formatDateIndonesian(formatDate(prev));
    } catch {
      tmtSebelumnyaStr = '-';
    }
  }

  let tmtSelanjutnyaStr = '-';
  let statusKgb = 'Normal';
  if (tmtTerakhirRaw && tmtTerakhirRaw.includes('-')) {
    try {
      const cur = parseDate(tmtTerakhirRaw);
      const nextDate = new Date(cur);
      nextDate.setFullYear(nextDate.getFullYear() + 2);
      tmtSelanjutnyaStr = formatDateIndonesian(formatDate(nextDate));

      const now = new Date();
      const diffMonths = (nextDate.getFullYear() - now.getFullYear()) * 12 + (nextDate.getMonth() - now.getMonth());
      if (diffMonths <= 0) {
        statusKgb = 'Jatuh Tempo (Perlu SK Baru)';
      } else if (diffMonths <= 3) {
        statusKgb = `Mendekati Jatuh Tempo (H-${diffMonths} Bln)`;
      } else {
        statusKgb = 'Aktif Berlaku';
      }
    } catch {
      tmtSelanjutnyaStr = '-';
    }
  }

  return {
    kgbSebelumnya: tmtSebelumnyaStr,
    kgbTerakhir: tmtTerakhirRaw ? formatDateIndonesian(tmtTerakhirRaw) : '-',
    kgbSelanjutnya: tmtSelanjutnyaStr,
    statusKgb,
  };
}

/**
 * Formats Complete Comprehensive Report Dataset
 */
export function buildComprehensivePegawaiReport(
  pegawaiList: Pegawai[],
  skList: RiwayatSK[],
  keluargaList: KeluargaKP4[]
): EmployeeExportRow[] {
  return pegawaiList
    .filter((p) => !p.is_deleted)
    .map((p, idx) => {
      // 1. Pangkat
      const curGol = p.golongan_pangkat || (p as any).golongan || '-';
      const curPangkatName = p.nama_pangkat || PANGKAT_GOLONGAN_MAP[curGol] || '-';
      const curTmtPangkat = p.tmt_pangkat_terakhir || p.tmt_golongan || p.tmt_cpns || '-';
      const prevPangkatData = getPreviousPangkat(p, skList);
      const nextPangkatData = getNextPangkat(p);

      // 2. Jafung
      const isFung = p.jenis_jabatan === 'Fungsional';
      const jafungData = getJafungProgression(p);

      // 3. KGB
      const kgbData = getKgbProgression(p, skList);

      // 4. KP4
      const employeeFamily = keluargaList.filter((k) => k.nip_pegawai === p.nip);
      const activeFamily = employeeFamily.filter((k) => k.status_tanggungan);
      const pasangan = activeFamily.filter((k) => k.status_hubungan === 'Suami' || k.status_hubungan === 'Istri');
      const anak = activeFamily.filter((k) => k.status_hubungan === 'Anak');

      const familyNames = activeFamily.length > 0
        ? activeFamily.map((k) => `${k.nama_keluarga} (${k.status_hubungan})`).join('; ')
        : 'Tidak Ada Tanggungan Aktif';

      // 5. Masa Kerja
      const mkTahun = p.masa_kerja_tahun ?? (p as any).mkg_tahun ?? 0;
      const mkBulan = p.masa_kerja_bulan ?? (p as any).mkg_bulan ?? 0;
      const masaKerjaFormatted = `${mkTahun} Tahun ${mkBulan} Bulan`;

      // 6. STR/SIP
      let legalitasStrSip = '-';
      if (p.is_str_seumur_hidup) {
        legalitasStrSip = 'STR Seumur Hidup (Aktif)';
      } else if (p.no_str) {
        legalitasStrSip = `STR: ${p.no_str} (s.d ${p.tgl_akhir_str || '-'})`;
      }
      if (p.no_sip) {
        legalitasStrSip += ` | SIP: ${p.no_sip}`;
      }

      return {
        no: idx + 1,
        nip: p.nip || p.ni_pppk || '-',
        nik: p.nik || '-',
        namaLengkap: p.nama_lengkap,
        unitKerja: p.unit_kerja,
        statusKepegawaian: p.status_kepegawaian,
        jenisJabatan: p.jenis_jabatan,
        jabatanSpesifik: p.jabatan_spesifik,

        // Pangkat
        golonganSekarang: curGol,
        namaPangkatSekarang: curPangkatName,
        tmtPangkatSekarang: curTmtPangkat !== '-' ? formatDateIndonesian(curTmtPangkat) : '-',
        pangkatSebelumnya: prevPangkatData.pangkatSebelumnya,
        tmtPangkatSebelumnya: prevPangkatData.tmtSebelumnya,
        proyeksiPangkatSelanjutnya: nextPangkatData.nextPangkat,
        tmtProyeksiPangkatSelanjutnya: nextPangkatData.nextTmt,

        // Jafung
        isFungsional: isFung,
        jenjangJafungSekarang: jafungData.jenjangSekarang,
        jenjangJafungSebelumnya: jafungData.jenjangSebelumnya,
        proyeksiJenjangJafungSelanjutnya: jafungData.jenjangSelanjutnya,
        angkaKreditKumulatif: p.total_ak_kumulatif ?? (isFung ? 37.5 : '-'),
        statusUkom: p.status_ukkj || (p.status_ukom ? 'Lulus UKKJ/UKOM' : 'Belum UKOM'),

        // Masa Kerja
        masaKerjaGolongan: masaKerjaFormatted,
        masaKerjaTahun: mkTahun,
        masaKerjaBulan: mkBulan,
        tmtCpnsPengangkatan: p.tmt_cpns ? formatDateIndonesian(p.tmt_cpns) : '-',

        // KGB
        tmtKgbSebelumnya: kgbData.kgbSebelumnya,
        tmtKgbTerakhir: kgbData.kgbTerakhir,
        tmtKgbSelanjutnya: kgbData.kgbSelanjutnya,
        statusJatuhTempoKgb: kgbData.statusKgb,

        // KP4
        jumlahTanggunganKp4: activeFamily.length,
        jumlahPasanganKp4: pasangan.length,
        jumlahAnakKp4: anak.length,
        daftarNamaTanggunganKp4: familyNames,
        statusTunjanganKp4: activeFamily.length > 0 ? 'Menerima Tunjangan KP4' : 'Nihil / Non-Tanggungan',

        // Tambahan
        pendidikanTerakhir: p.pendidikan_terakhir || '-',
        noWhatsapp: p.no_whatsapp || '-',
        legalitasStrSip,
      };
    });
}
