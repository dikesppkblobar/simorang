import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Users,
  FileSpreadsheet,
  Sliders,
  Building2,
  Database,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import { UserAndUnitManagementView } from './UserAndUnitManagementView';
import { EksporLaporanView } from './EksporLaporanView';
import { MasterFiturTab } from './MasterFiturTab';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  UserAccount,
  UnitKerjaItem,
  AppFeatureConfig,
  DEFAULT_FEATURE_CONFIG,
} from '../types';
import { isDinasScope } from '../services/dateCalculator';

export type SettingsUnifiedTab = 'users' | 'features' | 'units' | 'database' | 'export' | 'scope';

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
  featureConfig?: AppFeatureConfig;
  onUpdateFeatureConfig?: (updates: Partial<AppFeatureConfig>) => Promise<boolean> | boolean;
  onResetFeatureConfig?: () => Promise<boolean> | boolean;
  onAddUser: (userData: any) => Promise<boolean>;
  onUpdateUser: (id: string, updates: any) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onAddUnit: (unitData: any) => Promise<boolean>;
  onUpdateUnit: (id: string, updates: any) => Promise<boolean>;
  onDeleteUnit: (id: string) => Promise<boolean>;
  onSwitchUser: (user: UserAccount) => void;
  defaultSubTab?: 'users' | 'export' | 'scope' | 'features' | 'units' | 'database' | string;
  defaultManagementSubTab?: 'users' | 'features' | 'units' | 'database' | string;
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
  featureConfig = DEFAULT_FEATURE_CONFIG,
  onUpdateFeatureConfig = () => true,
  onResetFeatureConfig = () => true,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onSwitchUser,
  defaultSubTab = 'users',
  defaultManagementSubTab = 'users',
}) => {
  const resolveInitialTab = (): SettingsUnifiedTab => {
    if (currentUser.role !== 'Admin Dinkes') {
      if (defaultSubTab === 'scope') return 'scope';
      return 'export';
    }

    if (defaultSubTab === 'export') return 'export';
    if (defaultSubTab === 'scope') return 'scope';
    if (defaultSubTab === 'features') return 'features';
    if (defaultSubTab === 'units') return 'units';
    if (defaultSubTab === 'database') return 'database';

    if (defaultSubTab === 'users') {
      if (defaultManagementSubTab === 'features') return 'features';
      if (defaultManagementSubTab === 'units') return 'units';
      if (defaultManagementSubTab === 'database') return 'database';
      return 'users';
    }

    return 'users';
  };

  const [activeTab, setActiveTab] = useState<SettingsUnifiedTab>(resolveInitialTab);

  useEffect(() => {
    setActiveTab(resolveInitialTab());
  }, [defaultSubTab, defaultManagementSubTab, currentUser.role]);

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
      {/* 1 Single Consolidated Header for Settings */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0 shadow-2xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-heading font-extrabold text-[#004B87] tracking-tight">
                Pengaturan & Konfigurasi Sistem
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Kelola hak akses pengguna, master fitur, master unit kerja, database cloud, ekspor laporan, dan cakupan data (<em>scope</em>).
              </p>
            </div>
          </div>

          {/* Sesi Pengguna Aktif */}
          <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl flex items-center space-x-3 shrink-0 self-start md:self-auto">
            <div className="w-8 h-8 rounded-lg bg-[#004B87] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
              {currentUser.role === 'Admin Dinkes' ? 'AD' : 'UK'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-heading font-bold text-slate-800 truncate">{currentUser.nama_lengkap}</div>
              <div className="text-[11px] text-slate-500 truncate">{currentUser.role} &bull; {currentUser.unit_kerja}</div>
            </div>
          </div>
        </div>

        {/* Unified Single Navigation Tab Bar */}
        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 overflow-x-auto">
          {currentUser.role === 'Admin Dinkes' && (
            <>
              <button
                type="button"
                id="tab-settings-users"
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Hak Akses & Pengguna ({usersList.length})</span>
              </button>

              <button
                type="button"
                id="tab-settings-features"
                onClick={() => setActiveTab('features')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'features'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Master Fitur</span>
              </button>

              <button
                type="button"
                id="tab-settings-units"
                onClick={() => setActiveTab('units')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'units'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Master Unit Kerja ({unitsList.length})</span>
              </button>

              <button
                type="button"
                id="tab-settings-database"
                onClick={() => setActiveTab('database')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'database'
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Database Cloud</span>
              </button>
            </>
          )}

          <button
            type="button"
            id="tab-settings-export"
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#004B87] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Laporan</span>
          </button>

          <button
            type="button"
            id="tab-settings-scope"
            onClick={() => setActiveTab('scope')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scope'
                ? 'bg-[#004B87] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Scope Data Disajikan</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Hak Akses & Pengguna */}
      {activeTab === 'users' && currentUser.role === 'Admin Dinkes' && (
        <UserAndUnitManagementView
          usersList={usersList}
          unitsList={unitsList}
          pegawaiList={pegawaiList}
          currentUser={currentUser}
          featureConfig={featureConfig}
          onUpdateFeatureConfig={onUpdateFeatureConfig}
          onResetFeatureConfig={onResetFeatureConfig}
          forcedTab="users"
          hideHeader={true}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onAddUnit={onAddUnit}
          onUpdateUnit={onUpdateUnit}
          onDeleteUnit={onDeleteUnit}
          onSwitchUser={onSwitchUser}
        />
      )}

      {/* Tab Content 2: Master Fitur */}
      {activeTab === 'features' && currentUser.role === 'Admin Dinkes' && (
        <MasterFiturTab
          featureConfig={featureConfig}
          currentUser={currentUser}
          onUpdateFeatureConfig={onUpdateFeatureConfig}
          onResetFeatureConfig={onResetFeatureConfig}
        />
      )}

      {/* Tab Content 3: Master Unit Kerja */}
      {activeTab === 'units' && currentUser.role === 'Admin Dinkes' && (
        <UserAndUnitManagementView
          usersList={usersList}
          unitsList={unitsList}
          pegawaiList={pegawaiList}
          currentUser={currentUser}
          featureConfig={featureConfig}
          onUpdateFeatureConfig={onUpdateFeatureConfig}
          onResetFeatureConfig={onResetFeatureConfig}
          forcedTab="units"
          hideHeader={true}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onAddUnit={onAddUnit}
          onUpdateUnit={onUpdateUnit}
          onDeleteUnit={onDeleteUnit}
          onSwitchUser={onSwitchUser}
        />
      )}

      {/* Tab Content 4: Database Cloud */}
      {activeTab === 'database' && currentUser.role === 'Admin Dinkes' && (
        <UserAndUnitManagementView
          usersList={usersList}
          unitsList={unitsList}
          pegawaiList={pegawaiList}
          currentUser={currentUser}
          featureConfig={featureConfig}
          onUpdateFeatureConfig={onUpdateFeatureConfig}
          onResetFeatureConfig={onResetFeatureConfig}
          forcedTab="database"
          hideHeader={true}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onAddUnit={onAddUnit}
          onUpdateUnit={onUpdateUnit}
          onDeleteUnit={onDeleteUnit}
          onSwitchUser={onSwitchUser}
        />
      )}

      {/* Tab Content 5: Ekspor Laporan */}
      {activeTab === 'export' && (
        <EksporLaporanView
          pegawaiList={scopedPegawaiList}
          skList={skList}
          keluargaList={keluargaList}
          hideHeader={true}
        />
      )}

      {/* Tab Content 6: Scope Data Disajikan */}
      {activeTab === 'scope' && (
        <div className="space-y-4 font-body">
          {/* Main Clean Scope Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-5">
            {/* Top Row: Scope Status Header & Quick Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wide">
                    Cakupan Data Aktif (Scope)
                  </div>
                  <div className="text-base sm:text-lg font-heading font-extrabold text-[#004B87] mt-0.5">
                    {getScopeBadge()}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start sm:self-center bg-blue-50/80 border border-blue-200/80 px-3.5 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-[#004B87]" />
                <span className="text-xs font-heading font-extrabold text-[#004B87]">
                  {activePegawaiCount} Pegawai
                </span>
                <span className="text-[11px] text-slate-500 font-medium">dalam cakupan</span>
              </div>
            </div>

            {/* Interactive Mode Selector Cards */}
            {currentUser.role === 'Admin Dinkes' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode 1: Gabungan Semua Unit */}
                <div
                  onClick={() => handleToggleAllUnits(true)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isAllUnitsActive
                      ? 'border-[#00A3AD] bg-teal-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-heading font-bold text-slate-900">
                        🌐 Mode Gabungan Semua Unit
                      </span>
                      {isAllUnitsActive && (
                        <span className="text-[10px] font-heading font-extrabold bg-[#00A3AD] text-white px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Tampilkan seluruh ASN dari Dinas, Puskesmas, dan RSUD ({pegawaiList.filter(p => !p.is_deleted).length} total pegawai).
                    </p>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isAllUnitsActive
                          ? 'border-[#00A3AD] bg-[#00A3AD] text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>

                {/* Mode 2: Unit Terpilih / Dinas */}
                <div
                  onClick={() => {
                    if (isAllUnitsActive) {
                      handleToggleAllUnits(false);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    !isAllUnitsActive
                      ? 'border-[#004B87] bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-heading font-bold text-slate-900">
                        🏥 Unit Kerja Terpilih
                      </span>
                      {!isAllUnitsActive && (
                        <span className="text-[10px] font-heading font-extrabold bg-[#004B87] text-white px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Tampilkan data khusus untuk unit kerja yang dipilih di bawah.
                    </p>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        !isAllUnitsActive
                          ? 'border-[#004B87] bg-[#004B87] text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Scope akun Anda dikunci untuk unit kerja <strong>{currentUser.unit_kerja}</strong>.
              </div>
            )}

            {/* Quick Filter & Specific Unit Selector */}
            {currentUser.role === 'Admin Dinkes' && (
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-heading font-bold text-slate-700">Pilih Cepat:</span>
                  <button
                    type="button"
                    onClick={() => onSelectUnitScope('Dinas Kesehatan Kab. Lombok Barat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                      selectedUnitScope === 'Dinas Kesehatan Kab. Lombok Barat'
                        ? 'bg-[#004B87] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🏥 Data Dinkes
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectUnitScope('SEMUA_UNIT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                      selectedUnitScope === 'SEMUA_UNIT'
                        ? 'bg-[#00A3AD] text-white shadow-2xs'
                        : 'bg-teal-50 text-[#00858e] border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    🌐 Semua Unit
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Pilih Unit Spesifik:
                  </span>
                  <select
                    id="select-scope-unit-spesifik"
                    value={selectedUnitScope}
                    onChange={(e) => onSelectUnitScope(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004B87] focus:bg-white"
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
