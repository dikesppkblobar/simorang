import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Briefcase,
  Building2,
  ChevronRight,
  Search,
  Users,
  Target,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Pegawai, JenisJabatan } from '../types';
import { formatDateIndonesian, getBUP } from '../services/dateCalculator';

interface MppPredictiveAnalyticsWidgetProps {
  pegawaiList: Pegawai[];
  onNavigateTab: (tab: string, subTab?: string) => void;
  onOpenPegawaiDetail?: (nip: string) => void;
}

export interface MppPegawaiProjection {
  nip: string;
  nama_lengkap: string;
  unit_kerja: string;
  jenis_jabatan: JenisJabatan;
  jabatan_spesifik: string;
  status_kepegawaian: string;
  golongan_pangkat?: string;
  nama_pangkat?: string;
  tanggal_lahir: string;
  umur_saat_ini: number;
  batas_usia_pensiun: number;
  tanggal_pensiun: string;
  tahun_pensiun: number;
  sisa_bulan: number;
  sisa_tahun_float: number;
  horizon_year_bucket: 1 | 2 | 3 | 4 | 5; // 1 = 1 thn ke depan, 2 = 2 thn, dst.
  status_urgensi: 'kritis' | 'waspada' | 'persiapan' | 'terencana' | 'prospek';
  rekomendasi_suksesi: string;
  is_jabatan_strategis: boolean;
}

const JABATAN_CHART_COLORS = {
  Fungsional: '#00A3AD', // Teal
  Struktural: '#82BE00', // Lime Green
  Pelaksana: '#004B87',  // Navy Blue
};

