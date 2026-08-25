import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AppWindow,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Globe,
  Lock,
  User,
  Shield,
  Layers,
  Building2,
  CheckCircle2,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  AlertTriangle,
  MoreVertical,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { AplikasiKepegawaian, KategoriAplikasi, UnitKerjaItem, UserAccount } from '../types';

interface AplikasiKepegawaianViewProps {
  aplikasiList: AplikasiKepegawaian[];
  unitsList?: UnitKerjaItem[];
  currentUser: UserAccount;
  onAddAplikasi: (data: Omit<AplikasiKepegawaian, 'id' | 'created_at'>) => Promise<boolean>;
  onUpdateAplikasi: (id: string, data: Partial<AplikasiKepegawaian>) => Promise<boolean>;
  onDeleteAplikasi: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

const KATEGORI_OPTIONS: KategoriAplikasi[] = [
  'Nasional (BKN / Kemenkes)',
  'Pemerintah Daerah (Lombok Barat / NTB)',
  'Layanan Finansial & Jaminan ASN',
  'Lainnya',
];

// Helper to extract clean domain from any URL
export function extractDomain(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname;
  } catch (_) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] || '';
  }
}

// Helper to generate automatic logo URL with fallbacks
export function getAutoLogoUrl(url: string, customLogo?: string): string {
  if (customLogo && customLogo.trim().length > 0) {
    return customLogo.trim();
  }

  const domain = extractDomain(url);
  if (!domain) {
    return '/logo-lombok-barat.jpeg';
  }

  // Known local domains
  if (domain.includes('lombokbaratkab.go.id')) {
    return '/logo-lombok-barat.jpeg';
  }

  // Google Favicon High-Res API
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

// Logo image component with automatic fallback
const AppLogoImage: React.FC<{
  url: string;
  customLogo?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ url, customLogo, name, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getAutoLogoUrl(url, customLogo);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-11 h-11 rounded-xl text-sm',
    lg: 'w-14 h-14 rounded-2xl text-base',
  };

  if (imgError || !url) {
    const initials = name
      ? name
          .split(' ')
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'APP';

    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#004B87] to-[#00A3AD] text-white font-heading font-extrabold flex items-center justify-center shadow-2xs shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden group-hover:scale-105 transition-transform`}
    >
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain rounded"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export const AplikasiKepegawaianView: React.FC<AplikasiKepegawaianViewProps> = ({
  aplikasiList,
  unitsList = [],
  currentUser,
  onAddAplikasi,
  onUpdateAplikasi,
  onDeleteAplikasi,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Kebab menu open state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Credential popover / modal state
  const [credentialModalApp, setCredentialModalApp] = useState<AplikasiKepegawaian | null>(null);
  const [isCredentialPasswordRevealed, setIsCredentialPasswordRevealed] = useState(false);

  // Copied indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AplikasiKepegawaian | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_aplikasi: '',
    kategori: 'Nasional (BKN / Kemenkes)' as KategoriAplikasi,
    url_aplikasi: '',
    deskripsi: '',
    username: '',
    password: '',
    custom_logo_url: '',
    unit_kerja: 'Semua Unit',
    status: 'Aktif' as 'Aktif' | 'Maintenance' | 'Nonaktif',
  });
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<AplikasiKepegawaian | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close kebab menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.kebab-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormData({
      nama_aplikasi: '',
      kategori: 'Nasional (BKN / Kemenkes)',
      url_aplikasi: '',
      deskripsi: '',
      username: '',
      password: '',
      custom_logo_url: '',
      unit_kerja: currentUser.role === 'Admin Unit Kerja' ? currentUser.unit_kerja : 'Semua Unit',
      status: 'Aktif',
    });
    setFormShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (app: AplikasiKepegawaian) => {
    setActiveMenuId(null);
    setEditingApp(app);
    setFormData({
      nama_aplikasi: app.nama_aplikasi,
      kategori: app.kategori,
      url_aplikasi: app.url_aplikasi,
      deskripsi: app.deskripsi || '',
      username: app.username || '',
      password: app.password || '',
      custom_logo_url: app.custom_logo_url || '',
      unit_kerja: app.unit_kerja || 'Semua Unit',
      status: app.status || 'Aktif',
    });
    setFormShowPassword(false);
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_aplikasi.trim() || !formData.url_aplikasi.trim()) {
      alert('Nama Aplikasi dan URL Link Aplikasi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingApp) {
        await onUpdateAplikasi(editingApp.id, formData);
      } else {
        await onAddAplikasi(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan aplikasi kepegawaian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteAplikasi(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus aplikasi.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return aplikasiList.filter((app) => {
      const matchSearch =
        searchTerm === '' ||
        app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.username && app.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.url_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.deskripsi && app.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchKategori =
        selectedKategori === 'Semua' || app.kategori === selectedKategori;

      return matchSearch && matchKategori;
    });
  }, [aplikasiList, searchTerm, selectedKategori]);

  // Statistics
  const totalCount = aplikasiList.length;
  const nasionalCount = aplikasiList.filter(
    (a) => a.kategori === 'Nasional (BKN / Kemenkes)'
  ).length;
  const daerahCount = aplikasiList.filter(
    (a) => a.kategori === 'Pemerintah Daerah (Lombok Barat / NTB)'
  ).length;
  const finansialCount = aplikasiList.filter(
    (a) => a.kategori === 'Layanan Finansial & Jaminan ASN'
  ).length;

  return (
    <div className="space-y-4 font-body text-slate-800">
      {/* 1. Header Halaman: Judul di Kiri & Satu Tombol Utama di Kanan */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0">
            <AppWindow className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-slate-900">
                Direktori Portal & Aplikasi Kepegawaian
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-heading font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Single Sign-On SDMK
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Katalog tautan resmi, akun login SSO, dan integrasi portal kepegawaian ASN
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            id="btn-tambah-aplikasi-utama"
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 bg-[#004B87] hover:bg-[#003663] text-white text-xs font-heading font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Aplikasi Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Statistik Kompak & Clickable (Berfungsi sebagai Filter Cepat) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Portal */}
        <button
          id="stat-filter-semua"
          type="button"
          onClick={() => setSelectedKategori('Semua')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedKategori === 'Semua'
              ? 'bg-[#004B87] text-white border-[#004B87] shadow-xs ring-2 ring-[#004B87]/20'
              : 'bg-white hover:border-slate-300 border-slate-200/80 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <Layers className={`w-4 h-4 ${selectedKategori === 'Semua' ? 'text-white' : 'text-[#004B87]'}`} />
            <span
              className={`text-base font-heading font-extrabold ${
                selectedKategori === 'Semua' ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalCount}
            </span>
          </div>
          <div
            className={`text-xs font-heading font-bold ${
              selectedKategori === 'Semua' ? 'text-white' : 'text-slate-800'
            }`}
          >
            Semua Portal Aplikasi
          </div>
          <div
            className={`text-[10px] mt-0.5 truncate ${
              selectedKategori === 'Semua' ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            Terintegrasi SDMK
          </div>
        </button>

        {/* Portal Nasional */}
        <button
          id="stat-filter-nasional"
          type="button"
          onClick={() => setSelectedKategori('Nasional (BKN / Kemenkes)')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedKategori === 'Nasional (BKN / Kemenkes)'
              ? 'bg-[#00A3AD] text-white border-[#00A3AD] shadow-xs ring-2 ring-[#00A3AD]/20'
              : 'bg-white hover:border-teal-300 border-teal-200/70 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <Globe className={`w-4 h-4 ${selectedKategori === 'Nasional (BKN / Kemenkes)' ? 'text-white' : 'text-[#00A3AD]'}`} />
            <span
              className={`text-base font-heading font-extrabold ${
                selectedKategori === 'Nasional (BKN / Kemenkes)' ? 'text-white' : 'text-[#00A3AD]'
              }`}
            >
              {nasionalCount}
            </span>
          </div>
          <div
            className={`text-xs font-heading font-bold ${
              selectedKategori === 'Nasional (BKN / Kemenkes)' ? 'text-white' : 'text-slate-800'
            }`}
          >
            Portal Nasional (BKN/Kemkes)
          </div>
          <div
            className={`text-[10px] mt-0.5 truncate ${
              selectedKategori === 'Nasional (BKN / Kemenkes)' ? 'text-teal-100' : 'text-slate-400'
            }`}
          >
            SIASN, E-Kinerja, SISDMK
          </div>
        </button>

        {/* Portal Pemda */}
        <button
          id="stat-filter-pemda"
          type="button"
          onClick={() => setSelectedKategori('Pemerintah Daerah (Lombok Barat / NTB)')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedKategori === 'Pemerintah Daerah (Lombok Barat / NTB)'
              ? 'bg-[#004B87] text-white border-[#004B87] shadow-xs ring-2 ring-[#004B87]/20'
              : 'bg-white hover:border-blue-300 border-blue-200/70 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <Building2 className={`w-4 h-4 ${selectedKategori === 'Pemerintah Daerah (Lombok Barat / NTB)' ? 'text-white' : 'text-[#004B87]'}`} />
            <span
              className={`text-base font-heading font-extrabold ${
                selectedKategori === 'Pemerintah Daerah (Lombok Barat / NTB)' ? 'text-white' : 'text-[#004B87]'
              }`}
            >
              {daerahCount}
            </span>
          </div>
          <div
            className={`text-xs font-heading font-bold ${
              selectedKategori === 'Pemerintah Daerah (Lombok Barat / NTB)' ? 'text-white' : 'text-slate-800'
            }`}
          >
            Portal Daerah (Lobar / NTB)
          </div>
          <div
            className={`text-[10px] mt-0.5 truncate ${
              selectedKategori === 'Pemerintah Daerah (Lombok Barat / NTB)' ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            SIMPEG & Layanan BKD
          </div>
        </button>

        {/* Layanan Finansial */}
        <button
          id="stat-filter-finansial"
          type="button"
          onClick={() => setSelectedKategori('Layanan Finansial & Jaminan ASN')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedKategori === 'Layanan Finansial & Jaminan ASN'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
              : 'bg-white hover:border-emerald-300 border-emerald-200/70 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <Shield className={`w-4 h-4 ${selectedKategori === 'Layanan Finansial & Jaminan ASN' ? 'text-white' : 'text-emerald-600'}`} />
            <span
              className={`text-base font-heading font-extrabold ${
                selectedKategori === 'Layanan Finansial & Jaminan ASN' ? 'text-white' : 'text-emerald-700'
              }`}
            >
              {finansialCount}
            </span>
          </div>
          <div
            className={`text-xs font-heading font-bold ${
              selectedKategori === 'Layanan Finansial & Jaminan ASN' ? 'text-white' : 'text-slate-800'
            }`}
          >
            Keuangan & Jaminan ASN
          </div>
          <div
            className={`text-[10px] mt-0.5 truncate ${
              selectedKategori === 'Layanan Finansial & Jaminan ASN' ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            Taspen, BPJS & Asuransi
          </div>
        </button>
      </div>

      {/* 3. Control Bar: Baris 1 (Pencarian Lebar + View Mode) & Baris 2 (Pill Tabs Kategori) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Baris 1: Kotak Pencarian Lebar Berdiri Sendiri + Tombol View Mode */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-cari-aplikasi"
              type="text"
              placeholder="Cari nama aplikasi, domain, peruntukan, atau username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#004B87] focus:ring-2 focus:ring-[#004B87]/20 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Pengatur Tampilan Grid/Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              id="view-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#004B87] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-table-btn"
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#004B87] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Baris 2: Tab Filter Kategori (Pill Tabs yang Bersih) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 border-t border-slate-100">
          <button
            id="tab-kategori-semua"
            type="button"
            onClick={() => setSelectedKategori('Semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedKategori === 'Semua'
                ? 'bg-[#004B87] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Semua ({totalCount})
          </button>
          {KATEGORI_OPTIONS.map((kat) => {
            const count = aplikasiList.filter((a) => a.kategori === kat).length;
            const shortLabel =
              kat === 'Nasional (BKN / Kemenkes)'
                ? 'Nasional'
                : kat === 'Pemerintah Daerah (Lombok Barat / NTB)'
                ? 'Pemda Lombok Barat'
                : kat === 'Layanan Finansial & Jaminan ASN'
                ? 'Finansial & Jaminan'
                : 'Lainnya';

            return (
              <button
                key={kat}
                id={`tab-kategori-${shortLabel.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedKategori === kat
                    ? 'bg-[#004B87] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {shortLabel} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Content: Redesigned Clean Grid vs Table */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-xs space-y-2">
          <AppWindow className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-heading font-bold text-slate-800">
            Tidak ada aplikasi kepegawaian yang sesuai
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian atau pilih tab kategori aplikasi lainnya.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-1.5 bg-[#004B87] text-white text-xs font-heading font-bold px-4 py-2 rounded-xl mt-3 shadow-xs hover:bg-[#003663] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aplikasi Sekarang</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Redesigned Card Grid: Clean, Uncluttered, Kebab Menu, Popover Credentials, Truncated Desc */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredList.map((app) => {
            const domain = extractDomain(app.url_aplikasi);
            const hasCredentials = Boolean(app.username || app.password);
            const isMenuOpen = activeMenuId === app.id;

            return (
              <div
                key={app.id}
                id={`card-app-${app.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#004B87]/50 relative"
              >
                {/* Card Top / Header Area */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar: Logo + Name + Kebab Menu */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <AppLogoImage
                        url={app.url_aplikasi}
                        customLogo={app.custom_logo_url}
                        name={app.nama_aplikasi}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug group-hover:text-[#004B87] transition-colors truncate">
                          {app.nama_aplikasi}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                          {domain || app.url_aplikasi}
                        </div>
                      </div>
                    </div>

                    {/* Kebab Menu (Dropdown Titik Tiga) */}
                    <div className="relative shrink-0 kebab-menu-container">
                      <button
                        id={`btn-menu-${app.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : app.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Opsi Aplikasi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(app)}
                            className="w-full text-left px-3 py-2 text-xs font-heading font-medium text-slate-700 hover:bg-slate-50 hover:text-[#004B87] flex items-center space-x-2 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteTarget(app);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-heading font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Aplikasi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges Bar: Kategori & Status/Kredensial */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                        app.kategori.includes('Nasional')
                          ? 'bg-blue-50 text-[#004B87] border border-blue-200'
                          : app.kategori.includes('Daerah')
                          ? 'bg-teal-50 text-[#00A3AD] border border-teal-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {app.kategori.includes('Nasional')
                        ? 'Nasional'
                        : app.kategori.includes('Daerah')
                        ? 'Pemda Lobar'
                        : 'Jaminan ASN'}
                    </span>

                    {/* Tombol Ringkas / Indikator Kredensial */}
                    {hasCredentials ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCredentialModalApp(app);
                          setIsCredentialPasswordRevealed(false);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10.5px] font-heading font-semibold text-slate-600 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 transition-colors cursor-pointer"
                        title="Klik untuk melihat username & password"
                      >
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span>Kredensial Login</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Login Terbuka</span>
                    )}
                  </div>

                  {/* Ringkas Deskripsi Maksimal 1 Baris (Truncated) */}
                  {app.deskripsi && (
                    <p
                      className="text-xs text-slate-500 line-clamp-1 leading-normal pt-0.5"
                      title={app.deskripsi}
                    >
                      {app.deskripsi}
                    </p>
                  )}
                </div>

                {/* Card Footer: Tombol Utama Buka Portal yang Mencolok & Elegan */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 rounded-b-2xl flex items-center gap-2">
                  <a
                    href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#004B87] hover:bg-[#003663] text-white text-xs font-heading font-bold py-2 px-3 rounded-xl shadow-2xs transition-all text-center"
                  >
                    <span>Buka Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {hasCredentials && (
                    <button
                      type="button"
                      onClick={() => {
                        setCredentialModalApp(app);
                        setIsCredentialPasswordRevealed(false);
                      }}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="Lihat Username & Password"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Redesigned Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wide">
              Daftar Portal & Aplikasi Kepegawaian ({filteredList.length} Portal)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-heading font-bold text-[11px]">
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5">Aplikasi & Logo</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Tautan Resmi</th>
                  <th className="p-3.5">Kredensial</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((app, idx) => {
                  const domain = extractDomain(app.url_aplikasi);
                  const hasCredentials = Boolean(app.username || app.password);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <AppLogoImage
                            url={app.url_aplikasi}
                            customLogo={app.custom_logo_url}
                            name={app.nama_aplikasi}
                            size="sm"
                          />
                          <div>
                            <div className="font-heading font-bold text-slate-900">
                              {app.nama_aplikasi}
                            </div>
                            {app.deskripsi && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                                {app.deskripsi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            app.kategori.includes('Nasional')
                              ? 'bg-blue-50 text-[#004B87] border border-blue-200'
                              : app.kategori.includes('Daerah')
                              ? 'bg-teal-50 text-[#00A3AD] border border-teal-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {app.kategori.includes('Nasional')
                            ? 'Nasional'
                            : app.kategori.includes('Daerah')
                            ? 'Pemda'
                            : 'Jaminan'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <a
                          href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#004B87] hover:underline font-medium inline-flex items-center space-x-1"
                        >
                          <span>{domain || app.url_aplikasi}</span>
                          <ExternalLink className="w-3 h-3 text-[#00A3AD]" />
                        </a>
                      </td>
                      <td className="p-3.5">
                        {hasCredentials ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCredentialModalApp(app);
                              setIsCredentialPasswordRevealed(false);
                            }}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Lihat Akun</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tidak Ada</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          <a
                            href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-[#004B87] text-white text-xs font-heading font-bold rounded-lg hover:bg-[#003663] transition-all inline-flex items-center space-x-1"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#004B87] rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(app)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POP-UP MODAL KREDENSIAL LOGIN (Sleek, Aman, Tidak Berantakan) */}
      {credentialModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <AppLogoImage
                  url={credentialModalApp.url_aplikasi}
                  customLogo={credentialModalApp.custom_logo_url}
                  name={credentialModalApp.nama_aplikasi}
                  size="sm"
                />
                <div className="min-w-0">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 truncate">
                    {credentialModalApp.nama_aplikasi}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {extractDomain(credentialModalApp.url_aplikasi)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCredentialModalApp(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Credentials Card Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-3 text-xs">
              {/* Username Field */}
              <div className="space-y-1">
                <div className="text-[10.5px] font-heading font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <User className="w-3 h-3 text-[#004B87]" />
                  <span>Username / NIP Login</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-slate-900 truncate">
                    {credentialModalApp.username || '-'}
                  </span>
                  {credentialModalApp.username && (
                    <button
                      type="button"
                      onClick={() => handleCopy(credentialModalApp.username || '', `modal-user`)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#004B87] cursor-pointer"
                      title="Salin Username"
                    >
                      {copiedKey === 'modal-user' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="text-[10.5px] font-heading font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-[#00A3AD]" />
                  <span>Kata Sandi / Password</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-slate-900 truncate">
                    {credentialModalApp.password
                      ? isCredentialPasswordRevealed
                        ? credentialModalApp.password
                        : '••••••••••••'
                      : '-'}
                  </span>
                  {credentialModalApp.password && (
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setIsCredentialPasswordRevealed(!isCredentialPasswordRevealed)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                        title={isCredentialPasswordRevealed ? 'Sembunyikan' : 'Lihat'}
                      >
                        {isCredentialPasswordRevealed ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(credentialModalApp.password || '', `modal-pass`)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#004B87] cursor-pointer"
                        title="Salin Password"
                      >
                        {copiedKey === 'modal-pass' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <a
                href={
                  credentialModalApp.url_aplikasi.startsWith('http')
                    ? credentialModalApp.url_aplikasi
                    : `https://${credentialModalApp.url_aplikasi}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#004B87] hover:bg-[#003663] text-white text-xs font-heading font-bold py-2.5 rounded-xl shadow-xs transition-all"
              >
                <span>Buka Portal Sekarang</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setCredentialModalApp(null)}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-heading font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Aplikasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#004B87] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AppWindow className="w-5 h-5" />
                <h3 className="font-heading font-extrabold text-sm text-white">
                  {editingApp ? 'Edit Aplikasi Kepegawaian' : 'Tambah Portal Aplikasi Kepegawaian'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs font-body">
              {/* Live Preview Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3.5">
                <AppLogoImage
                  url={formData.url_aplikasi}
                  customLogo={formData.custom_logo_url}
                  name={formData.nama_aplikasi || 'Preview Logo'}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-heading font-bold text-slate-500 uppercase">
                      Pratinjau Otomatis Logo:
                    </span>
                    <span className="text-[10px] text-[#00A3AD] bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                      Otomatis Terdeteksi
                    </span>
                  </div>
                  <div className="font-heading font-bold text-sm text-slate-900 truncate mt-0.5">
                    {formData.nama_aplikasi || 'Nama Aplikasi'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {formData.url_aplikasi
                      ? extractDomain(formData.url_aplikasi)
                      : 'Ketik URL di bawah untuk melihat logo otomatis'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Aplikasi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-slate-900">
                    Nama Aplikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SIASN BKN / E-Kinerja BKN / SIMPEG Lombok Barat"
                    value={formData.nama_aplikasi}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_aplikasi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* URL Aplikasi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-slate-900">
                    URL / Link Web Aplikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://siasn.bkn.go.id"
                    value={formData.url_aplikasi}
                    onChange={(e) =>
                      setFormData({ ...formData, url_aplikasi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Logo akan diambil otomatis dari favicon resmi website/domain di atas.
                  </p>
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-slate-900">
                    Kategori / Lingkup Portal
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kategori: e.target.value as KategoriAplikasi,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  >
                    {KATEGORI_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Kerja */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-slate-900">
                    Lingkup Unit Kerja
                  </label>
                  <select
                    value={formData.unit_kerja}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_kerja: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  >
                    <option value="Semua Unit">Semua Unit Kerja</option>
                    <option value="Dinas Kesehatan Kab. Lombok Barat">
                      Dinas Kesehatan Kab. Lombok Barat
                    </option>
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.nama_unit}>
                        {u.nama_unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-slate-900">
                    Username / NIP / Akun Login
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: admin.dinkes / 19850101..."
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-slate-900">
                    Password / Kode Akses
                  </label>
                  <div className="relative">
                    <input
                      type={formShowPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi / PIN"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormShowPassword(!formShowPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {formShowPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Custom Logo URL (Optional) */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-slate-900">
                    Kustom URL Logo (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan jika ingin logo otomatis terdeteksi dari domain web"
                    value={formData.custom_logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_logo_url: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-slate-900">
                    Deskripsi / Catatan Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Fungsi atau peruntukan aplikasi ini..."
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-heading font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 bg-[#82BE00] hover:bg-[#6ea000] text-white text-xs font-heading font-bold px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Menyimpan...'
                      : editingApp
                      ? 'Simpan Perubahan'
                      : 'Tambahkan Aplikasi'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Hapus Aplikasi Kepegawaian?
              </h3>
              <p className="text-xs text-slate-500">
                Anda yakin ingin menghapus{' '}
                <strong className="text-slate-900">{deleteTarget.nama_aplikasi}</strong> dari direktori? Data tautan dan kredensial yang tersimpan akan dihapus permanen.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-heading font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-heading font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Aplikasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
