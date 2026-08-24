import React, { useState, useMemo } from 'react';
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
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  AlertTriangle,
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
    md: 'w-12 h-12 rounded-xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
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
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#004B87] to-[#00A3AD] text-white font-heading font-extrabold flex items-center justify-center shadow-xs shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-white border border-[#E2E8F0] p-1.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden group-hover:scale-105 transition-transform`}
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

  // Reveal password state for each app id
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Copied indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State
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

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
    <div className="space-y-6 pb-12 font-body text-[#1E293B]">
      {/* Header Banner */}
      <div className="bg-[#004B87] text-white p-5 rounded-2xl border border-[#003663] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-xl bg-white/15 border border-white/25 text-white shrink-0 mt-0.5">
            <AppWindow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h2 className="text-base font-heading font-extrabold text-white">
                Direktori Portal & Aplikasi Kepegawaian
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wide bg-[#82BE00] text-white border border-[#6ea000]">
                Single Sign-On & Akses Cepat SDMK
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-3xl leading-relaxed">
              Pengelolaan tautan resmi, kredensial login (username & password), serta deteksi logo otomatis untuk seluruh portal kepegawaian nasional (BKN, Kemenkes), daerah (Lombok Barat), dan layanan jaminan ASN.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="btn-success text-xs px-4 py-2.5 flex items-center space-x-2 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aplikasi Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#004B87] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Total Aplikasi Terdaftar</div>
          <div className="text-2xl font-heading font-extrabold text-[#004B87] mt-1">{totalCount} Portal</div>
          <div className="text-xs text-[#64748B] font-medium mt-2 flex items-center justify-between">
            <span>Terintegrasi SDMK</span>
            <Layers className="w-4 h-4 text-[#004B87] opacity-80" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#00A3AD] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Portal Nasional (BKN/Kemkes)</div>
          <div className="text-2xl font-heading font-extrabold text-[#00A3AD] mt-1">{nasionalCount} Portal</div>
          <div className="text-xs text-[#64748B] font-medium mt-2 flex items-center justify-between">
            <span>SIASN, E-Kinerja, SISDMK</span>
            <Globe className="w-4 h-4 text-[#00A3AD] opacity-80" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#004B87] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Portal Daerah (Lobar / NTB)</div>
          <div className="text-2xl font-heading font-extrabold text-[#004B87] mt-1">{daerahCount} Portal</div>
          <div className="text-xs text-[#64748B] font-medium mt-2 flex items-center justify-between">
            <span>SIMPEG & Layanan BKD</span>
            <Building2 className="w-4 h-4 text-[#004B87] opacity-80" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border-l-4 border-l-[#82BE00] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="text-xs font-heading font-semibold text-[#64748B]">Layanan Keuangan & Jaminan</div>
          <div className="text-2xl font-heading font-extrabold text-[#82BE00] mt-1">{finansialCount} Portal</div>
          <div className="text-xs text-[#6ea000] font-semibold mt-2 flex items-center justify-between">
            <span>Taspen, BPJS & Asuransi</span>
            <Shield className="w-4 h-4 text-[#82BE00] opacity-80" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama aplikasi, domain, username, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none font-medium text-[#1E293B] placeholder:text-[#64748B]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & View Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setSelectedKategori('Semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-colors ${
                selectedKategori === 'Semua'
                  ? 'bg-[#004B87] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Semua ({totalCount})
            </button>
            {KATEGORI_OPTIONS.map((kat) => {
              const count = aplikasiList.filter((a) => a.kategori === kat).length;
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-colors whitespace-nowrap ${
                    selectedKategori === kat
                      ? 'bg-[#004B87] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {kat.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#004B87] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#004B87] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-[#64748B] shadow-xs">
          <AppWindow className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-heading font-bold text-[#1E293B]">
            Tidak ada aplikasi kepegawaian yang sesuai
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau tambahkan aplikasi kepegawaian baru ke direktori.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary text-xs px-4 py-2 mt-4 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aplikasi Sekarang</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredList.map((app) => {
            const domain = extractDomain(app.url_aplikasi);
            const isPasswordRevealed = !!revealedPasswords[app.id];
            const isUsernameCopied = copiedKey === `user-${app.id}`;
            const isPasswordCopied = copiedKey === `pass-${app.id}`;
            const isLinkCopied = copiedKey === `link-${app.id}`;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#004B87]/40"
              >
                {/* Card Top / Header */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <AppLogoImage
                        url={app.url_aplikasi}
                        customLogo={app.custom_logo_url}
                        name={app.nama_aplikasi}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading font-bold text-sm text-[#1E293B] leading-tight group-hover:text-[#004B87] transition-colors">
                          {app.nama_aplikasi}
                        </h4>
                        <a
                          href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#00A3AD] font-medium hover:underline inline-flex items-center space-x-1 mt-0.5 truncate max-w-full"
                          title="Buka URL Aplikasi"
                        >
                          <span className="truncate">{domain || app.url_aplikasi}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        </a>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        app.kategori.includes('Nasional')
                          ? 'bg-blue-50 text-[#004B87] border border-blue-200/80'
                          : app.kategori.includes('Daerah')
                          ? 'bg-teal-50 text-[#00A3AD] border border-teal-200/80'
                          : 'bg-emerald-50 text-[#6ea000] border border-emerald-200/80'
                      }`}
                    >
                      {app.kategori.includes('Nasional')
                        ? 'Nasional'
                        : app.kategori.includes('Daerah')
                        ? 'Pemda'
                        : 'Jaminan'}
                    </span>
                  </div>

                  {/* Description */}
                  {app.deskripsi && (
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                      {app.deskripsi}
                    </p>
                  )}

                  {/* Credentials Box (Username & Password) */}
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                    {/* Username Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[#64748B] min-w-0">
                        <User className="w-3.5 h-3.5 shrink-0 text-[#004B87]" />
                        <span className="text-[11px] font-medium">Username:</span>
                        <span className="font-mono font-semibold text-[#1E293B] truncate ml-1">
                          {app.username || '-'}
                        </span>
                      </div>
                      {app.username && (
                        <button
                          type="button"
                          onClick={() => handleCopy(app.username || '', `user-${app.id}`)}
                          className={`p-1 rounded-md transition-colors ${
                            isUsernameCopied
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'hover:bg-slate-200 text-[#64748B]'
                          }`}
                          title="Salin Username"
                        >
                          {isUsernameCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Password Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div className="flex items-center space-x-1.5 text-[#64748B] min-w-0">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-[#00A3AD]" />
                        <span className="text-[11px] font-medium">Password:</span>
                        <span className="font-mono font-semibold text-[#1E293B] truncate ml-1">
                          {app.password
                            ? isPasswordRevealed
                              ? app.password
                              : '••••••••'
                            : '-'}
                        </span>
                      </div>
                      {app.password && (
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => toggleRevealPassword(app.id)}
                            className="p-1 hover:bg-slate-200 rounded-md text-[#64748B] transition-colors"
                            title={isPasswordRevealed ? 'Sembunyikan Password' : 'Lihat Password'}
                          >
                            {isPasswordRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(app.password || '', `pass-${app.id}`)}
                            className={`p-1 rounded-md transition-colors ${
                              isPasswordCopied
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'hover:bg-slate-200 text-[#64748B]'
                            }`}
                            title="Salin Password"
                          >
                            {isPasswordCopied ? (
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

                {/* Card Footer: Action Buttons */}
                <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                  <a
                    href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs px-3.5 py-1.5 flex items-center space-x-1.5 shadow-xs"
                  >
                    <span>Buka Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(app)}
                      className="p-1.5 hover:bg-slate-200 text-[#64748B] hover:text-[#004B87] rounded-lg transition-colors"
                      title="Edit Detail Aplikasi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(app)}
                      className="p-1.5 hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-lg transition-colors"
                      title="Hapus Aplikasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#1E293B] uppercase tracking-wider">
              DAFTAR PORTAL & APLIKASI KEPEGAWAIAN ({filteredList.length} PORTAL)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-body">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-heading font-bold text-[11px]">
                  <th className="p-3.5 text-center w-12">NO</th>
                  <th className="p-3.5">APLIKASI & LOGO</th>
                  <th className="p-3.5">KATEGORI & LINGKUP</th>
                  <th className="p-3.5">URL / TAUTAN RESMI</th>
                  <th className="p-3.5">USERNAME / AKUN</th>
                  <th className="p-3.5">PASSWORD</th>
                  <th className="p-3.5 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredList.map((app, idx) => {
                  const domain = extractDomain(app.url_aplikasi);
                  const isPasswordRevealed = !!revealedPasswords[app.id];
                  const isUsernameCopied = copiedKey === `user-${app.id}`;
                  const isPasswordCopied = copiedKey === `pass-${app.id}`;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-semibold text-[#64748B]">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <AppLogoImage
                            url={app.url_aplikasi}
                            customLogo={app.custom_logo_url}
                            name={app.nama_aplikasi}
                            size="sm"
                          />
                          <div>
                            <div className="font-heading font-bold text-[#1E293B]">
                              {app.nama_aplikasi}
                            </div>
                            {app.deskripsi && (
                              <div className="text-[11px] text-[#64748B] line-clamp-1 max-w-xs">
                                {app.deskripsi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            app.kategori.includes('Nasional')
                              ? 'bg-blue-50 text-[#004B87] border border-blue-200'
                              : app.kategori.includes('Daerah')
                              ? 'bg-teal-50 text-[#00A3AD] border border-teal-200'
                              : 'bg-emerald-50 text-[#6ea000] border border-emerald-200'
                          }`}
                        >
                          {app.kategori}
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
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="font-semibold text-[#1E293B]">
                            {app.username || '-'}
                          </span>
                          {app.username && (
                            <button
                              type="button"
                              onClick={() => handleCopy(app.username || '', `user-${app.id}`)}
                              className="p-1 hover:bg-slate-100 rounded text-[#64748B]"
                              title="Salin Username"
                            >
                              {isUsernameCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="font-semibold text-[#1E293B]">
                            {app.password
                              ? isPasswordRevealed
                                ? app.password
                                : '••••••••'
                              : '-'}
                          </span>
                          {app.password && (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleRevealPassword(app.id)}
                                className="p-1 hover:bg-slate-100 rounded text-[#64748B]"
                                title={isPasswordRevealed ? 'Sembunyikan' : 'Lihat'}
                              >
                                {isPasswordRevealed ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(app.password || '', `pass-${app.id}`)}
                                className="p-1 hover:bg-slate-100 rounded text-[#64748B]"
                                title="Salin Password"
                              >
                                {isPasswordCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <a
                            href={app.url_aplikasi.startsWith('http') ? app.url_aplikasi : `https://${app.url_aplikasi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-blue-50 text-[#004B87] hover:bg-blue-100 rounded-lg transition-colors"
                            title="Buka Aplikasi"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1.5 hover:bg-slate-100 text-[#64748B] hover:text-[#004B87] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(app)}
                            className="p-1.5 hover:bg-red-50 text-[#64748B] hover:text-red-600 rounded-lg transition-colors"
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

      {/* MODAL: Tambah / Edit Aplikasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-[#E2E8F0] overflow-hidden my-8 animate-in fade-in zoom-in-95">
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
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs font-body">
              {/* Live Preview Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E2E8F0] flex items-center space-x-3.5">
                <AppLogoImage
                  url={formData.url_aplikasi}
                  customLogo={formData.custom_logo_url}
                  name={formData.nama_aplikasi || 'Preview Logo'}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-heading font-bold text-[#64748B] uppercase">
                      Pratinjau Otomatis Logo:
                    </span>
                    <span className="text-[10px] text-[#00A3AD] bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                      Otomatis Terdeteksi
                    </span>
                  </div>
                  <div className="font-heading font-bold text-sm text-[#1E293B] truncate mt-0.5">
                    {formData.nama_aplikasi || 'Nama Aplikasi'}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">
                    {formData.url_aplikasi
                      ? extractDomain(formData.url_aplikasi)
                      : 'Ketik URL di bawah untuk melihat logo otomatis'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Aplikasi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-[#1E293B]">
                    Nama Aplikasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SIASN BKN / E-Kinerja BKN / SIMPEG Lombok Barat"
                    value={formData.nama_aplikasi}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_aplikasi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* URL Aplikasi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-[#1E293B]">
                    URL / Link Web Aplikasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://siasn.bkn.go.id"
                    value={formData.url_aplikasi}
                    onChange={(e) =>
                      setFormData({ ...formData, url_aplikasi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                  <p className="text-[11px] text-[#64748B]">
                    Logo akan diambil otomatis dari favicon resmi website/domain di atas.
                  </p>
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-[#1E293B]">
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
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
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
                  <label className="font-heading font-bold text-[#1E293B]">
                    Lingkup Unit Kerja
                  </label>
                  <select
                    value={formData.unit_kerja}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_kerja: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
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
                  <label className="font-heading font-bold text-[#1E293B]">
                    Username / NIP / Akun Login
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: admin.dinkes / 19850101..."
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-heading font-bold text-[#1E293B]">
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
                      className="w-full p-2.5 pr-9 bg-slate-50 border border-[#E2E8F0] rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormShowPassword(!formShowPassword)}
                      className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-[#1E293B]"
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
                  <label className="font-heading font-bold text-[#1E293B]">
                    Kustom URL Logo (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan jika ingin logo otomatis terdeteksi dari domain web"
                    value={formData.custom_logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_logo_url: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-mono focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-heading font-bold text-[#1E293B]">
                    Deskripsi / Catatan Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Fungsi atau peruntukan aplikasi ini..."
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:ring-2 focus:ring-[#004B87] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E293B] rounded-lg font-heading font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-success text-xs px-5 py-2 flex items-center space-x-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E2E8F0] p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#1E293B]">
                Hapus Aplikasi Kepegawaian?
              </h3>
              <p className="text-xs text-[#64748B]">
                Anda yakin ingin menghapus{' '}
                <strong className="text-[#1E293B]">{deleteTarget.nama_aplikasi}</strong> dari direktori? Data tautan dan kredensial yang tersimpan akan dihapus.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1E293B] rounded-lg font-heading font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-heading font-semibold text-xs transition-colors"
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
