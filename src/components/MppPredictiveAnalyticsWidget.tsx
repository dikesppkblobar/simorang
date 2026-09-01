import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Award,
  BarChart3,
  ListFilter,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export const MppPredictiveAnalyticsWidget: React.FC<MppPredictiveAnalyticsWidgetProps> = ({
  pegawaiList = [],
  onNavigateTab,
}) => {
  // Main Card Open/Close (Buka-Tutup) State - Default closed (tertutup) saat pertama kali buka
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // Main Tab: 'ringkasan' (Grafik & Executive Summary) vs 'detail_pegawai' (Tabel & Filter Radar)
  const [activeWidgetTab, setActiveWidgetTab] = useState<'ringkasan' | 'detail_pegawai'>('ringkasan');
  
  // Accordion state for Horizon 1-5 Cards
  const [isHorizonGridOpen, setIsHorizonGridOpen] = useState(false);

  // Filters for Tab 2 (Detail Pegawai)
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

      // Saring 1 s.d. 5 tahun ke depan (1 s.d. 60 bulan)
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

      // Summary
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

    projections.sort((a, b) => a.sisa_bulan - b.sisa_bulan);

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

    const strat = projections.filter((p) => p.is_jabatan_strategis);

    return {
      allMppProjections: projections,
      horizonSummary: summary,
      chartData: chart,
      strategicList: strat,
    };
  }, [pegawaiList, currentYear]);

  // Filtered List for Tab 2
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
        const matchName = (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(q)) || false;
        const matchNip = (p.nip && p.nip.includes(q)) || false;
        const matchUnit = (p.unit_kerja && p.unit_kerja.toLowerCase().includes(q)) || false;
        const matchJabatan = (p.jabatan_spesifik && p.jabatan_spesifik.toLowerCase().includes(q)) || false;
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

  const handleJumpToDetail = (horizonBucket?: '1' | '2' | '3' | '4' | '5') => {
    if (horizonBucket) {
      setSelectedHorizon(horizonBucket);
    }
    setActiveWidgetTab('detail_pegawai');
  };

  const handleResetFilters = () => {
    setSelectedHorizon('all');
    setSelectedJabatanFilter('all');
    setShowStrategicOnly(false);
    setSearchTerm('');
  };

  return (
    <div
      id="widget-mpp-analytics"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 p-5 sm:p-6"
    >
      {/* 1. Header Widget & Card Open/Close (Buka-Tutup) Toggle */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCardExpanded ? 'pb-4 border-b border-slate-100' : ''}`}>
        <div 
          onClick={() => setIsCardExpanded(!isCardExpanded)}
          className="flex items-center gap-3 cursor-pointer select-none group flex-1"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#004B87] to-[#00A3AD] text-white flex items-center justify-center shadow-md shadow-blue-900/10 shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-extrabold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-[#004B87] transition-colors">
                Analitik Prediktif Masa Persiapan Pensiun (MPP) & Suksesi Jabatan
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Horizon {currentYear + 1} - {currentYear + 5}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Peringatan dini BUP 1-5 tahun untuk perencanaan suksesi jabatan fungsional & struktural ASN
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('alerts', 'pensiun')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold text-[#004B87] bg-blue-50 hover:bg-blue-100/90 border border-blue-200/70 transition-colors cursor-pointer"
            title="Buka Pusat Pemantauan Pensiun Lengkap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#004B87]" />
            <span className="hidden sm:inline">Pusat Pemantauan Pensiun</span>
            <span className="sm:hidden">Pensiun</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Tombol Buka / Tutup Card */}
          <button
            type="button"
            onClick={() => setIsCardExpanded(!isCardExpanded)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer border ${
              isCardExpanded
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-[#004B87] hover:bg-[#003865] text-white border-[#004B87] shadow-xs'
            }`}
            title={isCardExpanded ? 'Tutup Card Analitik MPP' : 'Buka Card Analitik MPP'}
          >
            <span>{isCardExpanded ? 'Tutup Card' : 'Buka Card'}</span>
            {isCardExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tampilan Ringkas Saat Card Ditutup (Collapsed Preview) */}
      {!isCardExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
              <Users className="w-3.5 h-3.5 text-[#004B87]" />
              <span>Total 5 Tahun: <strong className="text-[#004B87]">{total5Years} ASN</strong></span>
            </span>

            {critical1Year > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-900 border border-red-200 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Mendesak &le; 1 Thn: <strong className="text-red-700">{critical1Year} ASN</strong></span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Jabatan Strategis: <strong className="text-amber-800">{strategicTotal} Posisi</strong></span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCardExpanded(true)}
            className="text-xs font-bold text-[#004B87] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Tampilkan Grafik & Analitik Suksesi</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Konten Penuh Saat Card Dibuka (Expanded Content) */}
      {isCardExpanded && (
        <div className="space-y-5 mt-5">
          {/* 2. Simplified Alert Badge / Card (Clean & Compact) */}
          {critical1Year > 0 && (
            <div className="bg-red-50/80 border border-red-200/90 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-slate-800 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 text-red-700 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </span>
                <div className="text-xs">
                  <span className="font-bold text-red-900 mr-1.5">
                    Peringatan Suksesi Mendesak:
                  </span>
                  <span className="text-slate-700">
                    <strong>{critical1Year} Pegawai</strong> memasuki BUP dalam rentang waktu &le; 1 Tahun ({currentYear + 1}), termasuk{' '}
                    <strong className="text-red-800">{horizonSummary[1].strategisCount} Jabatan Strategis/Kritis</strong>.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleJumpToDetail('1')}
                className="shrink-0 px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 self-start sm:self-center"
              >
                <span>Lihat {critical1Year} Pegawai Thn ke-1</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 3. Sub-Tab Switcher (Ringkasan Eksekutif vs Radar & Detail Pegawai) */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveWidgetTab('ringkasan')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  activeWidgetTab === 'ringkasan'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Ringkasan Eksekutif & Grafik</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWidgetTab('detail_pegawai')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  activeWidgetTab === 'detail_pegawai'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Radar Detail Pegawai MPP</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeWidgetTab === 'detail_pegawai' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {total5Years}
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>Total Proyeksi 5 Tahun: <strong className="text-slate-900">{total5Years} ASN</strong></span>
            </div>
          </div>

      {/* ================= TAB 1: RINGKASAN EKSEKUTIF & GRAFIK ================= */}
      {activeWidgetTab === 'ringkasan' && (
        <div className="space-y-5">
          {/* Visual Bar Chart: 5-Year Projection Trend */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
              <div>
                <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#004B87]" />
                  <span>Distribusi Proyeksi Pensiun 5 Tahun per Kategori Jabatan</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pola pensiun tahunan untuk penyesuaian beban kerja & jadwal rekruitmen formasi
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#00A3AD]" /> Fungsional
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#82BE00]" /> Struktural
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#004B87]" /> Pelaksana
                </span>
              </div>
            </div>

            <div className="h-52 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="Fungsional" stackId="a" fill="#00A3AD" radius={[0, 0, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Struktural" stackId="a" fill="#82BE00" radius={[0, 0, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Pelaksana" stackId="a" fill="#004B87" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Rata-rata pensiun: ~{(total5Years / 5).toFixed(1)} ASN per tahun</span>
              <span className="text-slate-600 font-medium">BUP: Pelaksana 58 Th, Fungsional 60/65 Th, Struktural 58/60 Th</span>
            </div>
          </div>

          {/* Unified Compact Grid: Donut Komposisi Jabatan + Prioritas Suksesi */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Donut Chart Portion (5 cols) */}
              <div className="md:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-4 pr-0 md:pr-4 md:border-r border-slate-200/80">
                <div className="h-32 w-32 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jabatanPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
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
                    <span className="text-lg font-heading font-extrabold text-slate-800">{total5Years}</span>
                    <span className="text-[8px] uppercase font-semibold text-slate-400">ASN MPP</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 text-xs mb-1">Komposisi Jabatan:</div>
                  {jabatanPieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}:</span>
                      </span>
                      <strong className="font-semibold text-slate-800">{item.count} ASN</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Priorities & Action List Portion (7 cols) */}
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Prioritas Suksesi & Kaderisasi 5 Tahun:</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {strategicTotal} Posisi Strategis/Kritis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-red-700 uppercase block">1. Transisi Cepat</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Penetapan suksesor definitif/Plt untuk {critical1Year} ASN Tahun ke-1.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block">2. Uji Kompetensi</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Akselerasi UKKJ bagi tenaga fungsional kesehatan penjenjangan.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">3. Usulan Formasi</span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Sinkronisasi peta kebutuhan ASN di e-Formasi KemenPAN-RB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Section: Rincian Kartu Metrik Horizon 1-5 Tahun */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setIsHorizonGridOpen(!isHorizonGridOpen)}
              className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#004B87]" />
                <span className="text-xs font-heading font-bold text-slate-800">
                  Rincian Kartu Metrik Horizon Waktu (Tahun ke-1 s.d. Tahun ke-5)
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {isHorizonGridOpen ? 'Klik untuk sembunyikan' : 'Klik untuk buka rincian'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#004B87] font-bold">
                <span>{isHorizonGridOpen ? 'Tutup' : 'Buka'}</span>
                {isHorizonGridOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isHorizonGridOpen && (
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {([1, 2, 3, 4, 5] as const).map((yearBucket) => {
                    const sum = horizonSummary[yearBucket];
                    const badgeTheme =
                      yearBucket === 1
                        ? {
                            border: 'border-red-200',
                            bg: 'bg-red-50/60',
                            kpiColor: 'text-red-700',
                            badgeBg: 'bg-red-100 text-red-800',
                            label: 'Tahun ke-1 (Mendesak)',
                            sub: 'Masa MPP Aktif / Transisi',
                          }
                        : yearBucket === 2
                        ? {
                            border: 'border-amber-200',
                            bg: 'bg-amber-50/60',
                            kpiColor: 'text-amber-700',
                            badgeBg: 'bg-amber-100 text-amber-800',
                            label: 'Tahun ke-2',
                            sub: 'Pembekalan MPP & Kader',
                          }
                        : yearBucket === 3
                        ? {
                            border: 'border-teal-200',
                            bg: 'bg-teal-50/60',
                            kpiColor: 'text-[#00A3AD]',
                            badgeBg: 'bg-teal-100 text-teal-900',
                            label: 'Tahun ke-3',
                            sub: 'Pemetaan Talent Pool',
                          }
                        : yearBucket === 4
                        ? {
                            border: 'border-blue-200',
                            bg: 'bg-blue-50/60',
                            kpiColor: 'text-[#004B87]',
                            badgeBg: 'bg-blue-100 text-blue-900',
                            label: 'Tahun ke-4',
                            sub: 'Usulan Formasi CASN',
                          }
                        : {
                            border: 'border-indigo-200',
                            bg: 'bg-indigo-50/60',
                            kpiColor: 'text-indigo-700',
                            badgeBg: 'bg-indigo-100 text-indigo-900',
                            label: 'Tahun ke-5',
                            sub: 'Rencana Kebutuhan 5 Thn',
                          };

                    return (
                      <div
                        key={`horizon-card-${yearBucket}`}
                        onClick={() => handleJumpToDetail(String(yearBucket) as any)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${badgeTheme.bg} ${badgeTheme.border} hover:shadow-xs hover:border-slate-400`}
                        title={`Buka detail pegawai tahun ke-${yearBucket}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[10px] font-heading font-extrabold uppercase px-1.5 py-0.2 rounded ${badgeTheme.badgeBg}`}>
                              {badgeTheme.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {sum.tahunKalender}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mb-1.5">
                            {badgeTheme.sub}
                          </p>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className={`text-2xl font-heading font-black tracking-tight ${badgeTheme.kpiColor}`}>
                              {sum.total}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">ASN</span>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-200/80 space-y-0.5 text-[10px] text-slate-600">
                          <div className="flex justify-between">
                            <span>Fungsional:</span>
                            <strong className="text-slate-800">{sum.fungsional}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Struktural:</span>
                            <strong className="text-slate-800">{sum.struktural}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Pelaksana:</span>
                            <strong className="text-slate-800">{sum.pelaksana}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: RADAR & DETAIL PEGAWAI MPP ================= */}
      {activeWidgetTab === 'detail_pegawai' && (
        <div className="space-y-4">
          {/* Optimized Filter Bar with Dropdowns */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter:</span>
              </span>

              {/* 1. Dropdown Horizon Waktu */}
              <select
                value={selectedHorizon}
                onChange={(e) => setSelectedHorizon(e.target.value as any)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1.5 focus:ring-[#004B87] text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">Semua Horizon (1-5 Tahun) — {allMppProjections.length} Pegawai</option>
                <option value="1">🚨 Tahun ke-1 ({currentYear + 1}) — {horizonSummary[1].total} Pegawai (Mendesak)</option>
                <option value="2">Tahun ke-2 ({currentYear + 2}) — {horizonSummary[2].total} Pegawai</option>
                <option value="3">Tahun ke-3 ({currentYear + 3}) — {horizonSummary[3].total} Pegawai</option>
                <option value="4">Tahun ke-4 ({currentYear + 4}) — {horizonSummary[4].total} Pegawai</option>
                <option value="5">Tahun ke-5 ({currentYear + 5}) — {horizonSummary[5].total} Pegawai</option>
              </select>

              {/* 2. Dropdown Jenis Jabatan */}
              <select
                value={selectedJabatanFilter}
                onChange={(e) => setSelectedJabatanFilter(e.target.value as any)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1.5 focus:ring-[#004B87] text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">Semua Jenis Jabatan</option>
                <option value="Fungsional">Fungsional (Tenaga Kesehatan/JF)</option>
                <option value="Struktural">Struktural (Manajerial)</option>
                <option value="Pelaksana">Pelaksana (Administrasi)</option>
              </select>

              {/* 3. Checkbox / Toggle Jabatan Strategis */}
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200 cursor-pointer transition-colors select-none shadow-2xs">
                <input
                  type="checkbox"
                  checked={showStrategicOnly}
                  onChange={(e) => setShowStrategicOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                />
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Jabatan Strategis Saja ({strategicTotal})</span>
              </label>

              {/* Reset Filter Button */}
              {(selectedHorizon !== 'all' || selectedJabatanFilter !== 'all' || showStrategicOnly || searchTerm) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 flex items-center gap-1 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Reset semua filter"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIP, jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1.5 focus:ring-[#004B87] shadow-2xs"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3">Pegawai ASN</th>
                  <th className="p-3">Jabatan & Unit Kerja</th>
                  <th className="p-3">Usia & BUP</th>
                  <th className="p-3">TMT Pensiun</th>
                  <th className="p-3">Horizon Waktu</th>
                  <th className="p-3">Rekomendasi Suksesi & Kaderisasi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Tidak ada pegawai yang sesuai dengan kriteria filter proyeksi MPP.
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
                        <td className="p-3">
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

                        <td className="p-3">
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
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full ${
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

                        <td className="p-3">
                          <div className="font-bold text-slate-800">{item.umur_saat_ini} Thn</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            BUP: <strong className="text-slate-700">{item.batas_usia_pensiun} Thn</strong>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatDateIndonesian(item.tanggal_pensiun)}
                          </div>
                          <div className="text-[11px] font-semibold mt-0.5">
                            {item.sisa_bulan <= 12 ? (
                              <span className="text-red-700 font-bold">
                                🚨 {item.sisa_bulan} Bln (~{item.sisa_tahun_float} Thn)
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                ~{item.sisa_tahun_float} Thn ({item.sisa_bulan} Bln)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                            Thn ke-{item.horizon_year_bucket} ({item.tahun_pensiun})
                          </span>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="text-xs text-slate-700 leading-snug">
                            {item.rekomendasi_suksesi}
                          </div>
                        </td>

                        <td className="p-3 text-right">
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

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredProjections.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                Tidak ada data sesuai filter.
              </div>
            ) : (
              filteredProjections.map((item) => (
                <div
                  key={item.nip}
                  className={`p-3.5 rounded-xl border space-y-2 ${
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
                      Thn {item.horizon_year_bucket} ({item.tahun_pensiun})
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
                    className="w-full py-1.5 bg-blue-50 text-[#004B87] hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Buka di Pemantauan Pensiun</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
