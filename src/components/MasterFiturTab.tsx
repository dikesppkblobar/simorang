import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Lock,
  RotateCcw,
  Info,
  AppWindow,
  FolderOpen,
  Globe,
  Award,
  Briefcase,
  Clock,
  BadgeCheck,
  FileText,
  BookOpen,
  GraduationCap,
  Layers,
  Baby,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { AppFeatureConfig, UserAccount, DEFAULT_FEATURE_CONFIG } from '../types';

interface MasterFiturTabProps {
  featureConfig: AppFeatureConfig;
  currentUser: UserAccount;
  onUpdateFeatureConfig: (updates: Partial<AppFeatureConfig>) => Promise<boolean> | boolean;
  onResetFeatureConfig: () => Promise<boolean> | boolean;
}

export const MasterFiturTab: React.FC<MasterFiturTabProps> = ({
  featureConfig,
  currentUser,
  onUpdateFeatureConfig,
  onResetFeatureConfig,
}) => {
  const isSuperAdmin =
    currentUser?.role === 'Admin Dinkes' ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('dinkes')) ||
    (currentUser?.email && currentUser.email.toLowerCase().includes('dinkes'));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggle = async (key: keyof AppFeatureConfig, label: string) => {
    if (!isSuperAdmin) {
      showToast('Akses ditolak: Hanya Admin Dinkes yang berwenang mengubah pengaturan fitur.');
      return;
    }

    const nextValue = !featureConfig[key];
    setIsUpdating(true);
    try {
      const ok = await onUpdateFeatureConfig({ [key]: nextValue });
      if (ok) {
        showToast(`Fitur "${label}" berhasil di${nextValue ? 'aktifkan' : 'nonaktifkan'}.`);
      }
    } catch (err: any) {
      showToast(`Gagal memperbarui fitur: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Action: Aktifkan Semua Fitur
  const handleEnableAll = async () => {
    if (!isSuperAdmin) return;
    setIsUpdating(true);
    try {
      const allEnabled: AppFeatureConfig = {
        aplikasi_kepegawaian: true,
        arsip_digital_upload: true,
        scope_data_unrestricted: true,
        sub_pangkat: true,
        sub_jafung: true,
        sub_kgb: true,
        sub_ukom: true,
        sub_ujian_dinas: true,
        sub_izin_belajar: true,
        sub_pencantuman_gelar: true,
        sub_mutasi: true,
        sub_kp4: true,
        sub_cuti: true,
        sub_pensiun: true,
      };
      await onUpdateFeatureConfig(allEnabled);
      showToast('Seluruh fitur sistem dan sub-pemantauan berhasil diaktifkan.');
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Action: Nonaktifkan Semua Sub-Fitur Pemantauan
  const handleDisableAllMonitoring = async () => {
    if (!isSuperAdmin) return;
    setIsUpdating(true);
    try {
      const allDisabled: Partial<AppFeatureConfig> = {
        sub_pangkat: false,
        sub_jafung: false,
        sub_kgb: false,
        sub_ukom: false,
        sub_ujian_dinas: false,
        sub_izin_belajar: false,
        sub_pencantuman_gelar: false,
        sub_mutasi: false,
        sub_kp4: false,
        sub_cuti: false,
        sub_pensiun: false,
      };
      await onUpdateFeatureConfig(allDisabled);
      showToast('Seluruh sub-fitur Pemantauan ASN berhasil dinonaktifkan.');
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Action: Reset ke Standar
  const handleReset = async () => {
    if (!isSuperAdmin) return;
    if (window.confirm('Kembalikan seluruh konfigurasi Master Fitur ke pengaturan standar bawaan sistem?')) {
      setIsUpdating(true);
      try {
        await onResetFeatureConfig();
        showToast('Konfigurasi Master Fitur telah direset ke setelan standar default.');
      } catch (err: any) {
        showToast(`Gagal reset: ${err.message}`);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // 1. Modul Utama & Aksesibilitas Sistem
  const mainModulesList: {
    key: keyof AppFeatureConfig;
    name: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      key: 'aplikasi_kepegawaian',
      name: 'Aplikasi Kepegawaian',
      description: 'Tampilkan menu utama kepegawaian pada sidebar',
      icon: AppWindow,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200',
    },
    {
      key: 'arsip_digital_upload',
      name: 'Arsip Digital (Mode Unggah)',
      description: 'Izinkan tombol dan aksi unggah dokumen baru',
      icon: FolderOpen,
      iconColor: 'text-[#004B87]',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      key: 'scope_data_unrestricted',
      name: 'Scope Data & Multi-Unit',
      description: 'Akses lintas unit kerja luar Dinkes (Puskesmas/Lab)',
      icon: Globe,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-200',
    },
  ];

  // 2. Sub-Fitur Pemantauan ASN: Kolom Kiri (1-6)
  const leftMonitoringList: {
    no: number;
    key: keyof AppFeatureConfig;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
  }[] = [
    {
      no: 1,
      key: 'sub_pangkat',
      title: 'Kenaikan Pangkat (6 Periode BKN)',
      subtitle: 'Feb, Apr, Jun, Ags, Okt, Des',
      icon: Award,
      iconColor: 'text-amber-600',
    },
    {
      no: 2,
      key: 'sub_jafung',
      title: 'Jabatan Fungsional & PAK Integrasi',
      subtitle: 'Konversi SKP ke Angka Kredit tahunan',
      icon: Briefcase,
      iconColor: 'text-blue-600',
    },
    {
      no: 3,
      key: 'sub_kgb',
      title: 'KGB Gaji Berkala (Siklus 2 Tahun)',
      subtitle: 'Jatuh tempo otomatis H-3 bulan',
      icon: Clock,
      iconColor: 'text-emerald-600',
    },
    {
      no: 4,
      key: 'sub_ukom',
      title: 'Uji Kompetensi / UKKJ (PNS)',
      subtitle: 'Syarat jenjang Teknis & Manajerial',
      icon: BadgeCheck,
      iconColor: 'text-indigo-600',
    },
    {
      no: 5,
      key: 'sub_ujian_dinas',
      title: 'Ujian Dinas & STLUD Pelaksana',
      subtitle: 'Tingkat I (II/d) & Tingkat II (III/d)',
      icon: FileText,
      iconColor: 'text-cyan-600',
    },
    {
      no: 6,
      key: 'sub_izin_belajar',
      title: 'Izin & Tugas Belajar',
      subtitle: 'Pengembangan Bangkom ASN',
      icon: BookOpen,
      iconColor: 'text-purple-600',
    },
  ];

  // 2. Sub-Fitur Pemantauan ASN: Kolom Kanan (7-11)
  const rightMonitoringList: {
    no: number;
    key: keyof AppFeatureConfig;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
  }[] = [
    {
      no: 7,
      key: 'sub_pencantuman_gelar',
      title: 'Pencantuman Gelar Akademik',
      subtitle: 'Verval D-3, S-1, S-2, S-3 di BKN',
      icon: GraduationCap,
      iconColor: 'text-violet-600',
    },
    {
      no: 8,
      key: 'sub_mutasi',
      title: 'Mutasi Kepegawaian',
      subtitle: 'Pergeseran Satker & Pertek BKN',
      icon: Layers,
      iconColor: 'text-sky-600',
    },
    {
      no: 9,
      key: 'sub_kp4',
      title: 'Tunjangan KP4 & Tanggungan',
      subtitle: 'Evaluasi usia anak 21-25 thn & ket. kuliah',
      icon: Baby,
      iconColor: 'text-pink-600',
    },
    {
      no: 10,
      key: 'sub_cuti',
      title: 'Hak Cuti Tahunan Pegawai',
      subtitle: 'Saldo kuota cuti tahunan 12 hari kerja',
      icon: Calendar,
      iconColor: 'text-teal-600',
    },
    {
      no: 11,
      key: 'sub_pensiun',
      title: 'BUP Pensiun & Batas Usia',
      subtitle: 'BUP PNS (58/60/65 th) & kontrak PPPK',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
    },
  ];

  const totalMonitoringActive = [
    ...leftMonitoringList,
    ...rightMonitoringList,
  ].filter((item) => featureConfig[item.key]).length;

  return (
    <div className="space-y-5 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-bounce-short">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-heading font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Tombol Aksi Global (Tetap Rapi di Atas) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-heading font-extrabold text-[#004B87]">
                  Master Pengaturan Fitur Sistem
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-blue-50 text-[#004B87] border border-blue-200">
                  Feature Control Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi visibilitas modul utama pada bilah sisi (sidebar) dan sub-fitur pemantauan ASN secara real-time.
              </p>
            </div>
          </div>

          {/* Quick Actions Global Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
            {isSuperAdmin ? (
              <>
                <button
                  type="button"
                  id="btn-quick-enable-all"
                  onClick={handleEnableAll}
                  disabled={isUpdating}
                  className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Aktifkan seluruh modul & sub-fitur sistem"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aktifkan Semua</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-disable-all"
                  onClick={handleDisableAllMonitoring}
                  disabled={isUpdating}
                  className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Nonaktifkan seluruh sub-fitur pemantauan"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Nonaktifkan Semua</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-reset"
                  onClick={handleReset}
                  disabled={isUpdating}
                  className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Kembalikan konfigurasi ke setelan awal default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Standar</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Terkunci ({currentUser.role} - Read Only)</span>
              </div>
            )}
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="mt-3.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Hak akses Anda adalah <strong>{currentUser.role}</strong>. Pengubahan status toggle fitur dibatasi eksklusif untuk <strong>Admin Dinas Kesehatan</strong>.
            </p>
          </div>
        )}
      </div>

      {/* 2. Bagian 1: Modul Utama & Aksesibilitas Sistem (Model Baris Kompak) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AppWindow className="w-4 h-4 text-[#004B87]" />
            <h3 className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wider">
              1. Modul Utama & Aksesibilitas Sistem
            </h3>
          </div>
          <span className="text-[11px] font-heading font-bold text-slate-500">
            3 Fitur Utama
          </span>
        </div>

        {/* Tabel / Baris Kompak Modul Utama */}
        <div className="divide-y divide-slate-100">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 bg-slate-50/40 text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Nama Modul / Fitur Sistem</div>
            <div className="col-span-5">Keterangan Singkat</div>
            <div className="col-span-3 text-right">Status Toggle</div>
          </div>

          {/* Rows */}
          {mainModulesList.map((mod) => {
            const Icon = mod.icon;
            const isEnabled = featureConfig[mod.key];

            return (
              <div
                key={mod.key}
                id={`row-module-${mod.key}`}
                className="p-4 sm:px-5 sm:py-3.5 grid grid-cols-1 sm:grid-cols-12 items-center gap-3 hover:bg-slate-50/50 transition-colors"
              >
                {/* Nama Modul */}
                <div className="sm:col-span-4 flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${mod.iconBg} ${mod.iconColor} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-slate-900 leading-snug">
                      {mod.name}
                    </h4>
                    <span
                      className={`inline-block mt-0.5 text-[9px] font-heading font-extrabold px-1.5 py-0.2 rounded border ${
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isEnabled ? 'AKTIF' : 'NON-AKTIF'}
                    </span>
                  </div>
                </div>

                {/* Keterangan Singkat */}
                <div className="sm:col-span-5 text-xs text-slate-600 leading-relaxed">
                  {mod.description}
                </div>

                {/* Status Toggle Button */}
                <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span
                    className={`text-[11px] font-heading font-bold sm:hidden ${
                      isEnabled ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {isEnabled ? 'Aktif' : 'Non-Aktif'}
                  </span>

                  <button
                    type="button"
                    id={`toggle-main-${mod.key}`}
                    disabled={!isSuperAdmin || isUpdating}
                    onClick={() => handleToggle(mod.key, mod.name)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isEnabled ? 'bg-[#004B87]' : 'bg-slate-300'
                    }`}
                    title={`${isEnabled ? 'Nonaktifkan' : 'Aktifkan'} ${mod.name}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bagian 2: Sub-Fitur Pemantauan ASN (Model Tabel / List Grid 2 Kolom Rapat) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#004B87]" />
            <h3 className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wider">
              2. Sub-Fitur Pemantauan ASN
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-blue-100 text-[#004B87]">
              {totalMonitoringActive} / 11 Aktif
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Daftar 11 sub-modul pemantauan dalam format 2 kolom rapat
          </div>
        </div>

        {/* 2 Kolom Grid Rapat */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Kolom Kiri: 1 - 6 */}
          <div className="divide-y divide-slate-100">
            {leftMonitoringList.map((item) => {
              const Icon = item.icon;
              const isEnabled = featureConfig[item.key];

              return (
                <div
                  key={item.key}
                  id={`row-sub-${item.key}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-heading font-extrabold flex items-center justify-center shrink-0 border border-slate-200">
                      {item.no}
                    </span>
                    <Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-heading font-bold text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-heading font-bold hidden sm:inline-block ${
                        isEnabled ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {isEnabled ? 'Aktif' : 'Non-Aktif'}
                    </span>

                    <button
                      type="button"
                      id={`toggle-sub-${item.key}`}
                      disabled={!isSuperAdmin || isUpdating}
                      onClick={() => handleToggle(item.key, item.title)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        isEnabled ? 'bg-[#004B87]' : 'bg-slate-300'
                      }`}
                      title={`${isEnabled ? 'Nonaktifkan' : 'Aktifkan'} ${item.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kolom Kanan: 7 - 11 */}
          <div className="divide-y divide-slate-100">
            {rightMonitoringList.map((item) => {
              const Icon = item.icon;
              const isEnabled = featureConfig[item.key];

              return (
                <div
                  key={item.key}
                  id={`row-sub-${item.key}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-heading font-extrabold flex items-center justify-center shrink-0 border border-slate-200">
                      {item.no}
                    </span>
                    <Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-heading font-bold text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-heading font-bold hidden sm:inline-block ${
                        isEnabled ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {isEnabled ? 'Aktif' : 'Non-Aktif'}
                    </span>

                    <button
                      type="button"
                      id={`toggle-sub-${item.key}`}
                      disabled={!isSuperAdmin || isUpdating}
                      onClick={() => handleToggle(item.key, item.title)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        isEnabled ? 'bg-[#004B87]' : 'bg-slate-300'
                      }`}
                      title={`${isEnabled ? 'Nonaktifkan' : 'Aktifkan'} ${item.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
