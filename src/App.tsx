import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Users,
  Calendar,
  FolderOpen,
  FileSpreadsheet,
  ShieldAlert,
  UserCog,
  Building,
  Globe,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  AppWindow,
  Settings,
  ToggleLeft,
  ToggleRight,
  Sliders,
} from 'lucide-react';
import { dbStore } from './services/dbStore';
import { apiClient } from './services/apiClient';
import {
  calculateKgbAlerts,
  calculatePangkatAlerts,
  calculatePensiunAlerts,
  calculateKp4AnakAlerts,
  isDinasCategory,
  isDinasScope,
} from './services/dateCalculator';
import { Navbar } from './components/Navbar';
import { LogoLombokBarat } from './components/LogoLombokBarat';
import { DashboardView } from './components/DashboardView';
import { AlertCenterView } from './components/AlertCenterView';
import { PegawaiSimpegView } from './components/PegawaiSimpegView';
import { Kp4TunjanganView } from './components/Kp4TunjanganView';
import { ArsipDigitalView } from './components/ArsipDigitalView';
import { EksporLaporanView } from './components/EksporLaporanView';
import { AuditLogsView } from './components/AuditLogsView';
import { UserAndUnitManagementView } from './components/UserAndUnitManagementView';
import { AplikasiKepegawaianView } from './components/AplikasiKepegawaianView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { UploadSkModal } from './components/UploadSkModal';
import {
  DashboardStats,
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AuditLog,
  JenisSK,
  UserAccount,
  UnitKerjaItem,
  AplikasiKepegawaian,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Master State
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [skList, setSkList] = useState<RiwayatSK[]>([]);
  const [keluargaList, setKeluargaList] = useState<KeluargaKP4[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [unitsList, setUnitsList] = useState<UnitKerjaItem[]>(() => dbStore.getAllUnits());
  const [aplikasiList, setAplikasiList] = useState<AplikasiKepegawaian[]>([]);

  // Current Logged-in User Account
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const allUsers = dbStore.getAllUsers();
    return (
      allUsers[0] || {
        id: 'usr-001',
        username: 'admin.dinkes',
        nama_lengkap: 'dr. H. AHMAD SYAMSUL (Admin Utama)',
        email: 'admin.dikes@lombokbaratkab.go.id',
        role: 'Admin Dinkes',
        unit_kerja: 'Dinas Kesehatan Kab. Lombok Barat',
        status: 'Aktif',
        created_at: new Date().toISOString(),
      }
    );
  });

  // Login / Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem('sipatuh_is_logged_in');
      return saved === 'true';
    }
    return false;
  });

  // Selected Unit Scope Filter ('Dinas Kesehatan Kab. Lombok Barat', 'SEMUA_UNIT', or specific unit)
  const [selectedUnitScope, setSelectedUnitScope] = useState<string>(
    'Dinas Kesehatan Kab. Lombok Barat'
  );

  // Modal Upload SK
  const [isUploadSkModalOpen, setIsUploadSkModalOpen] = useState(false);
  const [selectedNipForSk, setSelectedNipForSk] = useState<string | undefined>(undefined);
  const [defaultJenisSkForModal, setDefaultJenisSkForModal] = useState<JenisSK>('KGB');

  // Load Data
  const refreshData = async () => {
    try {
      const [p, sk, k, log, usr, unit, apps] = await Promise.all([
        apiClient.getPegawaiList(true),
        apiClient.getAllSk(),
        apiClient.getAllKeluarga(),
        apiClient.getAuditLogs(),
        apiClient.getAllUsers(),
        apiClient.getAllUnits(),
        apiClient.getAplikasiList(),
      ]);
      setPegawaiList(p);
      setSkList(sk);
      setKeluargaList(k);
      setAuditLogs(log);
      setUsersList(usr);
      setUnitsList(unit);
      setAplikasiList(apps);
    } catch (err) {
      console.error('Error refreshing data from API:', err);
      // Fallback
      setPegawaiList([...dbStore.getPegawaiList(true)]);
      setSkList([...dbStore.getAllSk()]);
      setKeluargaList([...dbStore.getAllKeluarga()]);
      setAuditLogs([...dbStore.getAuditLogs()]);
      setUsersList([...dbStore.getAllUsers()]);
      setUnitsList([...dbStore.getAllUnits()]);
      setAplikasiList([...dbStore.getAllAplikasi()]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle Switching User
  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'Admin Unit Kerja') {
      setSelectedUnitScope(user.unit_kerja);
    } else {
      setSelectedUnitScope('Dinas Kesehatan Kab. Lombok Barat');
    }
  };

  // Handle Login Success
  const handleLoginSuccess = (user: UserAccount) => {
    handleSwitchUser(user);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('sipatuh_is_logged_in', 'true');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('sipatuh_is_logged_in');
    }
  };

  // Helper to determine if a Pegawai belongs to Dinas Kesehatan category
  const isPegawaiInDinasCategory = (p: Pegawai, units: UnitKerjaItem[]) => {
    const pUnit = (p.unit_kerja || '').toLowerCase().trim();
    if (!pUnit) return false;

    // 1. Direct keyword check
    if (
      pUnit.includes('dinas kesehatan') ||
      pUnit.includes('dikes') ||
      pUnit.includes('dinkes') ||
      pUnit.includes('dinas')
    ) {
      return true;
    }

    // 2. Unit category lookup in master units list
    const dinasUnits = units.filter((u) => isDinasCategory(u.kategori));
    for (const u of dinasUnits) {
      const uName = (u.nama_unit || '').toLowerCase().trim();
      if (uName && (pUnit === uName || pUnit.includes(uName) || uName.includes(pUnit))) {
        return true;
      }
    }

    return false;
  };

  // Scoped Pegawai Calculation based on selectedUnitScope
  // When scope is Dinas Kesehatan (default for Admin Dinkes), ALL data from units categorized as Dinas Kesehatan are included
  const scopedPegawaiList = pegawaiList.filter((p) => {
    if (selectedUnitScope === 'SEMUA_UNIT') return true;

    // If current scope is Dinas Kesehatan (or user is Admin Dinkes on Dinas scope)
    if (isDinasScope(selectedUnitScope)) {
      return isPegawaiInDinasCategory(p, unitsList);
    }

    const target = selectedUnitScope.toLowerCase().trim();
    const pUnit = (p.unit_kerja || '').toLowerCase().trim();
    return pUnit.includes(target) || target.includes(pUnit);
  });

  // Scoped SKs & Keluarga
  const scopedNips = new Set(scopedPegawaiList.map((p) => p.nip));
  const scopedSkList = skList.filter((s) => scopedNips.has(s.nip_pegawai));
  const scopedKeluargaList = keluargaList.filter((k) => scopedNips.has(k.nip_pegawai));

  // Scoped Alert Calculations
  const scopedKgbAlerts = calculateKgbAlerts(scopedPegawaiList, scopedSkList);
  const scopedPangkatAlerts = calculatePangkatAlerts(scopedPegawaiList, scopedSkList);
  const scopedPensiunAlerts = calculatePensiunAlerts(scopedPegawaiList);
  const scopedKp4Alerts = calculateKp4AnakAlerts(scopedPegawaiList, scopedKeluargaList);

  const totalKgb = scopedKgbAlerts.length;
  const totalPangkat = scopedPangkatAlerts.length;
  const totalPensiun = scopedPensiunAlerts.length;
  const totalKp4 = scopedKp4Alerts.length;
  const grandTotalAlerts = totalKgb + totalPangkat + totalPensiun + totalKp4;

  // Build Dashboard Stats for Scoped View
  const activePegawai = scopedPegawaiList.filter((p) => !p.is_deleted);
  const nonActivePegawai = scopedPegawaiList.filter((p) => p.is_deleted);

  // Distribution by Jabatan
  const jabatanCounts: Record<string, number> = { Fungsional: 0, Pelaksana: 0, Struktural: 0 };
  activePegawai.forEach((p) => {
    if (jabatanCounts[p.jenis_jabatan] !== undefined) {
      jabatanCounts[p.jenis_jabatan]++;
    }
  });

  // Distribution by Unit Kerja
  const unitCounts: Record<string, number> = {};
  activePegawai.forEach((p) => {
    const unitShort = p.unit_kerja.replace('Dinas Kesehatan Kab. Lombok Barat', 'Dikes Kab.');
    unitCounts[unitShort] = (unitCounts[unitShort] || 0) + 1;
  });

  // Jabatan Fungsional yang akan jatuh tempo (KGB, Pangkat, UKKJ)
  const kgbNips = new Set(scopedKgbAlerts.map((a) => a.nip));
  const pangkatNips = new Set(scopedPangkatAlerts.map((a) => a.nip));

  const fungsionalJatuhTempoCount = activePegawai.filter((p) => {
    if (p.jenis_jabatan !== 'Fungsional') return false;
    if (kgbNips.has(p.nip) || pangkatNips.has(p.nip)) return true;
    if (p.status_ukkj === 'Belum UKKJ' || p.status_ukkj === 'Dalam Proses' || p.status_ukom === false) {
      return true;
    }
    return false;
  }).length;

  const dashboardStats: DashboardStats = {
    totalPegawaiAktif: activePegawai.length,
    totalPegawaiNonAktif: nonActivePegawai.length,
    pensiunTahunIni: totalPensiun,
    alertKgbBulanIni: totalKgb,
    alertPangkatBulanIni: totalPangkat,
    alertKp4BulanIni: totalKp4,
    izinBelajarAktif: activePegawai.filter((p) => p.status_izin_belajar).length,
    fungsionalJatuhTempo: fungsionalJatuhTempoCount,
    jabatanDistribution: Object.entries(jabatanCounts).map(([name, count]) => ({ name, count })),
    unitKerjaDistribution: Object.entries(unitCounts).map(([name, count]) => ({ name, count })),
  };

  // Handlers for Pegawai
  const handleAddPegawai = async (formData: any) => {
    try {
      await apiClient.addPegawai(formData, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan pegawai.');
      return false;
    }
  };

  const handleUpdatePegawai = async (nip: string, data: any) => {
    try {
      await apiClient.updatePegawai(nip, data, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data pegawai.');
      return false;
    }
  };

  const handleSoftDeletePegawai = async (nip: string) => {
    try {
      await apiClient.softDeletePegawai(nip, currentUser.email);
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menonaktifkan pegawai.');
    }
  };

  const handleRestorePegawai = async (nip: string) => {
    try {
      await apiClient.restorePegawai(nip, currentUser.email);
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengaktifkan kembali pegawai.');
    }
  };

  const handleFetchDetail = async (nip: string) => {
    const pegawai = pegawaiList.find((p) => p.nip === nip) || dbStore.getPegawaiByNip(nip);
    if (!pegawai) return null;
    const riwayat_sk = skList.filter((s) => s.nip_pegawai === nip);
    const keluarga_kp4 = keluargaList.filter((k) => k.nip_pegawai === nip);
    return { pegawai, riwayat_sk, keluarga_kp4 };
  };

  // Handlers for Users & Units
  const handleAddUser = async (userData: any) => {
    try {
      await apiClient.addUser(userData, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan user.');
      return false;
    }
  };

  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      const updated = await apiClient.updateUser(id, updates, currentUser.email);
      if (currentUser.id === id || (currentUser.username && updates.username && currentUser.username.toLowerCase() === updates.username.toLowerCase())) {
        setCurrentUser((prev) => {
          const next = { ...prev, ...updates, ...(updated || {}) };
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('sipatuh_current_user', JSON.stringify(next));
          }
          return next;
        });
      }
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate user.');
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await apiClient.deleteUser(id, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user.');
      return false;
    }
  };

  const handleAddUnit = async (unitData: any) => {
    try {
      await apiClient.addUnit(unitData, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan unit kerja.');
      return false;
    }
  };

  const handleUpdateUnit = async (id: string, updates: any) => {
    try {
      await apiClient.updateUnit(id, updates, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate unit kerja.');
      return false;
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      await apiClient.deleteUnit(id, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus unit kerja.');
      return false;
    }
  };

  const handleAddKeluarga = async (data: any) => {
    try {
      await apiClient.addKeluarga(data, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan anggota keluarga KP4.');
      return false;
    }
  };

  const handleUpdateKeluarga = async (id: string, updates: Partial<KeluargaKP4>) => {
    try {
      await apiClient.updateKeluarga(id, updates, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui data keluarga KP4.');
      return false;
    }
  };

  const handleDeleteKeluarga = async (id: string) => {
    try {
      await apiClient.deleteKeluarga(id, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus anggota keluarga KP4.');
      return false;
    }
  };

  const handleUpdateTanggungan = async (id: string, status: boolean) => {
    try {
      await apiClient.updateKeluarga(id, { status_tanggungan: status }, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate status tanggungan KP4.');
      return false;
    }
  };

  const handleSubmitSk = async (data: any) => {
    try {
      await apiClient.addSk(data, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan SK.');
      return false;
    }
  };

  // Handlers for Aplikasi Kepegawaian
  const handleAddAplikasi = async (data: Omit<AplikasiKepegawaian, 'id' | 'created_at'>) => {
    try {
      await apiClient.addAplikasi(data, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan aplikasi kepegawaian.');
      return false;
    }
  };

  const handleUpdateAplikasi = async (id: string, data: Partial<AplikasiKepegawaian>) => {
    try {
      await apiClient.updateAplikasi(id, data, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui aplikasi kepegawaian.');
      return false;
    }
  };

  const handleDeleteAplikasi = async (id: string) => {
    try {
      await apiClient.deleteAplikasi(id, currentUser.email);
      await refreshData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus aplikasi kepegawaian.');
      return false;
    }
  };

  const handleOpenUploadSkModal = (nip?: string, defaultJenisSk: JenisSK = 'KGB') => {
    setSelectedNipForSk(nip);
    setDefaultJenisSkForModal(defaultJenisSk);
    setIsUploadSkModalOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'pegawai', label: 'Data Pegawai', icon: Users, badge: null },
    { id: 'alerts', label: 'Pusat Pemantauan ASN', icon: Calendar, badge: grandTotalAlerts },
    { id: 'arsip', label: 'Arsip Digital', icon: FolderOpen, badge: null },
    { id: 'aplikasi', label: 'Aplikasi Kepegawaian', icon: AppWindow, badge: aplikasiList.length },
    { id: 'settings', label: 'Pengaturan', icon: Settings, badge: null },
  ];

  const getScopeLabel = (scope: string) => {
    if (scope === 'SEMUA_UNIT') return '🌐 Semua Unit Kerja (Gabungan)';
    if (scope === 'Dinas Kesehatan Kab. Lombok Barat') return '🏥 Data Dinkes';
    return scope;
  };

  const isAllUnitsActive = selectedUnitScope === 'SEMUA_UNIT';

  if (!isLoggedIn) {
    return (
      <LoginView
        usersList={usersList}
        pegawaiList={pegawaiList}
        skList={skList}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F4F7F9] font-body text-[#1E293B]">
      {/* Top Navbar with User Switcher */}
      <Navbar
        currentUser={currentUser}
        usersList={usersList}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar + View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop when sidebar is open on small screens */}
        {!isSidebarCollapsed && (
          <div
            onClick={() => setIsSidebarCollapsed(true)}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 transition-opacity"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`bg-white border-r border-[#E2E8F0] flex-shrink-0 flex flex-col justify-between select-none shadow-sm transition-all duration-300 z-40 md:z-auto ${
            isSidebarCollapsed
              ? 'w-16'
              : 'fixed inset-y-0 left-0 w-64 md:relative md:inset-auto md:w-64'
          }`}
        >
          {/* Nudge Toggle Button on Edge */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Buka Sidebar' : 'Sembunyikan Sidebar'}
            className="absolute -right-3 top-5 z-30 w-6 h-6 bg-white border border-slate-300 rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-[#004B87] hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          <div>
            {/* Header Section */}
            {isSidebarCollapsed ? (
              <div className="p-3.5 flex items-center justify-center border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Buka Sidebar"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#004B87] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-100 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-heading font-bold text-[#64748B]">
                  NAVIGASI UTAMA
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  title="Sembunyikan Sidebar"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            )}

            <nav className={`space-y-1 ${isSidebarCollapsed ? 'px-2 mt-2' : 'px-3'}`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (isSidebarCollapsed) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={`${item.label}${item.badge !== null && item.badge > 0 ? ` (${item.badge})` : ''}`}
                      className={`w-full h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#004B87] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      {item.badge !== null && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#82BE00] rounded-full ring-2 ring-white" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) {
                        setIsSidebarCollapsed(true);
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-heading font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#004B87] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-heading font-bold ${
                          isActive
                            ? 'bg-white text-[#004B87]'
                            : 'bg-emerald-100 text-[#003663] border border-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={`border-t border-slate-100 bg-slate-50/50 ${isSidebarCollapsed ? 'p-2 text-center' : 'p-4'}`}>
            {isSidebarCollapsed ? (
              <span className="text-[9px] font-mono text-slate-400 font-bold">v2.5</span>
            ) : (
              <div className="text-[11px] text-[#64748B] font-medium text-center">
                SIMORANG DINKES-PPKB
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Kab. Lombok Barat v2.5</div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-3 sm:p-5 md:p-6 overflow-y-auto bg-[#F4F7F9] w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedUnitScope}-${currentUser.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={dashboardStats}
                  pegawaiList={pegawaiList}
                  unitsList={unitsList}
                  skList={skList}
                  keluargaList={keluargaList}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAddPegawai={() => setActiveTab('pegawai')}
                  onOpenUploadSk={() => handleOpenUploadSkModal()}
                />
              )}

              {activeTab === 'pegawai' && (
                <PegawaiSimpegView
                  pegawaiList={scopedPegawaiList}
                  unitsList={unitsList}
                  onAddPegawai={handleAddPegawai}
                  onUpdatePegawai={handleUpdatePegawai}
                  onSoftDeletePegawai={handleSoftDeletePegawai}
                  onRestorePegawai={handleRestorePegawai}
                  onFetchDetail={handleFetchDetail}
                  onOpenUploadSkModal={handleOpenUploadSkModal}
                  onAddKeluarga={handleAddKeluarga}
                  onUpdateKeluarga={handleUpdateKeluarga}
                  onDeleteKeluarga={handleDeleteKeluarga}
                  onUpdateTanggungan={handleUpdateTanggungan}
                />
              )}

              {activeTab === 'alerts' && (
                <AlertCenterView
                  currentUser={currentUser}
                  pegawaiList={scopedPegawaiList}
                  skList={scopedSkList}
                  keluargaList={scopedKeluargaList}
                  kgbAlerts={scopedKgbAlerts}
                  pangkatAlerts={scopedPangkatAlerts}
                  pensiunAlerts={scopedPensiunAlerts}
                  kp4Alerts={scopedKp4Alerts}
                  onOpenUploadSkModal={handleOpenUploadSkModal}
                  onUpdateKp4Tanggungan={handleUpdateTanggungan}
                  onUpdatePegawai={handleUpdatePegawai}
                  onAddKeluarga={handleAddKeluarga}
                  onUpdateKeluarga={handleUpdateKeluarga}
                  onDeleteKeluarga={handleDeleteKeluarga}
                />
              )}

              {activeTab === 'arsip' && (
                <ArsipDigitalView
                  skList={scopedSkList}
                  pegawaiList={activePegawai}
                  unitsList={unitsList}
                  onOpenUploadSkModal={handleOpenUploadSkModal}
                />
              )}

              {activeTab === 'aplikasi' && (
                <AplikasiKepegawaianView
                  aplikasiList={aplikasiList}
                  unitsList={unitsList}
                  currentUser={currentUser}
                  onAddAplikasi={handleAddAplikasi}
                  onUpdateAplikasi={handleUpdateAplikasi}
                  onDeleteAplikasi={handleDeleteAplikasi}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  selectedUnitScope={selectedUnitScope}
                  onSelectUnitScope={setSelectedUnitScope}
                  unitsList={unitsList}
                  usersList={usersList}
                  pegawaiList={pegawaiList}
                  scopedPegawaiList={scopedPegawaiList}
                  skList={skList}
                  keluargaList={keluargaList}
                  auditLogs={auditLogs}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUnit={handleAddUnit}
                  onUpdateUnit={handleUpdateUnit}
                  onDeleteUnit={handleDeleteUnit}
                  onSwitchUser={handleSwitchUser}
                  defaultSubTab="scope"
                />
              )}

              {activeTab === 'users' && currentUser.role === 'Admin Dinkes' && (
                <SettingsView
                  currentUser={currentUser}
                  selectedUnitScope={selectedUnitScope}
                  onSelectUnitScope={setSelectedUnitScope}
                  unitsList={unitsList}
                  usersList={usersList}
                  pegawaiList={pegawaiList}
                  scopedPegawaiList={scopedPegawaiList}
                  skList={skList}
                  keluargaList={keluargaList}
                  auditLogs={auditLogs}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUnit={handleAddUnit}
                  onUpdateUnit={handleUpdateUnit}
                  onDeleteUnit={handleDeleteUnit}
                  onSwitchUser={handleSwitchUser}
                  defaultSubTab="users"
                />
              )}

              {activeTab === 'export' && (
                <SettingsView
                  currentUser={currentUser}
                  selectedUnitScope={selectedUnitScope}
                  onSelectUnitScope={setSelectedUnitScope}
                  unitsList={unitsList}
                  usersList={usersList}
                  pegawaiList={pegawaiList}
                  scopedPegawaiList={scopedPegawaiList}
                  skList={skList}
                  keluargaList={keluargaList}
                  auditLogs={auditLogs}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUnit={handleAddUnit}
                  onUpdateUnit={handleUpdateUnit}
                  onDeleteUnit={handleDeleteUnit}
                  onSwitchUser={handleSwitchUser}
                  defaultSubTab="export"
                />
              )}

              {activeTab === 'audit' && (
                <SettingsView
                  currentUser={currentUser}
                  selectedUnitScope={selectedUnitScope}
                  onSelectUnitScope={setSelectedUnitScope}
                  unitsList={unitsList}
                  usersList={usersList}
                  pegawaiList={pegawaiList}
                  scopedPegawaiList={scopedPegawaiList}
                  skList={skList}
                  keluargaList={keluargaList}
                  auditLogs={auditLogs}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUnit={handleAddUnit}
                  onUpdateUnit={handleUpdateUnit}
                  onDeleteUnit={handleDeleteUnit}
                  onSwitchUser={handleSwitchUser}
                  defaultSubTab="audit"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global SK Upload Modal */}
      {isUploadSkModalOpen && (
        <UploadSkModal
          pegawaiList={activePegawai}
          defaultNip={selectedNipForSk}
          defaultJenisSk={defaultJenisSkForModal}
          onClose={() => setIsUploadSkModalOpen(false)}
          onSubmitSk={handleSubmitSk}
        />
      )}
    </div>
  );
}

