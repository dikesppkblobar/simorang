import React from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  Baby,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
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

const COLORS = ['#004B87', '#00A3AD', '#82BE00', '#F59E0B', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigateTab,
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-[#64748B] font-body">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004B87] mx-auto mb-2"></div>
        Memuat data statistik dashboard...
      </div>
    );
  }

  const grandAlertsCount =
    stats.alertKgbBulanIni +
    stats.alertPangkatBulanIni +
    stats.pensiunTahunIni +
    stats.alertKp4BulanIni;

  return (
    <div className="space-y-6 pb-12 font-body text-[#1E293B]">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Pegawai & Jabatan Fungsional Jatuh Tempo */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#004B87] border border-[#E2E8F0] flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow group"
          title="Klik untuk membuka Monitor Jatuh Tempo"
        >
          <div className="text-xs font-heading font-semibold text-[#64748B]">Total Pegawai Aktif</div>
          <div className="text-2xl font-heading font-extrabold text-[#004B87] mt-1">{stats.totalPegawaiAktif}</div>
          <div className="text-xs text-[#004B87] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/70 font-semibold mt-2 flex items-center justify-between">
            <span>Fungsional Jatuh Tempo: <strong className="font-heading font-bold text-[#003663]">{stats.fungsionalJatuhTempo ?? 0} ASN</strong></span>
            <Users className="w-4 h-4 text-[#004B87] opacity-90 group-hover:scale-110 transition-transform shrink-0 ml-1" />
          </div>
        </div>

        {/* Stat Card 2: Alert KGB */}
        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#00A3AD] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Alert KGB (H-3 Bln)</div>
          <div className="text-2xl font-heading font-extrabold text-[#00A3AD] mt-1">{stats.alertKgbBulanIni}</div>
          <div className="text-xs text-[#64748B] font-medium mt-2 flex items-center justify-between">
            <span>Perlu Validasi SK</span>
            <Clock className="w-4 h-4 text-[#00A3AD] opacity-80" />
          </div>
        </div>

        {/* Stat Card 3: Alert Pangkat */}
        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#004B87] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Alert Pangkat</div>
          <div className="text-2xl font-heading font-extrabold text-[#004B87] mt-1">{stats.alertPangkatBulanIni}</div>
          <div className="text-xs text-[#64748B] font-medium mt-2 flex items-center justify-between">
            <span>Periode BKN Terdekat</span>
            <CalendarDays className="w-4 h-4 text-[#004B87] opacity-80" />
          </div>
        </div>

        {/* Stat Card 4: Alert KP4 */}
        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#82BE00] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Alert KP4 (Anak)</div>
          <div className="text-2xl font-heading font-extrabold text-[#82BE00] mt-1">{stats.alertKp4BulanIni}</div>
          <div className="text-xs text-[#6ea000] font-semibold mt-2 flex items-center justify-between">
            <span>Melebihi Batas Usia</span>
            <Baby className="w-4 h-4 text-[#82BE00] opacity-80" />
          </div>
        </div>
      </div>

      {/* Welcome & Alert Banner */}
      {grandAlertsCount > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="bg-amber-100 text-amber-900 p-2.5 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#1E293B] text-sm">
                Monitor Jatuh Tempo Active ({grandAlertsCount} Alert Membutuhkan Verifikasi Admin)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Terdapat {stats.alertKgbBulanIni} KGB, {stats.alertPangkatBulanIni} Kenaikan Pangkat, {stats.pensiunTahunIni} Pensiun, dan {stats.alertKp4BulanIni} Verifikasi Anak KP4 untuk mencegah pengembalian tunjangan BPK.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="btn-primary shrink-0 text-xs px-4 py-2"
          >
            <span>Buka Monitor Jatuh Tempo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center space-x-3 text-[#1E293B] shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#82BE00] shrink-0" />
          <p className="text-xs font-medium text-[#1E293B]">
            Semua perhitungan jatuh tempo saat ini dalam kondisi aman dan terverifikasi.
          </p>
        </div>
      )}

      {/* Standard Charts Row: Komposisi Jabatan & Sebaran Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Komposisi Jabatan */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#1E293B]">Komposisi Jenis Jabatan ASN</h3>
              <p className="text-xs text-[#64748B]">Fungsional vs Pelaksana vs Struktural</p>
            </div>
            <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-1 rounded font-medium">
              Deterministik
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.jabatanDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {stats.jabatanDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Pegawai`, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Komposisi Unit Kerja */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Sebaran Pegawai Per Unit Kerja</h3>
              <p className="text-xs text-[#64748B]">Dinas Kesehatan & Puskesmas Se-Kab. Lombok Barat</p>
            </div>
            <span className="text-xs bg-slate-100 text-[#64748B] px-2 py-1 rounded font-medium">
              Unit Aktif
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.unitKerjaDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value} Pegawai`, 'Jumlah']} />
                <Bar dataKey="count" name="Jumlah Pegawai" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

