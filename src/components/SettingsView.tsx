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
          {/* Unified Scope Control Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-5">
            {/* Top Bar: Active Scope Status & Quick Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-500">
                      Cakupan Data Disajikan (<em>Scope Data</em>)
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-heading font-bold bg-blue-50 text-[#004B87] border border-blue-200">
                      {activePegawaiCount} Pegawai Tampil
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-heading font-extrabold text-[#004B87] mt-0.5 flex items-center gap-2">
                    {getScopeBadge()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Membatasi data pada modul Dashboard, Data Pegawai, Notifikasi KGB & Pangkat, Rekap KP4, dan Arsip.
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Pengalih Mode Gabungan */}
              <div className="flex items-center self-start lg:self-center bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 gap-3 shrink-0">
                <div>
                  <div className="text-xs font-heading font-bold text-slate-800">
                    Mode Gabungan Semua Unit
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAllUnitsActive ? 'Aktif (Seluruh Puskesmas & RS)' : 'Nonaktif (Unit Terpilih)'}
                  </div>
                </div>

                {currentUser.role === 'Admin Dinkes' ? (
                  <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                    <button
                      type="button"
                      id="btn-scope-toggle-all"
                      onClick={() => handleToggleAllUnits(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAllUnitsActive
                          ? 'bg-[#00A3AD] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <ToggleRight className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </button>
                    <button
                      type="button"
                      id="btn-scope-toggle-off"
                      onClick={() => handleToggleAllUnits(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        !isAllUnitsActive
                          ? 'bg-slate-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <ToggleLeft className="w-3.5 h-3.5" />
                      <span>Nonaktif</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    Terkunci Role
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Quick Select Buttons & Specific Unit Dropdown Aligned */}
            {currentUser.role === 'Admin Dinkes' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-heading font-bold text-slate-700 mr-1">
                    Pilih Cepat:
                  </span>
                  <button
                    type="button"
                    id="btn-quick-dinkes"
                    onClick={() => onSelectUnitScope('Dinas Kesehatan Kab. Lombok Barat')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedUnitScope === 'Dinas Kesehatan Kab. Lombok Barat'
                        ? 'bg-[#004B87] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>🏥 Data Dinkes</span>
                  </button>

                  <button
                    type="button"
                    id="btn-quick-all"
                    onClick={() => onSelectUnitScope('SEMUA_UNIT')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedUnitScope === 'SEMUA_UNIT'
                        ? 'bg-[#00A3AD] text-white shadow-2xs'
                        : 'bg-teal-50 text-[#00858e] border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 Semua Unit (Gabungan)</span>
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

          {/* Clean Muted Footer Info */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>Petunjuk:</strong> Cakupan data (<em>scope</em>) ini membatasi data yang ditampilkan di Dashboard, Data Pegawai, Notifikasi KGB & Pangkat, serta Laporan. Anda juga dapat menggantinya melalui tombol <em>scope</em> di navbar atas.
            </span>
          </div>

          {!featureConfig.scope_data_unrestricted && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Catatan Master Fitur:</strong> Mode Scope Terkunci aktif di Master Fitur. Data disajikan dan penambahan akun saat ini dibatasi hanya untuk unit kerja Dinas Kesehatan.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
