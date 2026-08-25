import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  ShieldCheck,
  Building,
  KeyRound,
  CheckCircle2,
  XCircle,
  LogIn,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  X,
  Sparkles,
  Database,
  Server,
  RefreshCw,
  Download,
  HardDrive,
  Trash,
  Cloud,
  Copy,
  Code,
  Check,
  Lock,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import { UserAccount, UnitKerjaItem, Pegawai, RoleUser } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { apiClient } from '../services/apiClient';
import { isDinasCategory } from '../services/dateCalculator';

interface UserAndUnitManagementViewProps {
  usersList: UserAccount[];
  unitsList: UnitKerjaItem[];
  pegawaiList: Pegawai[];
  currentUser: UserAccount;
  onAddUser: (user: Omit<UserAccount, 'id' | 'created_at'>) => Promise<boolean>;
  onUpdateUser: (id: string, user: Partial<UserAccount>) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onAddUnit: (unit: Omit<UnitKerjaItem, 'id'>) => Promise<boolean>;
  onUpdateUnit: (id: string, unit: Partial<UnitKerjaItem>) => Promise<boolean>;
  onDeleteUnit: (id: string) => Promise<boolean>;
  onSwitchUser: (user: UserAccount) => void;
}

export const UserAndUnitManagementView: React.FC<UserAndUnitManagementViewProps> = ({
  usersList,
  unitsList,
  pegawaiList,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onSwitchUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'units' | 'database'>('users');

  // Supabase Integration States
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; url?: string }>({
    connected: true,
    message: 'Memeriksa koneksi Supabase...',
    url: 'https://pjofydlrdyxttogrxaju.supabase.co',
  });
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'database') {
      apiClient.getSupabaseStatus().then((status) => {
        setSupabaseStatus(status);
      });
    }
  }, [activeSubTab]);

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    setSyncNotice(null);
    try {
      const res = await apiClient.syncSupabaseNow();
      setSyncNotice(res.details || (res.success ? 'Sinkronisasi Supabase Berhasil!' : 'Gagal sinkronisasi.'));
      const status = await apiClient.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err: any) {
      setSyncNotice(`Error: ${err.message}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleShowSql = async () => {
    const sql = await apiClient.getSupabaseSchemaSql();
    setSqlSchema(sql);
    setIsSqlModalOpen(true);
  };

  // Filters & Searches
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [unitSearch, setUnitSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('Semua');

  // Delete Confirmation States
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitKerjaItem | null>(null);

  // Modal States - User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    nama_lengkap: '',
    nip: '',
    email: '',
    password: '',
    role: 'Admin Unit Kerja' as RoleUser,
    unit_kerja: unitsList[0]?.nama_unit || 'Dinas Kesehatan Kab. Lombok Barat',
    no_hp: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Modal States - Unit
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitKerjaItem | null>(null);
  const [unitFormData, setUnitFormData] = useState({
    kode_unit: '',
    nama_unit: '',
    kategori: 'Puskesmas' as UnitKerjaItem['kategori'],
    alamat: '',
    telepon: '',
    kepala_unit: '',
    nip_kepala: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Open User Modal
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setShowPasswordInForm(false);
    setUserFormData({
      username: '',
      nama_lengkap: '',
      nip: '',
      email: '',
      password: 'admin',
      role: 'Admin Unit Kerja',
      unit_kerja: unitsList[0]?.nama_unit || 'Dinas Kesehatan Kab. Lombok Barat',
      no_hp: '',
      status: 'Aktif',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setShowPasswordInForm(false);
    setUserFormData({
      username: user.username || '',
      nama_lengkap: user.nama_lengkap || '',
      nip: user.nip || '',
      email: user.email || '',
      password: user.password || '',
      role: user.role,
      unit_kerja: user.unit_kerja,
      no_hp: user.no_hp || '',
      status: user.status,
    });
    setIsUserModalOpen(true);
  };

  // Auto-fill from Pegawai
  const handleSelectPegawaiForUser = (nipPegawai: string) => {
    if (!nipPegawai) return;
    const selected = pegawaiList.find((p) => p.nip === nipPegawai);
    if (selected) {
      const sanitizedName = selected.nama_lengkap.trim();
      const firstWord = sanitizedName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const suggestedUsername = `admin.${firstWord || selected.nip.slice(-4)}`;
      const suggestedEmail = `${firstWord || 'pegawai'}@pkm.lombokbaratkab.go.id`;

      setUserFormData((prev) => ({
        ...prev,
        nip: selected.nip,
        nama_lengkap: `${selected.gelar_depan ? selected.gelar_depan + ' ' : ''}${selected.nama_lengkap}${selected.gelar_belakang ? ', ' + selected.gelar_belakang : ''}`,
        unit_kerja: selected.unit_kerja || prev.unit_kerja,
        username: prev.username ? prev.username : suggestedUsername,
        email: prev.email ? prev.email : suggestedEmail,
        no_hp: selected.no_whatsapp || prev.no_hp,
      }));
    }
  };

  // Submit User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username || !userFormData.nama_lengkap || !userFormData.email) {
      alert('Mohon lengkapi Username, Nama Lengkap, dan Email.');
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingUser) {
        const payload: Partial<UserAccount> = {
          username: userFormData.username.trim(),
          nama_lengkap: userFormData.nama_lengkap.trim(),
          nip: userFormData.nip.trim() || undefined,
          email: userFormData.email.trim(),
          role: userFormData.role,
          unit_kerja: userFormData.unit_kerja,
          no_hp: userFormData.no_hp.trim() || undefined,
          status: userFormData.status,
        };
        // Always ensure password is set properly
        if (userFormData.password && userFormData.password.trim()) {
          payload.password = userFormData.password.trim();
        } else if (editingUser.password) {
          payload.password = editingUser.password;
        } else {
          payload.password = 'admin';
        }

        const success = await onUpdateUser(editingUser.id, payload);
        if (success) {
          setIsUserModalOpen(false);
        }
      } else {
        const success = await onAddUser({
          username: userFormData.username.trim(),
          nama_lengkap: userFormData.nama_lengkap.trim(),
          nip: userFormData.nip.trim() || undefined,
          email: userFormData.email.trim(),
          password: userFormData.password.trim() || 'admin',
          role: userFormData.role,
          unit_kerja: userFormData.unit_kerja,
          no_hp: userFormData.no_hp.trim() || undefined,
          status: userFormData.status,
          terakhir_login: 'Belum Pernah',
        });
        if (success) {
          setIsUserModalOpen(false);
        }
      }
    } finally {
      setIsSavingUser(false);
    }
  };

  // Open Unit Modal
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitFormData({
      kode_unit: `PKM-0${unitsList.length + 1}`,
      nama_unit: '',
      kategori: 'Puskesmas',
      alamat: '',
      telepon: '',
      kepala_unit: '',
      nip_kepala: '',
      status: 'Aktif',
    });
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: UnitKerjaItem) => {
    setEditingUnit(unit);
    setUnitFormData({
      kode_unit: unit.kode_unit,
      nama_unit: unit.nama_unit,
      kategori: unit.kategori,
      alamat: unit.alamat || '',
      telepon: unit.telepon || '',
      kepala_unit: unit.kepala_unit || '',
      nip_kepala: unit.nip_kepala || '',
      status: unit.status,
    });
    setIsUnitModalOpen(true);
  };

  // Submit Unit
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitFormData.nama_unit || !unitFormData.kode_unit) {
      alert('Mohon isi Kode Unit dan Nama Unit Kerja.');
      return;
    }

    if (editingUnit) {
      const success = await onUpdateUnit(editingUnit.id, unitFormData);
      if (success) setIsUnitModalOpen(false);
    } else {
      const success = await onAddUnit(unitFormData);
      if (success) setIsUnitModalOpen(false);
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const query = userSearch.toLowerCase().trim();
    const matchSearch =
      u.nama_lengkap.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.nip && u.nip.toLowerCase().includes(query)) ||
      u.unit_kerja.toLowerCase().includes(query);
    const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredUnits = unitsList.filter((u) => {
    const matchSearch =
      u.nama_unit.toLowerCase().includes(unitSearch.toLowerCase()) ||
      u.kode_unit.toLowerCase().includes(unitSearch.toLowerCase()) ||
      (u.kepala_unit && u.kepala_unit.toLowerCase().includes(unitSearch.toLowerCase()));
    const matchKat =
      kategoriFilter === 'Semua' ||
      (kategoriFilter === 'Dinas'
        ? isDinasCategory(u.kategori)
        : u.kategori === kategoriFilter);
    return matchSearch && matchKat;
  });

  // Calculate live pegawai count per unit
  const getPegawaiCountForUnit = (unitName: string) => {
    const uLower = unitName.toLowerCase().trim();
    return pegawaiList.filter(
      (p) =>
        !p.is_deleted &&
        (p.unit_kerja.toLowerCase().trim() === uLower ||
          p.unit_kerja.toLowerCase().includes(uLower) ||
          uLower.includes(p.unit_kerja.toLowerCase().trim()))
    ).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300 mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Multi-Tenant User & Scope Management</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
              <span>Manajemen User & Master Unit Kerja</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Atur hak akses admin (Admin Dinkes vs Admin Unit Kerja) serta kelola unit kerja terintegrasi (Puskesmas, RSUD, Dinas Kesehatan).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              {currentUser.role === 'Admin Dinkes' ? 'AD' : 'UK'}
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">{currentUser.nama_lengkap}</div>
              <div className="text-[11px] text-blue-300 font-semibold">{currentUser.role} &bull; {currentUser.unit_kerja}</div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Hak Akses & Pengguna ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('units')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'units'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master Unit Kerja ({unitsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'database'
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Real & Pembersihan Data Dummy</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: USER MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Total Akun Admin</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{usersList.length}</div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Admin Dinkes (Super)</div>
                <div className="text-2xl font-black text-purple-900 mt-0.5">
                  {usersList.filter((u) => u.role === 'Admin Dinkes').length}
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Admin Unit Kerja</div>
                <div className="text-2xl font-black text-blue-900 mt-0.5">
                  {usersList.filter((u) => u.role === 'Admin Unit Kerja').length}
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Akun Status Aktif</div>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">
                  {usersList.filter((u) => u.status === 'Aktif').length}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, username, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Peran (Role)</option>
                <option value="Admin Dinkes">Admin Dinkes (Super Admin)</option>
                <option value="Admin Unit Kerja">Admin Unit Kerja</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUser}
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah User Pengguna Baru</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                    <th className="p-4">Pengguna & Kredensial</th>
                    <th className="p-4">Kontak & Email</th>
                    <th className="p-4">Peran (Role)</th>
                    <th className="p-4">Unit Kerja Terikat</th>
                    <th className="p-4">Terakhir Login</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi / Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada akun pengguna yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentLoggedIn = currentUser.id === u.id;
                      const isSuperAdmin = u.role === 'Admin Dinkes';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0 ${
                                  isSuperAdmin ? 'bg-purple-600' : 'bg-blue-600'
                                }`}
                              >
                                {u.nama_lengkap.charAt(0)}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                                  <span>{u.nama_lengkap}</span>
                                  {isCurrentLoggedIn && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                                      Sesi Aktif
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                    @{u.username}
                                  </span>
                                  {u.nip && (
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      NIP: {u.nip}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1 text-slate-700 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.no_hp && (
                              <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{u.no_hp}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {isSuperAdmin ? (
                              <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                <span>Admin Dinkes (Super)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                <Building className="w-3.5 h-3.5 text-blue-600" />
                                <span>Admin Unit Kerja</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {u.unit_kerja}
                          </td>
                          <td className="p-4 text-slate-500 font-medium text-[11px]">
                            {u.terakhir_login || 'Belum Pernah'}
                          </td>
                          <td className="p-4 text-center">
                            {u.status === 'Aktif' ? (
                              <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                                <XCircle className="w-3 h-3 text-slate-400" />
                                <span>Nonaktif</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              {!isCurrentLoggedIn && (
                                <button
                                  type="button"
                                  onClick={() => onSwitchUser(u)}
                                  className="flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors shadow-xs"
                                  title="Simulasi Login Sebagai Akun Ini"
                                >
                                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Ganti Akun</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                                title="Edit Akun"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {!isCurrentLoggedIn && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: UNIT KERJA MANAGEMENT */}
      {activeSubTab === 'units' && (
        <div className="space-y-4">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Total Unit Kerja</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{unitsList.length}</div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Dinas Kesehatan & Bidang</div>
                <div className="text-2xl font-black text-purple-900 mt-0.5">
                  {unitsList.filter((u) => isDinasCategory(u.kategori)).length}
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Puskesmas</div>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">
                  {unitsList.filter((u) => u.kategori === 'Puskesmas').length}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Rumah Sakit</div>
                <div className="text-2xl font-black text-indigo-900 mt-0.5">
                  {unitsList.filter((u) => u.kategori === 'Rumah Sakit').length}
                </div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">Total Pegawai Terdata</div>
                <div className="text-2xl font-black text-amber-900 mt-0.5">
                  {pegawaiList.filter((p) => !p.is_deleted).length} Pegawai
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode, nama unit, kepala..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Dinas">Dinas Kesehatan</option>
                <option value="Puskesmas">Puskesmas</option>
                <option value="Rumah Sakit">Rumah Sakit</option>
                <option value="Lab / UPTD">Lab / UPTD</option>
                <option value="KB / PPKB">Balai Penyuluhan KB / PPKB</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUnit}
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Kerja Baru</span>
            </button>
          </div>

          {/* Units Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                    <th className="p-4">Kode & Nama Unit Kerja</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Kepala Unit & NIP</th>
                    <th className="p-4">Alamat & Telepon</th>
                    <th className="p-4 text-center">Pegawai Terdaftar</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Tidak ada unit kerja yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit) => {
                      const pegCount = getPegawaiCountForUnit(unit.nama_unit);

                      return (
                        <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <div className="font-extrabold text-slate-900 text-sm">{unit.nama_unit}</div>
                            <div className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                              Kode: {unit.kode_unit}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isDinasCategory(unit.kategori)
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : unit.kategori === 'Puskesmas'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : unit.kategori === 'Rumah Sakit'
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isDinasCategory(unit.kategori) ? 'Dinas Kesehatan' : unit.kategori}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{unit.kepala_unit || '-'}</div>
                            {unit.nip_kepala && (
                              <div className="text-[11px] font-mono text-slate-500">NIP: {unit.nip_kepala}</div>
                            )}
                          </td>
                          <td className="p-4 max-w-xs">
                            {unit.alamat && (
                              <div className="flex items-center space-x-1 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{unit.alamat}</span>
                              </div>
                            )}
                            {unit.telepon && (
                              <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{unit.telepon}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-xs font-black">
                              {pegCount} Pegawai
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUnit(unit)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                                title="Edit Unit Kerja"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setUnitToDelete(unit)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Hapus Unit Kerja"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USER ADD / EDIT */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-blue-200/80">
                    Kredensial login & otentikasi database SI MORANG DINKES-PPKB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Optional: Auto-fill from Registered Pegawai */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-extrabold text-blue-950 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tautkan & Isi Otomatis Dari Data Pegawai (Opsional)</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">Auto-fill</span>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => handleSelectPegawaiForUser(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Pegawai Terdaftar untuk Mengisi Form Otomatis --</option>
                  {pegawaiList
                    .filter((p) => !p.is_deleted)
                    .map((p) => (
                      <option key={p.id} value={p.nip}>
                        {p.nama_lengkap} — NIP: {p.nip} ({p.unit_kerja})
                      </option>
                    ))}
                </select>
                <p className="text-[10.5px] text-blue-800/80 mt-1">
                  Memilih pegawai akan otomatis mengisi Nama Lengkap, NIP, Unit Kerja, No. HP, dan menyarankan Username & Email.
                </p>
              </div>

              {/* Identity Section */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nama Lengkap Admin / Operator <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dr. H. AHMAD SYAMSUL"
                      value={userFormData.nama_lengkap}
                      onChange={(e) => setUserFormData({ ...userFormData, nama_lengkap: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      NIP Pegawai (18 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="198501012010011001"
                      value={userFormData.nip}
                      onChange={(e) => setUserFormData({ ...userFormData, nip: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="admin.narmada"
                        value={userFormData.username}
                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Email Resmi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@pkm.lombokbaratkab.go.id"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password / Kata Sandi Field */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kata Sandi / Password Login</span>
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setUserFormData({ ...userFormData, password: 'admin' })}
                        className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold cursor-pointer"
                        title="Set password default 'admin'"
                      >
                        Set 'admin'
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserFormData({ ...userFormData, password: '123456' })}
                        className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold cursor-pointer"
                        title="Set password default '123456'"
                      >
                        Set '123456'
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showPasswordInForm ? 'text' : 'password'}
                      placeholder={editingUser ? 'Masukkan password baru (atau biarkan yang ada)' : 'Masukkan kata sandi (default: admin)'}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showPasswordInForm ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPasswordInForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Pengguna dapat login menggunakan Username, NIP, atau Email bersama kata sandi ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Peran (Role Akses) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as RoleUser })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Admin Dinkes">Admin Dinkes (Super Admin)</option>
                      <option value="Admin Unit Kerja">Admin Unit Kerja (Puskesmas / RSUD)</option>
                      <option value="Operator">Operator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={userFormData.no_hp}
                      onChange={(e) => setUserFormData({ ...userFormData, no_hp: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Unit Kerja Terikat <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userFormData.unit_kerja}
                    onChange={(e) => setUserFormData({ ...userFormData, unit_kerja: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {unitsList.map((unit) => (
                      <option key={unit.id} value={unit.nama_unit}>
                        {unit.nama_unit} ({unit.kategori})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    *Admin Unit Kerja dibatasi hanya untuk mengelola pegawai dari unit kerja ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Status Akun</label>
                  <div className="flex items-center space-x-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="userStatus"
                        value="Aktif"
                        checked={userFormData.status === 'Aktif'}
                        onChange={() => setUserFormData({ ...userFormData, status: 'Aktif' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="flex items-center space-x-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aktif (Bisa Login)</span>
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="userStatus"
                        value="Nonaktif"
                        checked={userFormData.status === 'Nonaktif'}
                        onChange={() => setUserFormData({ ...userFormData, status: 'Nonaktif' })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="flex items-center space-x-1 text-slate-600">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nonaktif (Blokir Akses)</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingUser ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingUser ? 'Simpan Perubahan Akun' : 'Buat Akun Pengguna'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UNIT ADD / EDIT */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  {editingUnit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Kode Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PKM-06"
                    value={unitFormData.kode_unit}
                    onChange={(e) => setUnitFormData({ ...unitFormData, kode_unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unitFormData.kategori}
                    onChange={(e) =>
                      setUnitFormData({ ...unitFormData, kategori: e.target.value as UnitKerjaItem['kategori'] })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Dinas">Dinas Kesehatan</option>
                    <option value="Puskesmas">Puskesmas</option>
                    <option value="Rumah Sakit">Rumah Sakit</option>
                    <option value="Lab / UPTD">Lab / UPTD</option>
                    <option value="KB / PPKB">Balai Penyuluhan KB / PPKB</option>
                  </select>
                </div>
              </div>

              {isDinasCategory(unitFormData.kategori) && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-[11px] text-purple-900 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">Cakupan Otomatis Dinas Kesehatan:</span> Semua data pegawai yang ditempatkan pada unit ini (apapun nama unitnya seperti Bidang, Seksi, Subbag, dll) akan otomatis tampil dan terkelola secara utuh di bawah user / akun <strong>Dinas Kesehatan</strong>.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nama Resmi Unit Kerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puskesmas Labuapi"
                  value={unitFormData.nama_unit}
                  onChange={(e) => setUnitFormData({ ...unitFormData, nama_unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Nama Kepala Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. dr. I Gede Agus"
                    value={unitFormData.kepala_unit}
                    onChange={(e) => setUnitFormData({ ...unitFormData, kepala_unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">NIP Kepala Unit</label>
                  <input
                    type="text"
                    placeholder="18 Digit NIP"
                    value={unitFormData.nip_kepala}
                    onChange={(e) => setUnitFormData({ ...unitFormData, nip_kepala: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Alamat Kantor</label>
                <input
                  type="text"
                  placeholder="Jl. Raya Narmada..."
                  value={unitFormData.alamat}
                  onChange={(e) => setUnitFormData({ ...unitFormData, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">No. Telepon Unit</label>
                <input
                  type="text"
                  placeholder="(0370) 671112"
                  value={unitFormData.telepon}
                  onChange={(e) => setUnitFormData({ ...unitFormData, telepon: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm"
                >
                  Simpan Unit Kerja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATABASE REAL & PEMBERSIHAN DATA DUMMY */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          {/* Supabase Integration Live Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-emerald-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <h2 className="text-base font-black text-white">Integrasi Cloud Database Supabase</h2>
                    <span className={`inline-flex items-center space-x-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      supabaseStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      <span>{supabaseStatus.connected ? 'SUPABASE TERHUBUNG' : 'KONEKSI METADATA'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    URL: <span className="text-emerald-300">{supabaseStatus.url || 'https://pjofydlrdyxttogrxaju.supabase.co'}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {supabaseStatus.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShowSql}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Skrip SQL Tabel</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncSupabase}
                  disabled={isSyncingSupabase}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Sinkronkan Ke Supabase'}</span>
                </button>
              </div>
            </div>

            {syncNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] font-bold">Pegawai Disinkronkan</span>
                <span className="text-sm font-black text-white">{pegawaiList.length} Record</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] font-bold">Unit Kerja</span>
                <span className="text-sm font-black text-white">{unitsList.length} Unit</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] font-bold">Pengguna Sistem</span>
                <span className="text-sm font-black text-white">{usersList.length} User</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] font-bold">Mode Sinkronisasi</span>
                <span className="text-xs font-bold text-emerald-400">Otomatis & Realtime</span>
              </div>
            </div>
          </div>

          {/* Database Connection Status Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/60">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-900">Status Database Server Express Persistent</h2>
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>AKTIF & TERHUBUNG</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sistem penyimpanan database terintegrasi menggunakan file persistent (`data/sipatuh_db.json`) dan sinkronisasi cloud Supabase.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pegawaiList, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `simorang_backup_pegawai_${new Date().toISOString().split('T')[0]}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Backup JSON</span>
                </button>
              </div>
            </div>

            {/* Live Data Counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Total Record Pegawai Real</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{pegawaiList.length} ASN</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Master Unit Kerja</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{unitsList.length} Unit</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Akun Pengguna Admin</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{usersList.length} Admin</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500">Mode Sinkronisasi</div>
                <div className="text-xs font-black text-emerald-700 mt-1">Live Persistent + Cloud</div>
              </div>
            </div>
          </div>

          {/* Database Info and Guidance Card */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-200/90 shadow-sm space-y-4 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Database Siap Operasional Penuh (Data Real)</h3>
                  <p className="text-[11px] text-slate-500">Seluruh data tersimpan secara permanen dan terhubung langsung ke Master Database</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Aplikasi SIMORANG DINKES-PPKB telah dikonfigurasi murni untuk data kepegawaian real ASN & Non-ASN. Anda dapat menambahkan data pegawai melalui modul <strong>SIMPEG Data Pegawai</strong> dan membuat unit kerja baru di tab <strong>Master Unit Kerja</strong>.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Lihat / Salin Skrip Full SQL Database</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncSupabase}
                  disabled={isSyncingSupabase}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSupabase ? 'Menyinkronkan Cloud...' : 'Sinkronkan ke Cloud Supabase Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        title="Konfirmasi Hapus Akun Pengguna"
        itemName={userToDelete ? `${userToDelete.nama_lengkap} (${userToDelete.email || userToDelete.username})` : ''}
        message="Apakah Anda yakin ingin menghapus akun pengguna ini?"
        confirmLabel="Ya, Hapus Akun"
        cancelLabel="Batal"
        onClose={() => setUserToDelete(null)}
        onConfirm={async () => {
          if (userToDelete) {
            await onDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
      />

      {/* CONFIRM DELETE UNIT MODAL */}
      <ConfirmDeleteModal
        isOpen={!!unitToDelete}
        title="Konfirmasi Hapus Unit Kerja"
        itemName={unitToDelete ? `${unitToDelete.nama_unit} (Kode: ${unitToDelete.kode_unit})` : ''}
        message="Apakah Anda yakin ingin menghapus data unit kerja ini?"
        confirmLabel="Ya, Hapus Unit"
        cancelLabel="Batal"
        onClose={() => setUnitToDelete(null)}
        onConfirm={async () => {
          if (unitToDelete) {
            await onDeleteUnit(unitToDelete.id);
            setUnitToDelete(null);
          }
        }}
      />
      {/* SQL SCHEMA MIGRATION MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Skrip SQL Migrasi Tabel Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-300 bg-slate-950 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{sqlSchema || 'Memuat skrip SQL...'}</pre>
            </div>

            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Jalankan skrip ini di <span className="text-emerald-400 font-bold">SQL Editor Supabase</span> jika tabel belum dibuat.
              </p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSchema);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
