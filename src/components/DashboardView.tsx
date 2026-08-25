import React from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  Baby,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Building2,
  ShieldCheck,
  Briefcase,
  Layers,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { DashboardStats, Pegawai, UnitKerjaItem, RiwayatSK, KeluargaKP4 } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  pegawaiList?: Pegawai[];
  unitsList?: UnitKerjaItem[];
  skList?: RiwayatSK[];
  keluargaList?: KeluargaKP4[];
  onNavigateTab: (tab: string, subTab?: string) => void;
  onOpenAddPegawai: () => void;
  onOpenUploadSk: () => void;
}

const JABATAN_COLORS: Record<string, string> = {
  Pelaksana: '#004B87',
  Fungsional: '#00A3AD',
  Struktural: '#82BE00',
  'Non-ASN': '#F59E0B',
  Lainnya: '#64748B',
};

const DEFAULT_COLORS = ['#004B87', '#00A3AD', '#82BE00', '#F59E0B', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  pegawaiList = [],
  onNavigateTab,
}) => {
  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-500 font-body">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#004B87] mx-auto mb-3"></div>
        <p className="text-sm font-medium">Memuat data statistik dashboard...</p>
      </div>
    );
  }

  const grandAlertsCount =
    stats.alertKgbBulanIni +
    stats.alertPangkatBulanIni +
    stats.pensiunTahunIni +
    stats.alertKp4BulanIni;

  // Active Pegawai in Scope
  const activePegawai = (pegawaiList || []).filter((p) => !p.is_deleted);

  // Detail Breakdown per Jenis Jabatan (Pelaksana, Fungsional, Struktural)
  // Termasuk perincian status kepegawaian: PNS, PPPK Penuh Waktu, PPPK Paruh Waktu, Non-ASN
  interface JabatanDetailBreakdown {
    name: string;
    total: number;
    pns: number;
    pppkPenuh: number;
    pppkParuh: number;
    nonAsn: number;
  }

  const jabatanMap: Record<string, JabatanDetailBreakdown> = {
    Pelaksana: { name: 'Pelaksana', total: 0, pns: 0, pppkPenuh: 0, pppkParuh: 0, nonAsn: 0 },
    Fungsional: { name: 'Fungsional', total: 0, pns: 0, pppkPenuh: 0, pppkParuh: 0, nonAsn: 0 },
    Struktural: { name: 'Struktural', total: 0, pns: 0, pppkPenuh: 0, pppkParuh: 0, nonAsn: 0 },
  };

  activePegawai.forEach((p) => {
    const rawJabatan = p.jenis_jabatan || 'Fungsional';
    const jabKey = ['Pelaksana', 'Fungsional', 'Struktural'].includes(rawJabatan)
      ? rawJabatan
      : 'Fungsional';

    if (!jabatanMap[jabKey]) {
      jabatanMap[jabKey] = { name: jabKey, total: 0, pns: 0, pppkPenuh: 0, pppkParuh: 0, nonAsn: 0 };
    }

    jabatanMap[jabKey].total += 1;

    if (p.status_kepegawaian === 'PNS') {
      jabatanMap[jabKey].pns += 1;
    } else if (p.status_kepegawaian === 'PPPK Penuh Waktu') {
      jabatanMap[jabKey].pppkPenuh += 1;
    } else if (p.status_kepegawaian === 'PPPK Paruh Waktu') {
      jabatanMap[jabKey].pppkParuh += 1;
    } else {
      jabatanMap[jabKey].nonAsn += 1;
    }
  });

  // Calculate overall ASN status totals
  const totalPns = activePegawai.filter((p) => p.status_kepegawaian === 'PNS').length;
  const totalPppkPenuh = activePegawai.filter((p) => p.status_kepegawaian === 'PPPK Penuh Waktu').length;
  const totalPppkParuh = activePegawai.filter((p) => p.status_kepegawaian === 'PPPK Paruh Waktu').length;
  const totalNonAsn = activePegawai.filter((p) => p.status_kepegawaian === 'Non-ASN').length;

  // Calculate totals for Jabatan Distribution
  const totalJabatanCount = stats.jabatanDistribution.reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  ) || activePegawai.length;

  // Filter non-zero items for donut chart visualization
  const nonZeroJabatan = stats.jabatanDistribution.filter((item) => item.count > 0);
  const chartPieData =
    nonZeroJabatan.length > 0
      ? nonZeroJabatan
      : [
          { name: 'Pelaksana', count: jabatanMap.Pelaksana.total },
          { name: 'Fungsional', count: jabatanMap.Fungsional.total },
          { name: 'Struktural', count: jabatanMap.Struktural.total },
        ].filter((item) => item.count > 0);

  const displayPieData = chartPieData.length > 0 ? chartPieData : [{ name: 'Belum Ada Data', count: 1 }];

  return (
    <div className="space-y-6 pb-12 font-body text-slate-800">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Pegawai Aktif */}
        <div
          id="stat-card-total-pegawai"
          onClick={() => onNavigateTab('pegawai')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#004B87]/50 hover:shadow-md transition-all duration-200 group relative"
          title="Klik untuk membuka Direktori Data Pegawai Lengkap"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
              Total Pegawai Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004B87] flex items-center justify-center group-hover:bg-[#004B87] group-hover:text-white transition-colors duration-200">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-heading font-extrabold text-[#004B87] tracking-tight">
              {stats.totalPegawaiAktif}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-normal">Fungsional Jatuh Tempo:</span>
            <span className="font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded text-[11px]">
              {stats.fungsionalJatuhTempo ?? 0} ASN
            </span>
          </div>
        </div>

        {/* Stat Card 2: Alert KGB -> Direct to alerts/kgb */}
        <div
          id="stat-card-alert-kgb"
          onClick={() => onNavigateTab('alerts', 'kgb')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#00A3AD]/60 hover:shadow-md transition-all duration-200 group relative"
          title="Daftar Pegawai Jatuh Tempo KGB (Kenaikan Gaji Berkala) - Siklus 2 Tahun (24 Bulan) | Terhitung H-3 Bulan"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
                Alert KGB (H-3 Bln)
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Siklus 2 Th (24 Bulan)</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00A3AD] flex items-center justify-center group-hover:bg-[#00A3AD] group-hover:text-white transition-colors duration-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-heading font-extrabold text-[#00A3AD] tracking-tight">
              {stats.alertKgbBulanIni}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-normal">Buka Pemantauan KGB:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${stats.alertKgbBulanIni > 0 ? 'bg-teal-50 text-[#00858e]' : 'bg-slate-100 text-slate-600'}`}>
              {stats.alertKgbBulanIni > 0 ? 'Perlu Validasi' : 'Tertib'}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Stat Card 3: Alert Pangkat -> Direct to alerts/pangkat */}
        <div
          id="stat-card-alert-pangkat"
          onClick={() => onNavigateTab('alerts', 'pangkat')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#004B87]/60 hover:shadow-md transition-all duration-200 group relative"
          title="Pusat Pemantauan Kenaikan Pangkat (KP) - 6 Periode BKN | Terhitung H-6 Bulan"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
                Alert Kenaikan Pangkat
              </span>
              <p className="text-[10px] text-slate-400 font-medium">6 Periode Usulan BKN</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004B87] flex items-center justify-center group-hover:bg-[#004B87] group-hover:text-white transition-colors duration-200">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-heading font-extrabold text-[#004B87] tracking-tight">
              {stats.alertPangkatBulanIni}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-normal">Buka Pemantauan KP:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${stats.alertPangkatBulanIni > 0 ? 'bg-blue-50 text-[#004B87]' : 'bg-slate-100 text-slate-600'}`}>
              {stats.alertPangkatBulanIni > 0 ? 'Siap Usul' : 'Aman'}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Stat Card 4: Alert KP4 -> Direct to alerts/kp4 */}
        <div
          id="stat-card-alert-kp4"
          onClick={() => onNavigateTab('alerts', 'kp4')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#82BE00]/60 hover:shadow-md transition-all duration-200 group relative"
          title="Pemantauan KP4 / Evaluasi Batas Usia Anak (21-25 Th) & Tunjangan Keluarga"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
                Alert KP4 (Tunjangan)
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Batas Usia Anak 21-25 Th</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-lime-50 text-[#6ea000] flex items-center justify-center group-hover:bg-[#82BE00] group-hover:text-white transition-colors duration-200">
              <Baby className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-heading font-extrabold text-[#82BE00] tracking-tight">
              {stats.alertKp4BulanIni}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-normal">Buka Pemantauan KP4:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${stats.alertKp4BulanIni > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {stats.alertKp4BulanIni > 0 ? 'Evaluasi Anak' : 'Tertib'}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner (Interactive Quick-Jump Monitor) */}
      {grandAlertsCount > 0 ? (
        <div
          id="dashboard-alert-banner"
          className="bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white border border-amber-200/80 rounded-xl p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-bold text-slate-900 text-sm tracking-tight">
                  Pusat Pemantauan Jatuh Tempo ASN Aktif
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/80 text-amber-900">
                  {grandAlertsCount} Agenda Perlu Verifikasi
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pilih kategori untuk langsung menuju tabel pemantauan:
              </p>
              {/* Quick Navigation Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <button
                  onClick={() => onNavigateTab('alerts', 'kgb')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 hover:border-teal-300 transition-colors shadow-2xs cursor-pointer"
                  title="Buka Daftar Pegawai Jatuh Tempo KGB (Kenaikan Gaji Berkala)"
                >
                  <Clock className="w-3 h-3 text-teal-600" />
                  <span>KGB: <strong className="text-teal-900">{stats.alertKgbBulanIni}</strong></span>
                </button>
                <button
                  onClick={() => onNavigateTab('alerts', 'pangkat')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                  title="Buka Pemantauan Kenaikan Pangkat (KP)"
                >
                  <CalendarDays className="w-3 h-3 text-blue-600" />
                  <span>Pangkat: <strong className="text-blue-900">{stats.alertPangkatBulanIni}</strong></span>
                </button>
                <button
                  onClick={() => onNavigateTab('alerts', 'pensiun')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 hover:border-purple-300 transition-colors shadow-2xs cursor-pointer"
                  title="Buka Pemantauan Pensiun"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Pensiun: <strong className="text-purple-900">{stats.pensiunTahunIni}</strong></span>
                </button>
                <button
                  onClick={() => onNavigateTab('alerts', 'kp4')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-lime-300 text-lime-900 hover:bg-lime-50 hover:border-lime-400 transition-colors shadow-2xs cursor-pointer"
                  title="Buka Pemantauan KP4 (Tunjangan Anak/Keluarga)"
                >
                  <Baby className="w-3 h-3 text-lime-700" />
                  <span>KP4 Anak: <strong className="text-lime-950">{stats.alertKp4BulanIni}</strong></span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center self-end md:self-center shrink-0">
            <button
              onClick={() => onNavigateTab('alerts')}
              className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300/60 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span>Buka Semua Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          id="dashboard-alert-banner-safe"
          className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between text-slate-800 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">
                Semua Administrasi Kepegawaian Tertib & Terkendali
              </p>
              <p className="text-[11px] text-emerald-700">
                Tidak ada agenda jatuh tempo mendesak yang memerlukan tindakan segera saat ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Pusat Pemantauan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Visual Charts Grid: Komposisi Jabatan & Sebaran Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Komposisi Jenis Jabatan ASN (Clean, Centered Interactive Donut & Integrated Progress Bar) */}
        <div
          id="chart-card-jabatan"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
        >
          {/* Header Ringkas */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#004B87]" />
              <span>Komposisi Jenis Jabatan ASN</span>
            </h3>
            <button
              onClick={() => onNavigateTab('pegawai')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004B87] hover:text-[#003366] bg-blue-50/90 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Langsung menuju Data Pegawai"
            >
              <span>Lihat di Daftar Pegawai</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar / Bar Terpadu Status Kepegawaian ASN */}
          <div className="pt-3 pb-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
              <span className="font-medium text-slate-600">Status Kepegawaian ({totalJabatanCount} ASN):</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#004B87]" />
                  <span>PNS <strong className="text-slate-800 font-semibold">{totalPns}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00A3AD]" />
                  <span>PPPK Penuh <strong className="text-slate-800 font-semibold">{totalPppkPenuh}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#82BE00]" />
                  <span>PPPK Paruh <strong className="text-slate-800 font-semibold">{totalPppkParuh}</strong></span>
                </span>
                {totalNonAsn > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Non-ASN <strong className="text-slate-800 font-semibold">{totalNonAsn}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Multi-colored interactive thin progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden shadow-2xs">
              {totalJabatanCount > 0 && (
                <>
                  <div
                    style={{ width: `${(totalPns / totalJabatanCount) * 100}%` }}
                    className="bg-[#004B87] transition-all duration-300 hover:brightness-110"
                    title={`PNS: ${totalPns} (${((totalPns / totalJabatanCount) * 100).toFixed(1)}%)`}
                  />
                  <div
                    style={{ width: `${(totalPppkPenuh / totalJabatanCount) * 100}%` }}
                    className="bg-[#00A3AD] transition-all duration-300 hover:brightness-110"
                    title={`PPPK Penuh Waktu: ${totalPppkPenuh} (${((totalPppkPenuh / totalJabatanCount) * 100).toFixed(1)}%)`}
                  />
                  <div
                    style={{ width: `${(totalPppkParuh / totalJabatanCount) * 100}%` }}
                    className="bg-[#82BE00] transition-all duration-300 hover:brightness-110"
                    title={`PPPK Paruh Waktu: ${totalPppkParuh} (${((totalPppkParuh / totalJabatanCount) * 100).toFixed(1)}%)`}
                  />
                  {totalNonAsn > 0 && (
                    <div
                      style={{ width: `${(totalNonAsn / totalJabatanCount) * 100}%` }}
                      className="bg-[#F59E0B] transition-all duration-300 hover:brightness-110"
                      title={`Non-ASN: ${totalNonAsn} (${((totalNonAsn / totalJabatanCount) * 100).toFixed(1)}%)`}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Visual Utama: Centered Interactive Donut Chart */}
          <div className="h-52 relative my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={displayPieData.length > 1 ? 4 : 0}
                  dataKey="count"
                  isAnimationActive={true}
                  cursor="pointer"
                  onClick={() => onNavigateTab('pegawai')}
                >
                  {displayPieData.map((entry, index) => {
                    const color =
                      JABATAN_COLORS[entry.name] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const jabName = data.name;
                      const detail = jabatanMap[jabName] || {
                        total: data.count,
                        pns: 0,
                        pppkPenuh: 0,
                        pppkParuh: 0,
                        nonAsn: 0,
                      };
                      const percent =
                        totalJabatanCount > 0
                          ? ((detail.total / totalJabatanCount) * 100).toFixed(1)
                          : '0';
                      const color = JABATAN_COLORS[jabName] || '#004B87';

                      return (
                        <div className="bg-slate-900/95 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-xs min-w-[210px]">
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-white text-xs font-heading">{jabName}</span>
                            </div>
                            <span className="font-bold text-white text-xs">
                              {detail.total} ASN <span className="text-slate-300 text-[11px] font-normal">({percent}%)</span>
                            </span>
                          </div>
                          <div className="pt-2 space-y-1 text-[11px]">
                            <div className="flex justify-between text-slate-300">
                              <span>PNS:</span>
                              <span className="font-semibold text-white">{detail.pns}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>PPPK Penuh Waktu:</span>
                              <span className="font-semibold text-white">{detail.pppkPenuh}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>PPPK Paruh Waktu:</span>
                              <span className="font-semibold text-white">{detail.pppkParuh}</span>
                            </div>
                            {detail.nonAsn > 0 && (
                              <div className="flex justify-between text-amber-300">
                                <span>Non-ASN:</span>
                                <span className="font-semibold">{detail.nonAsn}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-heading font-extrabold text-slate-800 tracking-tight">
                {totalJabatanCount}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Total ASN
              </span>
            </div>
          </div>

          {/* Legenda Minimalis di Bawah Grafik */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-600">
            <div
              onClick={() => onNavigateTab('pegawai')}
              className="flex items-center gap-1.5 hover:text-[#004B87] cursor-pointer transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#004B87]" />
              <span className="font-medium">Pelaksana</span>
            </div>
            <div
              onClick={() => onNavigateTab('pegawai')}
              className="flex items-center gap-1.5 hover:text-[#00A3AD] cursor-pointer transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A3AD]" />
              <span className="font-medium">Fungsional</span>
            </div>
            <div
              onClick={() => onNavigateTab('pegawai')}
              className="flex items-center gap-1.5 hover:text-[#82BE00] cursor-pointer transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#82BE00]" />
              <span className="font-medium">Struktural</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Sebaran Pegawai Per Unit Kerja (Dinas Kesehatan & Puskesmas Se-Kab. Lombok Barat) */}
        <div
          id="chart-card-unit-kerja"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
        >
          {/* Card Header with Direct Navigation to Manajemen Unit Kerja */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#004B87]" />
                <span>Sebaran Pegawai Per Unit Kerja</span>
              </h3>
              <p className="text-xs text-slate-500">
                Dinas Kesehatan & Puskesmas Se-Kab. Lombok Barat
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('users_units', 'units')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004B87] hover:text-[#003366] bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Langsung menuju Manajemen Unit Kerja"
            >
              <span>Kelola Unit Kerja</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.unitKerjaDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={35}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} Pegawai`, 'Jumlah']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Jumlah Pegawai"
                  fill="#004B87"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Card Footer Link directly to Manajemen Unit Kerja */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Data unit kerja realtime</span>
            <button
              onClick={() => onNavigateTab('users_units', 'units')}
              className="text-[#004B87] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Kelola Unit Kerja</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