export const MppPredictiveAnalyticsWidget: React.FC<MppPredictiveAnalyticsWidgetProps> = ({
  pegawaiList = [],
  onNavigateTab,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [selectedJabatanFilter, setSelectedJabatanFilter] = useState<'all' | 'Struktural' | 'Fungsional' | 'Pelaksana'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStrategicOnly, setShowStrategicOnly] = useState(false);

  const currentYear = new Date().getFullYear();

  // Proyeksi Pegawai MPP 1 s.d. 5 Tahun ke Depan
  const { allMppProjections, horizonSummary, chartData, strategicList } = useMemo(() => {
    const activePegawai = pegawaiList.filter((p) => !p.is_deleted);
    const refDate = new Date();
    const projections: MppPegawaiProjection[] = [];

    // Bucket Summary counters
    const summary: Record<number, {
      total: number;
      struktural: number;
      fungsional: number;
      pelaksana: number;
      pns: number;
      pppk: number;
      strategisCount: number;
      tahunKalender: number;
    }> = {
      1: { total: 0, struktural: 0, fungsional: 0, pelaksana: 0, pns: 0, pppk: 0, strategisCount: 0, tahunKalender: currentYear + 1 },
      2: { total: 0, struktural: 0, fungsional: 0, pelaksana: 0, pns: 0, pppk: 0, strategisCount: 0, tahunKalender: currentYear + 2 },
      3: { total: 0, struktural: 0, fungsional: 0, pelaksana: 0, pns: 0, pppk: 0, strategisCount: 0, tahunKalender: currentYear + 3 },
      4: { total: 0, struktural: 0, fungsional: 0, pelaksana: 0, pns: 0, pppk: 0, strategisCount: 0, tahunKalender: currentYear + 4 },
      5: { total: 0, struktural: 0, fungsional: 0, pelaksana: 0, pns: 0, pppk: 0, strategisCount: 0, tahunKalender: currentYear + 5 },
    };

    activePegawai.forEach((p) => {
      // Dapatkan tanggal lahir
      let birthDateStr = p.tanggal_lahir;
      if (!birthDateStr && p.nip && p.nip.length >= 8) {
        const y = p.nip.substring(0, 4);
        const m = p.nip.substring(4, 6);
        const d = p.nip.substring(6, 8);
        birthDateStr = `${y}-${m}-${d}`;
      }

      if (!birthDateStr) return;

      const birthDate = new Date(birthDateStr + 'T00:00:00');
      if (isNaN(birthDate.getTime())) return;

      const umurSaatIni = parseFloat(
        (((refDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))).toFixed(1)
      );

      const bup = getBUP(p.jenis_jabatan, p.jabatan_spesifik || '');
      const pensiunDate = new Date(birthDate);
      pensiunDate.setFullYear(pensiunDate.getFullYear() + bup);

      const sisaBulan =
        (pensiunDate.getFullYear() - refDate.getFullYear()) * 12 +
        (pensiunDate.getMonth() - refDate.getMonth());

      const sisaTahunFloat = parseFloat((sisaBulan / 12).toFixed(1));
      const pensiunYear = pensiunDate.getFullYear();

      // Saring hanya untuk 1 s.d. 5 tahun ke depan (sisaBulan > 0 dan sisaBulan <= 60, atau tahun pensiun dalam [currentYear..currentYear+5])
      // Termasuk pegawai yang akan pensiun di tahun berjalan yang belum pensiun
      if (sisaBulan <= 0 || sisaBulan > 60) return;

      let bucket: 1 | 2 | 3 | 4 | 5 = 1;
      let statusUrgensi: MppPegawaiProjection['status_urgensi'] = 'persiapan';
      let rekomendasiSuksesi = '';

      if (sisaBulan <= 12) {
        bucket = 1;
        statusUrgensi = 'kritis';
        rekomendasiSuksesi = 'Segera tetapkan Pelaksana Tugas/Suksesor definitif & usul formasi pengganti';
      } else if (sisaBulan <= 24) {
        bucket = 2;
        statusUrgensi = 'waspada';
        rekomendasiSuksesi = 'Ikutsertakan pembekalan Masa Persiapan Pensiun (MPP) & kaderisasi internal';
      } else if (sisaBulan <= 36) {
        bucket = 3;
        statusUrgensi = 'persiapan';
        rekomendasiSuksesi = 'Pemetaan talenta (talent pool), transfer knowledge & rotasi kader jabatan';
      } else if (sisaBulan <= 48) {
        bucket = 4;
        statusUrgensi = 'terencana';
        rekomendasiSuksesi = 'Rencanakan usulan formasi CASN/PPPK & diklat penjenjangan calon suksesor';
      } else {
        bucket = 5;
        statusUrgensi = 'prospek';
        rekomendasiSuksesi = 'Masukkan dalam peta rencana kebutuhan SDM Kesehatan jangka menengah (5 Thn)';
      }

      // Deteksi Jabatan Strategis / Fungsional Kritis
      const jabLower = (p.jabatan_spesifik || '').toLowerCase();
      const isStrategis =
        p.jenis_jabatan === 'Struktural' ||
        jabLower.includes('kepala dinas') ||
        jabLower.includes('sekretaris') ||
        jabLower.includes('kepala bidang') ||
        jabLower.includes('kepala puskesmas') ||
        jabLower.includes('kasubag') ||
        jabLower.includes('dokter spesialis') ||
        jabLower.includes('dokter gigi') ||
        jabLower.includes('dokter') ||
        jabLower.includes('apoteker') ||
        jabLower.includes('epidemiolog') ||
        jabLower.includes('sanitarian') ||
        jabLower.includes('madya') ||
        jabLower.includes('utama');

      const projItem: MppPegawaiProjection = {
        nip: p.nip,
        nama_lengkap: p.nama_lengkap,
        unit_kerja: p.unit_kerja,
        jenis_jabatan: p.jenis_jabatan,
        jabatan_spesifik: p.jabatan_spesifik || p.nama_jabatan_pns || p.jenis_jabatan,
        status_kepegawaian: p.status_kepegawaian,
        golongan_pangkat: p.golongan_pangkat,
        nama_pangkat: p.nama_pangkat,
        tanggal_lahir: birthDateStr,
        umur_saat_ini: umurSaatIni,
        batas_usia_pensiun: bup,
        tanggal_pensiun: pensiunDate.toISOString().slice(0, 10),
        tahun_pensiun: pensiunYear,
        sisa_bulan: sisaBulan,
        sisa_tahun_float: sisaTahunFloat,
        horizon_year_bucket: bucket,
        status_urgensi: statusUrgensi,
        rekomendasi_suksesi: rekomendasiSuksesi,
        is_jabatan_strategis: isStrategis,
      };

      projections.push(projItem);

      // Accumulate into summary
      if (summary[bucket]) {
        summary[bucket].total += 1;
        if (p.jenis_jabatan === 'Struktural') summary[bucket].struktural += 1;
        else if (p.jenis_jabatan === 'Fungsional') summary[bucket].fungsional += 1;
        else summary[bucket].pelaksana += 1;

        if (p.status_kepegawaian === 'PNS') summary[bucket].pns += 1;
        else summary[bucket].pppk += 1;

        if (isStrategis) summary[bucket].strategisCount += 1;
      }
    });

    // Urutkan projections dari yang paling dekat pensiun
    projections.sort((a, b) => a.sisa_bulan - b.sisa_bulan);

    // Siapkan data visual grafik Recharts (Stacked Bar Chart per tahun)
    const chart = [1, 2, 3, 4, 5].map((b) => {
      const s = summary[b];
      return {
        horizon: `Thn ${b} (${s.tahunKalender})`,
        tahun: s.tahunKalender,
        bucket: b,
        Fungsional: s.fungsional,
        Struktural: s.struktural,
        Pelaksana: s.pelaksana,
        Total: s.total,
        Strategis: s.strategisCount,
      };
    });

    // Strategic Positions entering retirement in 1-5 years
    const strat = projections.filter((p) => p.is_jabatan_strategis);

    return {
      allMppProjections: projections,
      horizonSummary: summary,
      chartData: chart,
      strategicList: strat,
    };
  }, [pegawaiList, currentYear]);

  // Filtered List
  const filteredProjections = useMemo(() => {
    return allMppProjections.filter((p) => {
      if (selectedHorizon !== 'all' && p.horizon_year_bucket !== parseInt(selectedHorizon, 10)) {
        return false;
      }
      if (selectedJabatanFilter !== 'all' && p.jenis_jabatan !== selectedJabatanFilter) {
        return false;
      }
      if (showStrategicOnly && !p.is_jabatan_strategis) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = p.nama_lengkap.toLowerCase().includes(q);
        const matchNip = p.nip.includes(q);
        const matchUnit = p.unit_kerja.toLowerCase().includes(q);
        const matchJabatan = p.jabatan_spesifik.toLowerCase().includes(q);
        if (!matchName && !matchNip && !matchUnit && !matchJabatan) return false;
      }
      return true;
    });
  }, [allMppProjections, selectedHorizon, selectedJabatanFilter, showStrategicOnly, searchTerm]);

  // Donut chart distribution of MPP 5 Years by Jabatan
  const jabatanPieData = useMemo(() => {
    const fTotal = allMppProjections.filter((p) => p.jenis_jabatan === 'Fungsional').length;
    const sTotal = allMppProjections.filter((p) => p.jenis_jabatan === 'Struktural').length;
    const pTotal = allMppProjections.filter((p) => p.jenis_jabatan === 'Pelaksana').length;

    return [
      { name: 'Fungsional', count: fTotal, color: '#00A3AD' },
      { name: 'Struktural', count: sTotal, color: '#82BE00' },
      { name: 'Pelaksana', count: pTotal, color: '#004B87' },
    ].filter((item) => item.count > 0);
  }, [allMppProjections]);

  const total5Years = allMppProjections.length;
  const critical1Year = horizonSummary[1]?.total || 0;
  const strategicTotal = strategicList.length;

  return (
    <div
      id="widget-mpp-analytics"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 space-y-6 p-5 sm:p-6"
    >
      {/* 1. Header Banner: Modern Executive Design */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004B87] to-[#00A3AD] text-white flex items-center justify-center shadow-md shadow-blue-900/10 shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                Analitik Prediktif Masa Persiapan Pensiun (MPP) & Suksesi Jabatan
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/60 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Horizon Proyeksi 1 s.d. 5 Tahun ({currentYear + 1} - {currentYear + 5})</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
              Sistem peringatan dini Batas Usia Pensiun (BUP) untuk memetakan risiko lowongan jabatan, menyiapkan kaderisasi suksesi struktural & tenaga fungsional kesehatan, serta mengantisipasi kebutuhan formasi ASN.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('alerts', 'pensiun')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold text-[#004B87] bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/70 transition-all cursor-pointer shadow-2xs"
            title="Buka Pusat Pemantauan BUP & Pensiun Detail"
          >
            <ShieldCheck className="w-4 h-4 text-[#004B87]" />
            <span>Pusat Pemantauan Pensiun</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Key Alert Notice if Critical Retirements in 1-2 Years */}
      {critical1Year > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50/60 to-white border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-sm text-red-900">
                Peringatan Regenerasi Mendesak: {critical1Year} Pegawai Memasuki BUP Dalam Waktu $\le$ 1 Tahun ({currentYear + 1})!
              </div>
              <p className="text-slate-600">
                Terdapat <strong className="text-red-800">{horizonSummary[1].strategisCount} posisi strategis/fungsional kritis</strong> yang harus segera dipersiapkan calon suksesor (Plt/Definitif) dan usulan pengisian formasi ke BKPSDM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedHorizon('1');
              setShowStrategicOnly(false);
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <span>Lihat {critical1Year} Pegawai Thn ke-1</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Multi-Year Horizon Step Cards (1 to 5 Years Horizon KPI Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-heading font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#004B87]" />
            <span>Peta Tahapan Regenerasi Berdasarkan Rentang Waktu (1 - 5 Tahun)</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Total Prediksi: <strong className="text-slate-900">{total5Years} ASN</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {([1, 2, 3, 4, 5] as const).map((yearBucket) => {
            const sum = horizonSummary[yearBucket];
            const isSelected = selectedHorizon === String(yearBucket);
            const badgeTheme =
              yearBucket === 1
                ? {
                    border: 'border-red-300/80',
                    activeBg: 'bg-red-50/90 border-red-500 shadow-md ring-2 ring-red-400/30',
                    hoverBorder: 'hover:border-red-400',
                    kpiColor: 'text-red-700',
                    badgeBg: 'bg-red-100 text-red-800',
                    label: 'Tahun ke-1 (Mendesak)',
                    sub: 'Masa MPP Aktif / Transisi',
                  }
                : yearBucket === 2
                ? {
                    border: 'border-amber-300/80',
                    activeBg: 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/30',
                    hoverBorder: 'hover:border-amber-400',
                    kpiColor: 'text-amber-700',
                    badgeBg: 'bg-amber-100 text-amber-800',
                    label: 'Tahun ke-2',
                    sub: 'Pembekalan MPP & Kader',
                  }
                : yearBucket === 3
                ? {
                    border: 'border-teal-300/80',
                    activeBg: 'bg-teal-50/90 border-teal-500 shadow-md ring-2 ring-teal-400/30',
                    hoverBorder: 'hover:border-teal-400',
                    kpiColor: 'text-[#00A3AD]',
                    badgeBg: 'bg-teal-100 text-teal-900',
                    label: 'Tahun ke-3',
                    sub: 'Pemetaan Talent Pool',
                  }
                : yearBucket === 4
                ? {
                    border: 'border-blue-300/80',
                    activeBg: 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/30',
                    hoverBorder: 'hover:border-blue-400',
                    kpiColor: 'text-[#004B87]',
                    badgeBg: 'bg-blue-100 text-blue-900',
                    label: 'Tahun ke-4',
                    sub: 'Usulan Formasi CASN',
                  }
                : {
                    border: 'border-indigo-300/80',
                    activeBg: 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-400/30',
                    hoverBorder: 'hover:border-indigo-400',
                    kpiColor: 'text-indigo-700',
                    badgeBg: 'bg-indigo-100 text-indigo-900',
                    label: 'Tahun ke-5',
                    sub: 'Rencana Kebutuhan 5 Thn',
                  };

            return (
              <div
                key={`horizon-card-${yearBucket}`}
                onClick={() => setSelectedHorizon(isSelected ? 'all' : String(yearBucket) as any)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? badgeTheme.activeBg
                    : `bg-slate-50/70 ${badgeTheme.border} ${badgeTheme.hoverBorder} hover:shadow-sm`
                }`}
                title={`Klik untuk memfilter daftar pegawai pensiun tahun ke-${yearBucket} (${sum.tahunKalender})`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className={`text-[10px] font-heading font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeTheme.badgeBg}`}>
                      {badgeTheme.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Thn {sum.tahunKalender}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-2">
                    {badgeTheme.sub}
                  </p>

                  <div className="flex items-baseline gap-1.5 my-1">
                    <span className={`text-3xl font-heading font-black tracking-tight ${badgeTheme.kpiColor}`}>
                      {sum.total}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">Pegawai</span>
                  </div>
                </div>

                {/* Sub breakdown */}
                <div className="pt-2.5 mt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A3AD]" />
                      <span>Fungsional:</span>
                    </span>
                    <strong className="font-semibold text-slate-800">{sum.fungsional}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#82BE00]" />
                      <span>Struktural:</span>
                    </span>
                    <strong className="font-semibold text-slate-800">{sum.struktural}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004B87]" />
                      <span>Pelaksana:</span>
                    </span>
                    <strong className="font-semibold text-slate-800">{sum.pelaksana}</strong>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-center text-[10px] font-bold text-slate-700 bg-white/80 py-0.5 rounded border border-slate-200">
                    Filter Aktif (Klik untuk lepas)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Visual Analytics: Stacked Bar Chart (Trend 5 Tahun) & Jabatan Composition Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Visual Bar Chart: 5-Year Projection Trend */}
        <div className="lg:col-span-8 bg-slate-50/70 p-4.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-[#004B87]" />
                <span>Distribusi Proyeksi Pensiun 5 Tahun per Kategori Jabatan</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pola pensiun tahunan untuk penyesuaian beban kerja & jadwal rekruitmen formasi
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00A3AD]" /> Fungsional
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#82BE00]" /> Struktural
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#004B87]" /> Pelaksana
              </span>
            </div>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-[190px]">
                          <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-amber-300">
                            {label}
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#00A3AD]" />
                                <span>Fungsional:</span>
                              </span>
                              <strong className="text-white">{data.Fungsional} ASN</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#82BE00]" />
                                <span>Struktural:</span>
                              </span>
                              <strong className="text-white">{data.Struktural} ASN</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#004B87]" />
                                <span>Pelaksana:</span>
                              </span>
                              <strong className="text-white">{data.Pelaksana} ASN</strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold text-white">
                              <span>Total Pensiun:</span>
                              <span>{data.Total} ASN</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Fungsional" stackId="a" fill="#00A3AD" radius={[0, 0, 0, 0]} maxBarSize={38} />
                <Bar dataKey="Struktural" stackId="a" fill="#82BE00" radius={[0, 0, 0, 0]} maxBarSize={38} />
                <Bar dataKey="Pelaksana" stackId="a" fill="#004B87" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rata-rata pensiun: ~{(total5Years / 5).toFixed(1)} ASN per tahun</span>
            <span className="text-slate-600 font-medium">Berdasarkan BUP (Pelaksana 58 Th, Fungsional 60/65 Th, Struktural 58/60 Th)</span>
          </div>
        </div>

        {/* Donut Chart: Komposisi & Rekomendasi Aksi Suksesi */}
        <div className="lg:col-span-4 bg-slate-50/70 p-4.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-200/70">
            <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Komposisi Jabatan MPP</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Perbandingan jenis jabatan pensiun 1-5 thn
            </p>
          </div>

          <div className="h-40 relative my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jabatanPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {jabatanPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} ASN (${((Number(val) / (total5Years || 1)) * 100).toFixed(1)}%)`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-heading font-extrabold text-slate-800">{total5Years}</span>
              <span className="text-[9px] uppercase font-semibold text-slate-400">ASN MPP</span>
            </div>
          </div>

          {/* Strategic Succession Tips Box */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Prioritas Suksesi 5 Tahun:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 pl-4 list-disc">
              <li>{strategicTotal} Jabatan Strategis/Kritis perlu kaderisasi aktif</li>
              <li>Percepat Uji Kompetensi (UKKJ) Fungsional Penjenjangan</li>
              <li>Sinkronisasi usulan formasi e-Formasi KemenPAN-RB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Interactive Pegawai Table & Filter Toolbar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 mr-1 hidden sm:inline">Filter:</span>
            
            {/* Horizon Filter Tabs */}
            <button
              type="button"
              onClick={() => setSelectedHorizon('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === 'all'
                  ? 'bg-[#004B87] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua (1-5 Thn) ({allMppProjections.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedHorizon('1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === '1'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              🚨 Thn ke-1 ({horizonSummary[1].total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedHorizon('2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === '2'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Thn ke-2 ({horizonSummary[2].total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedHorizon('3')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === '3'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
              }`}
            >
              Thn ke-3 ({horizonSummary[3].total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedHorizon('4')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === '4'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Thn ke-4 ({horizonSummary[4].total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedHorizon('5')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHorizon === '5'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              Thn ke-5 ({horizonSummary[5].total})
            </button>

            {/* Strategic Toggle */}
            <button
              type="button"
              onClick={() => setShowStrategicOnly(!showStrategicOnly)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                showStrategicOnly
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Jabatan Strategis Saja ({strategicTotal})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIP, jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1.5 focus:ring-[#004B87]"
            />
          </div>
        </div>

        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                <th className="p-3.5">Pegawai ASN</th>
                <th className="p-3.5">Jabatan & Unit Kerja</th>
                <th className="p-3.5">Usia & BUP</th>
                <th className="p-3.5">Proyeksi Pensiun</th>
                <th className="p-3.5">Tahapan Horizon & Urgensi</th>
                <th className="p-3.5">Rekomendasi Suksesi & Kaderisasi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProjections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    Tidak ada pegawai yang sesuai dengan filter proyeksi MPP yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredProjections.map((item) => {
                  const isUrgent = item.horizon_year_bucket === 1;
                  return (
                    <tr
                      key={item.nip}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isUrgent ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {item.nip}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {item.golongan_pangkat || 'III/a'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.nama_pangkat}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{item.jabatan_spesifik}</span>
                          {item.is_jabatan_strategis && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                              Strategis
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.unit_kerja}</div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.jenis_jabatan === 'Fungsional'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : item.jenis_jabatan === 'Struktural'
                              ? 'bg-lime-50 text-lime-800 border border-lime-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {item.jenis_jabatan}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{item.umur_saat_ini} Tahun</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          BUP: <strong className="text-slate-700">{item.batas_usia_pensiun} Thn</strong>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatDateIndonesian(item.tanggal_pensiun)}
                        </div>
                        <div className="text-[11px] font-semibold mt-0.5">
                          {item.sisa_bulan <= 12 ? (
                            <span className="text-red-700 font-bold">
                              🚨 Sisa {item.sisa_bulan} Bulan ({item.sisa_tahun_float} Thn)
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              Sisa ~{item.sisa_tahun_float} Tahun ({item.sisa_bulan} Bulan)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.horizon_year_bucket === 1
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : item.horizon_year_bucket === 2
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.horizon_year_bucket === 3
                              ? 'bg-teal-100 text-teal-900 border border-teal-300'
                              : item.horizon_year_bucket === 4
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          }`}
                        >
                          <span>Thn ke-{item.horizon_year_bucket} ({item.tahun_pensiun})</span>
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="text-xs text-slate-700 leading-snug">
                          {item.rekomendasi_suksesi}
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('alerts', 'pensiun')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#004B87] hover:text-[#003366] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Buka Pemantauan Pensiun"
                        >
                          <span>Pantau</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card View (Mobile) */}
        <div className="md:hidden space-y-3">
          {filteredProjections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Tidak ada pegawai yang sesuai dengan filter proyeksi MPP.
            </div>
          ) : (
            filteredProjections.map((item) => (
              <div
                key={item.nip}
                className={`p-4 rounded-xl border space-y-2.5 ${
                  item.horizon_year_bucket === 1
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-heading font-bold text-sm text-slate-900">
                      {item.nama_lengkap}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">NIP: {item.nip}</div>
                    <div className="text-xs font-medium text-slate-700 mt-0.5">{item.jabatan_spesifik}</div>
                    <div className="text-[11px] text-slate-500">{item.unit_kerja}</div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      item.horizon_year_bucket === 1
                        ? 'bg-red-600 text-white'
                        : item.horizon_year_bucket === 2
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    Thn ke-{item.horizon_year_bucket} ({item.tahun_pensiun})
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Usia & BUP</span>
                    <span className="font-bold text-slate-800">{item.umur_saat_ini} Thn (BUP {item.batas_usia_pensiun} Thn)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">TMT Pensiun</span>
                    <span className="font-bold text-red-700">{formatDateIndonesian(item.tanggal_pensiun)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">Rekomendasi Suksesi</span>
                    <span className="text-[11px] text-slate-700 font-medium">{item.rekomendasi_suksesi}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('alerts', 'pensiun')}
                  className="w-full py-2 bg-blue-50 text-[#004B87] hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Buka di Pemantauan Pensiun</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
