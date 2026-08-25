import React, { useState } from 'react';
import {
  Settings,
  Building,
  Globe,
  Users,
  FileSpreadsheet,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserAndUnitManagementView } from './UserAndUnitManagementView';
import { EksporLaporanView } from './EksporLaporanView';
import { AuditLogsView } from './AuditLogsView';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AuditLog,
  UserAccount,
  UnitKerjaItem,
} from '../types';
import { isDinasScope } from '../services/dateCalculator';

interface SettingsViewProps {
  currentUser: UserAccount;
  selectedUnitScope: string;
  onSelectUnitScope: (scope: string) => void;
  unitsList: UnitKerjaItem[];
  usersList: UserAccount[];
  pegawaiList: Pegawai[];
  scopedPegawaiList: Pegawai[];
  skList: RiwayatSK[];
  keluargaList: KeluargaKP4[];
  auditLogs: AuditLog[];
  onAddUser: (userData: any) => Promise<boolean>;
  onUpdateUser: (id: string, updates: any) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onAddUnit: (unitData: any) => Promise<boolean>;
  onUpdateUnit: (id: string, updates: any) => Promise<boolean>;
  onDeleteUnit: (id: string) => Promise<boolean>;
  onSwitchUser: (user: UserAccount) => void;
  defaultSubTab?: 'scope' | 'users' | 'export' | 'audit';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  selectedUnitScope,
  onSelectUnitScope,
  unitsList,
  usersList,
  pegawaiList,
  scopedPegawaiList,
  skList,
  keluargaList,
  auditLogs,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onSwitchUser,
  defaultSubTab = 'scope',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scope' | 'users' | 'export' | 'audit'>(defaultSubTab);

  const isAllUnitsActive = selectedUnitScope === 'SEMUA_UNIT';
  const activePegawaiCount = scopedPegawaiList.filter((p) => !p.is_deleted).length;

  const handleToggleAllUnits = (enable: boolean) => {
    if (enable) {
      onSelectUnitScope('SEMUA_UNIT');
    } else {
      onSelectUnitScope('Dinas Kesehatan Kab. Lombok Barat');
    }
  };

  const getScopeBadge = () => {
    if (selectedUnitScope === 'SEMUA_UNIT') {
      return '🌐 Semua Unit Kerja (Gabungan)';
    }
    if (isDinasScope(selectedUnitScope)) {
      return '🏥 Data Dinas Kesehatan (Semua Unit Kategori Dinas)';
    }
    return selectedUnitScope;
  };

  return (
    <div className="space-y-6 font-body text-[#1E293B] pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-[#004B87] shadow-2xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-[#004B87]">
              Pengaturan & Konfigurasi Sistem
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola cakupan data (*scope*), akun pengguna, unit kerja, ekspor laporan, dan catatan audit log.
            </p>
          </div>
        </div>

        {/* Current Scope Pill in Header */}
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex items-center gap-2">
          <Building className="w-4 h-4 text-[#004B87] shrink-0" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Scope Aktif: </span>
            <span className="font-heading font-bold text-[#004B87]">{getScopeBadge()}</span>
            <span className="text-slate-500 font-semibold ml-1.5">({activePegawaiCount} Pegawai Tampil)</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('scope')}
          className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'scope'
              ? 'bg-[#004B87] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Scope Data Disajikan</span>
        </button>

