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
  Sparkles,
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
  onNavigateTab: (tab: string) => void;
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

  // Calculate totals and percentages for Jabatan Distribution
  const totalJabatanCount = stats.jabatanDistribution.reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  );

  // Filter non-zero items for donut chart visualization to prevent overlapping slices & lines
  const nonZeroJabatan = stats.jabatanDistribution.filter((item) => item.count > 0);
  const chartPieData =
    nonZeroJabatan.length > 0
      ? nonZeroJabatan
      : [{ name: 'Belum Ada Data', count: 1 }];

  return (
    <div className="space-y-6 pb-12 font-body text-slate-800">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Pegawai Aktif */}
        <div
          id="stat-card-total-pegawai"
          onClick={() => onNavigateTab('pegawai')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#004B87]/40 hover:shadow-sm transition-all duration-200 group"
          title="Klik untuk membuka Direktori Pegawai"
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

        {/* Stat Card 2: Alert KGB */}
        <div
          id="stat-card-alert-kgb"
          onClick={() => onNavigateTab('alerts')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#00A3AD]/40 hover:shadow-sm transition-all duration-200 group"
          title="Klik untuk membuka Monitor Jatuh Tempo KGB"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
              Alert KGB (H-3 Bln)
            </span>
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
            <span className="text-slate-500 font-normal">Status Verifikasi:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${stats.alertKgbBulanIni > 0 ? 'bg-teal-50 text-[#00858e]' : 'bg-slate-100 text-slate-600'}`}>
              {stats.alertKgbBulanIni > 0 ? 'Perlu Validasi SK' : 'Semua Beres'}
            </span>
          </div>
        </div>

        {/* Stat Card 3: Alert Pangkat */}
        <div
          id="stat-card-alert-pangkat"
          onClick={() => onNavigateTab('alerts')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#004B87]/40 hover:shadow-sm transition-all duration-200 group"
          title="Klik untuk membuka Monitor Kenaikan Pangkat"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
              Alert Kenaikan Pangkat
            </span>
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
            <span className="text-slate-500 font-normal">Siklus Usulan:</span>
            <span className="font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded text-[11px]">
              Periode BKN Terdekat
            </span>
          </div>
        </div>

        {/* Stat Card 4: Alert KP4 */}
        <div
          id="stat-card-alert-kp4"
          onClick={() => onNavigateTab('kp4')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#82BE00]/40 hover:shadow-sm transition-all duration-200 group"
          title="Klik untuk membuka Manajemen KP4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
              Alert KP4 (Tunjangan)
            </span>
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
            <span className="text-slate-500 font-normal">Kategori Evaluasi:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${stats.alertKp4BulanIni > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {stats.alertKp4BulanIni > 0 ? 'Batas Usia Anak' : 'Tertib Validasi'}
            </span>
          </div>
        </div>
      </div>

      {/* Optimized Alert Banner (Soft Warning Card) */}
      {grandAlertsCount > 0 ? (
        <div
          id="dashboard-alert-banner"
          onClick={() => onNavigateTab('alerts')}
          className="bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white border border-amber-200/80 rounded-xl p-4.5 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-bold text-slate-900 text-sm tracking-tight">
                  Monitor Jatuh Tempo Aktif
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/80 text-amber-900">
                  {grandAlertsCount} Perlu Ditindaklanjuti
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Terdeteksi <span className="font-semibold text-slate-800">{stats.alertKgbBulanIni} KGB</span>,{' '}
                <span className="font-semibold text-slate-800">{stats.alertPangkatBulanIni} Pangkat</span>,{' '}
                <span className="font-semibold text-slate-800">{stats.pensiunTahunIni} Pensiun</span>, dan{' '}
                <span className="font-semibold text-slate-800">{stats.alertKp4BulanIni} KP4 Anak</span> yang mendekati batas waktu administratif.
              </p>
            </div>
          </div>

          <div className="flex items-center self-end md:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-amber-900 bg-amber-100/90 group-hover:bg-amber-200/90 border border-amber-300/60 px-3.5 py-2 rounded-lg transition-colors">
              <span>Buka Monitor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
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
                Semua Administrasi Kepegawaian Tertib
              </p>
              <p className="text-[11px] text-emerald-700">
                Tidak ada agenda jatuh tempo mendesak yang memerlukan tindakan segera.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
            Status Aman
          </span>
        </div>
      )}

      {/* Visual Charts Grid: Komposisi Jabatan & Sebaran Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Komposisi Jabatan dengan Donut & Legend Terpisah */}
        <div
          id="chart-card-jabatan"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900">
                Komposisi Jenis Jabatan ASN
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi peran Pelaksana, Fungsional, dan Struktural
              </p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold font-heading">
              Total {totalJabatanCount} ASN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3">
            {/* Donut Chart Canvas */}
            <div className="sm:col-span-6 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={chartPieData.length > 1 ? 4 : 0}
                    dataKey="count"
                    isAnimationActive={true}
                  >
                    {chartPieData.map((entry, index) => {
                      const color =
                        JABATAN_COLORS[entry.name] ||
                        DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} Pegawai (${totalJabatanCount > 0 ? ((Number(value) / totalJabatanCount) * 100).toFixed(1) : 0}%)`,
                      `${name}`,
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-heading font-extrabold text-slate-800">
                  {totalJabatanCount}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Pegawai
                </span>
              </div>
            </div>

            {/* Separated Clean Legend Table/List */}
            <div className="sm:col-span-6 space-y-2">
              <div className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Rincian Kategori Jabatan
              </div>

              {stats.jabatanDistribution.map((item, index) => {
                const color =
                  JABATAN_COLORS[item.name] ||
                  DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                const percentage =
                  totalJabatanCount > 0
                    ? ((item.count / totalJabatanCount) * 100).toFixed(1)
                    : '0.0';
                const isZero = item.count === 0;

                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      isZero
                        ? 'border-slate-100 bg-slate-50/50 opacity-60'
                        : 'border-slate-100 bg-slate-50/80 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className={`text-xs truncate font-medium ${
                          isZero ? 'text-slate-500' : 'text-slate-800 font-semibold'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-heading font-bold text-slate-700">
                        {item.count} ASN
                      </span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                          isZero
                            ? 'bg-slate-200/50 text-slate-400'
                            : 'bg-white text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sesuai standar klasifikasi MenPAN-RB</span>
            <button
              onClick={() => onNavigateTab('pegawai')}
              className="text-[#004B87] hover:underline font-semibold flex items-center gap-0.5"
            >
              Lihat di Daftar Pegawai
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chart 2: Komposisi Unit Kerja */}
        <div
          id="chart-card-unit-kerja"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900">
                Sebaran Pegawai Per Unit Kerja
              </h3>
              <p className="text-xs text-slate-500">
                Dinas Kesehatan & Puskesmas Se-Kab. Lombok Barat
              </p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold font-heading">
              {stats.unitKerjaDistribution?.length || 0} Unit
            </span>
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

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Data tersinkronisasi realtime</span>
            <button
              onClick={() => onNavigateTab('users_units')}
              className="text-[#004B87] hover:underline font-semibold flex items-center gap-0.5"
            >
              Kelola Unit Kerja
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