        {currentUser.role === 'Admin Dinkes' && (
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'users'
                ? 'bg-[#004B87] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manajemen User & Unit</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveSubTab('export')}
          className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'export'
              ? 'bg-[#004B87] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Laporan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'audit'
              ? 'bg-[#004B87] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* SUB TAB 1: SCOPE DATA DISAJIKAN */}
      {activeSubTab === 'scope' && (
        <div className="space-y-5">
          {/* Main Card: Kontrol Scope Data */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#004B87]" />
                <h2 className="text-base font-heading font-extrabold text-slate-900">
                  Konfigurasi Cakupan Data (*Scope Data Disajikan*)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Atur apakah aplikasi menampilkan seluruh data gabungan dari semua unit kerja (Puskesmas & Rumah Sakit) atau dibatasi pada Data Dinas Kesehatan / unit tertentu.
              </p>
            </div>

            {/* Scope Status Display Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-blue-700">
                    Status Scope Saat Ini
                  </span>
                  <div className="text-lg font-heading font-extrabold text-[#004B87] mt-1 flex items-center gap-2">
                    {getScopeBadge()}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Saat ini aplikasi menampilkan data sesuai cakupan ini pada modul Dashboard, Data Pegawai, Pemantauan ASN, dan Arsip.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span>Jumlah Pegawai Tampil:</span>
                  <span className="font-heading font-extrabold text-sm px-2.5 py-0.5 bg-white border border-blue-200 rounded-lg text-[#004B87]">
                    {activePegawaiCount} Pegawai
                  </span>
                </div>
              </div>

              {/* Toggle Switch Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-600">
                    Mode Gabungan Semua Unit
                  </span>
                  <div className="text-sm font-heading font-bold text-slate-800 mt-1">
                    Tampilkan Semua Data Unit Kerja
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Aktifkan untuk melihat data seluruh Puskesmas, Laboratorium, dan RSUD secara komprehensif.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-heading font-bold text-slate-700">Status:</span>
                    {isAllUnitsActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading font-bold bg-teal-100 text-teal-800 border border-teal-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif (Semua Unit)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading font-bold bg-slate-200 text-slate-700 border border-slate-300">
                        <XCircle className="w-3 h-3 mr-1" /> Nonaktif (Unit Terpilih)
                      </span>
                    )}
                  </div>

                  {currentUser.role === 'Admin Dinkes' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAllUnits(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isAllUnitsActive
                            ? 'bg-[#00A3AD] text-white shadow-xs ring-2 ring-teal-200'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ToggleRight className="w-4 h-4" />
                        <span>Aktifkan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAllUnits(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          !isAllUnitsActive
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ToggleLeft className="w-4 h-4" />
                        <span>Nonaktifkan</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      Terkunci oleh Role Akun
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Selection Buttons */}
            {currentUser.role === 'Admin Dinkes' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="text-xs font-heading font-bold text-slate-800">
                  Pilih Cepat Cakupan Unit Kerja:
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectUnitScope('Dinas Kesehatan Kab. Lombok Barat')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      selectedUnitScope === 'Dinas Kesehatan Kab. Lombok Barat'
                        ? 'bg-[#004B87] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>🏥 Data Dinkes (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectUnitScope('SEMUA_UNIT')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      selectedUnitScope === 'SEMUA_UNIT'
                        ? 'bg-[#00A3AD] text-white shadow-xs'
                        : 'bg-teal-50 text-[#00858e] border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 Semua Unit Kerja (Gabungan)</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                    <span className="text-xs text-slate-500 font-medium">Pilih Unit Spesifik:</span>
                    <select
                      value={selectedUnitScope}
                      onChange={(e) => onSelectUnitScope(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004B87]"
                    >
                      <option value="Dinas Kesehatan Kab. Lombok Barat">🏥 Dinas Kesehatan</option>
                      <option value="SEMUA_UNIT">🌐 Semua Unit Kerja (Gabungan)</option>
                      {unitsList
                        .filter((u) => u.nama_unit !== 'Dinas Kesehatan Kab. Lombok Barat')
                        .map((u) => (
                          <option key={u.id} value={u.nama_unit}>
                            {u.nama_unit} ({u.kategori})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Information Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-[#004B87] shrink-0 mt-0.5" />
              <div>
                <strong>Informasi Scope Data:</strong> Filter scope ini berlaku di seluruh modul seperti Master Data Pegawai, Notifikasi KGB & Pangkat, Rekapitulasi KP4, serta Arsip Digital. Anda dapat mengubahnya kapan saja melalui halaman Pengaturan ini atau melalui *bar* navigasi atas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: MANAJEMEN USER & UNIT */}
      {activeSubTab === 'users' && currentUser.role === 'Admin Dinkes' && (
        <UserAndUnitManagementView
          usersList={usersList}
          unitsList={unitsList}
          pegawaiList={pegawaiList}
          currentUser={currentUser}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onAddUnit={onAddUnit}
          onUpdateUnit={onUpdateUnit}
          onDeleteUnit={onDeleteUnit}
          onSwitchUser={onSwitchUser}
        />
      )}

      {/* SUB TAB 3: EKSPOR LAPORAN */}
      {activeSubTab === 'export' && (
        <EksporLaporanView
          pegawaiList={scopedPegawaiList}
          skList={skList}
          keluargaList={keluargaList}
        />
      )}

      {/* SUB TAB 4: AUDIT LOGS */}
      {activeSubTab === 'audit' && <AuditLogsView logs={auditLogs} />}
    </div>
  );
};
