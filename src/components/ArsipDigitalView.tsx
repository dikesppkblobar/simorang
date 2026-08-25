import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Search,
  FileUp,
  Filter,
  CheckCircle2,
  X,
  Clock,
  History,
  Award,
  Briefcase,
  BadgeCheck,
  GraduationCap,
  Calendar,
  Building2,
  ExternalLink,
  Trash2,
  Eye,
  SlidersHorizontal,
  Folder,
  Layers,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RiwayatSK, Pegawai, JenisSK, UnitKerjaItem } from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';
import { openDocumentInNewTab, downloadDocumentFile } from '../utils/fileHelper';

interface ArsipDigitalViewProps {
  skList: RiwayatSK[];
  pegawaiList: Pegawai[];
  unitsList?: UnitKerjaItem[];
  onOpenUploadSkModal: (nip?: string, defaultJenisSk?: JenisSK) => void;
  onDeleteSk?: (id: string) => Promise<boolean>;
}

export const ArsipDigitalView: React.FC<ArsipDigitalViewProps> = ({
  skList,
  pegawaiList,
  unitsList = [],
  onOpenUploadSkModal,
  onDeleteSk,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenisSk, setFilterJenisSk] = useState<string>('Semua');
  const [filterUnitKerja, setFilterUnitKerja] = useState<string>('Semua');
  const [filterStatusVersi, setFilterStatusVersi] = useState<'Semua' | 'terbaru' | 'historis'>('Semua');
  const [selectedPegawaiNip, setSelectedPegawaiNip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'per_pegawai'>('timeline');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Delete modal state
  const [skToDelete, setSkToDelete] = useState<RiwayatSK | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pegawaiMap = new Map<string, Pegawai>(pegawaiList.map((p) => [p.nip, p]));

  // Membuka berkas dokumen langsung di tab baru dengan penampil bawaan peramban
  const handleOpenFile = (sk: RiwayatSK) => {
    const pegawai = pegawaiMap.get(sk.nip_pegawai) || null;
    const cleanJenis = (sk.jenis_sk || 'DOKUMEN').toString().replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNomor = (sk.nomor_sk || 'SK').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `SK_${cleanJenis}_${sk.nip_pegawai}_${cleanNomor}.pdf`;
    openDocumentInNewTab(sk.file_url, fileName, {
      sk,
      pegawai,
      title: sk.keterangan || `Surat Keputusan ${sk.jenis_sk} (${sk.nomor_sk})`,
    });
  };

  // Get list of unique units synchronized with master units
  const unitList = React.useMemo(() => {
    const fromMaster = unitsList.map((u) => u.nama_unit);
    const fromPegawai = pegawaiList.map((p) => p.unit_kerja);
    return Array.from(new Set([...fromMaster, ...fromPegawai])).filter(Boolean).sort();
  }, [unitsList, pegawaiList]);

  // Sort skList descending by TMT/Created date
  const sortedSkList = [...skList].sort((a, b) => {
    const timeA = new Date(a.tmt_berlaku || a.created_at).getTime();
    const timeB = new Date(b.tmt_berlaku || b.created_at).getTime();
    return timeB - timeA;
  });

  // Calculate version map: for each pegawai + jenis_sk combination, the highest timestamp item is "VERSI TERBARU"
  const latestSkMap = new Map<string, string>(); // Key: `${nip}_${jenis_sk}` -> Value: sk.id of latest
  sortedSkList.forEach((sk) => {
    const key = `${sk.nip_pegawai}_${sk.jenis_sk}`;
    if (!latestSkMap.has(key)) {
      latestSkMap.set(key, sk.id);
    }
  });

  // Count active filters for badge
  const activeFiltersCount =
    (filterJenisSk !== 'Semua' ? 1 : 0) +
    (filterUnitKerja !== 'Semua' ? 1 : 0) +
    (filterStatusVersi !== 'Semua' ? 1 : 0) +
    (selectedPegawaiNip ? 1 : 0);

  // Filtered SK list
  const filteredSk = sortedSkList.filter((sk) => {
    const pegawai = pegawaiMap.get(sk.nip_pegawai);
    const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;

    if (filterJenisSk !== 'Semua') {
      if (filterJenisSk === 'UKOM_ALL') {
        if (sk.jenis_sk !== 'UKOM' && sk.jenis_sk !== 'STLUD') return false;
      } else if (filterJenisSk === 'BELAJAR_ALL') {
        if (sk.jenis_sk !== 'Izin Belajar' && sk.jenis_sk !== 'Pencantuman_Gelar') return false;
      } else if (filterJenisSk === 'LAINNYA_ALL') {
        if (sk.jenis_sk !== 'KP4' && sk.jenis_sk !== 'Pensiun' && sk.jenis_sk !== 'Mutasi' && sk.jenis_sk !== 'Lainnya') return false;
      } else if (sk.jenis_sk !== filterJenisSk) {
        return false;
      }
    }

    if (filterUnitKerja !== 'Semua' && pegawai?.unit_kerja !== filterUnitKerja) return false;
    if (selectedPegawaiNip && sk.nip_pegawai !== selectedPegawaiNip) return false;

    if (filterStatusVersi === 'terbaru' && !isLatest) return false;
    if (filterStatusVersi === 'historis' && isLatest) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        sk.nomor_sk.toLowerCase().includes(q) ||
        sk.nip_pegawai.includes(q) ||
        (sk.keterangan && sk.keterangan.toLowerCase().includes(q)) ||
        (pegawai && pegawai.nama_lengkap.toLowerCase().includes(q)) ||
        (pegawai && pegawai.unit_kerja.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Group SK by Pegawai for "per_pegawai" view
  const pegawaiSkGroups = pegawaiList
    .filter((p) => {
      if (filterUnitKerja !== 'Semua' && p.unit_kerja !== filterUnitKerja) return false;
      if (selectedPegawaiNip && p.nip !== selectedPegawaiNip) return false;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        return (
          p.nama_lengkap.toLowerCase().includes(q) ||
          p.nip.includes(q) ||
          p.unit_kerja.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .map((pegawai) => {
      const docs = sortedSkList.filter((sk) => {
        if (sk.nip_pegawai !== pegawai.nip) return false;
        const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;

        if (filterStatusVersi === 'terbaru' && !isLatest) return false;
        if (filterStatusVersi === 'historis' && isLatest) return false;

        if (filterJenisSk !== 'Semua') {
          if (filterJenisSk === 'UKOM_ALL') {
            if (sk.jenis_sk !== 'UKOM' && sk.jenis_sk !== 'STLUD') return false;
          } else if (filterJenisSk === 'BELAJAR_ALL') {
            if (sk.jenis_sk !== 'Izin Belajar' && sk.jenis_sk !== 'Pencantuman_Gelar') return false;
          } else if (filterJenisSk === 'LAINNYA_ALL') {
            if (sk.jenis_sk !== 'KP4' && sk.jenis_sk !== 'Pensiun' && sk.jenis_sk !== 'Mutasi' && sk.jenis_sk !== 'Lainnya') return false;
          } else if (sk.jenis_sk !== filterJenisSk) {
            return false;
          }
        }
        return true;
      });
      return { pegawai, docs };
    })
    .filter((group) => group.docs.length > 0 || (filterJenisSk === 'Semua' && filterStatusVersi === 'Semua' && searchTerm.trim() === ''));

  // Labels for JenisSK
  const getJenisLabel = (jenis: JenisSK) => {
    switch (jenis) {
      case 'Pangkat':
        return { name: 'SK Kenaikan Pangkat', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'KGB':
        return { name: 'SK KGB Berkala', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'Jafung_PAK':
        return { name: 'SK Jafung & PAK', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'UKOM':
        return { name: 'Sertifikat UKKJ / Ukom', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'STLUD':
        return { name: 'STLUD Ujian Dinas', bg: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'Izin Belajar':
        return { name: 'SK Izin / Tugas Belajar', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'Pencantuman_Gelar':
        return { name: 'Pencantuman Gelar BKN', bg: 'bg-violet-100 text-violet-900 border-violet-300' };
      case 'Mutasi':
        return { name: 'SK Mutasi Kepegawaian', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'KP4':
        return { name: 'Berkas Tunjangan KP4', bg: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'Pensiun':
        return { name: 'SK Pensiun / DPCP', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { name: 'Dokumen Kepegawaian', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const handleConfirmDelete = async () => {
    if (!skToDelete || !onDeleteSk) return;
    setIsDeleting(true);
    try {
      await onDeleteSk(skToDelete.id);
      setSkToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus berkas arsip.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterJenisSk('Semua');
    setFilterUnitKerja('Semua');
    setFilterStatusVersi('Semua');
    setSelectedPegawaiNip(null);
  };

  // Compact metric filter cards data
  const quickMetricFilters = [
    {
      id: 'Semua',
      label: 'Semua Berkas',
      count: skList.length,
      icon: Layers,
      activeColor: 'bg-[#004B87] text-white border-[#004B87] shadow-sm',
      inactiveColor: 'bg-white text-slate-700 hover:border-slate-300 border-slate-200/80',
    },
    {
      id: 'Pangkat',
      label: 'SK Kenaikan Pangkat',
      count: skList.filter((s) => s.jenis_sk === 'Pangkat').length,
      icon: Award,
      activeColor: 'bg-amber-600 text-white border-amber-600 shadow-sm',
      inactiveColor: 'bg-white text-amber-900 hover:border-amber-300 border-amber-200/70',
    },
    {
      id: 'KGB',
      label: 'SK KGB Berkala',
      count: skList.filter((s) => s.jenis_sk === 'KGB').length,
      icon: Briefcase,
      activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
      inactiveColor: 'bg-white text-emerald-900 hover:border-emerald-300 border-emerald-200/70',
    },
    {
      id: 'Jafung_PAK',
      label: 'SK Jafung & PAK',
      count: skList.filter((s) => s.jenis_sk === 'Jafung_PAK').length,
      icon: BadgeCheck,
      activeColor: 'bg-blue-600 text-white border-blue-600 shadow-sm',
      inactiveColor: 'bg-white text-blue-900 hover:border-blue-300 border-blue-200/70',
    },
    {
      id: 'UKOM_ALL',
      label: 'UKOM & Ujian Dinas',
      count: skList.filter((s) => s.jenis_sk === 'UKOM' || s.jenis_sk === 'STLUD').length,
      icon: GraduationCap,
      activeColor: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
      inactiveColor: 'bg-white text-indigo-900 hover:border-indigo-300 border-indigo-200/70',
    },
    {
      id: 'BELAJAR_ALL',
      label: 'Izin Belajar & Gelar',
      count: skList.filter((s) => s.jenis_sk === 'Izin Belajar' || s.jenis_sk === 'Pencantuman_Gelar').length,
      icon: Sparkles,
      activeColor: 'bg-purple-600 text-white border-purple-600 shadow-sm',
      inactiveColor: 'bg-white text-purple-900 hover:border-purple-300 border-purple-200/70',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header Halaman: Judul di Kiri & Satu Tombol Utama di Kanan */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-[#004B87] shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-slate-900">
              Arsip Digital Kepegawaian
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Penyimpanan & verifikasi dokumen digital SK Pangkat, KGB, Jafung, UKOM, KP4 & Pensiun ASN
            </p>
          </div>
        </div>

        {/* Single Primary Action Button */}
        <button
          id="btn-unggah-arsip-utama"
          onClick={() => onOpenUploadSkModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#004B87] hover:bg-[#003663] text-white text-xs font-heading font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          <span>+ Unggah Berkas Baru</span>
        </button>
      </div>

      {/* 2. Ringkasan Statistik (Compact Cards yang Berfungsi sebagai Filter Cepat) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {quickMetricFilters.map((item) => {
          const Icon = item.icon;
          const isSelected = filterJenisSk === item.id;
          return (
            <button
              key={item.id}
              id={`quick-filter-${item.id}`}
              onClick={() => setFilterJenisSk(item.id)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected ? item.activeColor : item.inactiveColor
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'opacity-70'}`} />
                <span
                  className={`text-sm sm:text-base font-heading font-extrabold ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <div
                className={`text-[11px] font-heading font-semibold leading-tight line-clamp-1 ${
                  isSelected ? 'text-white' : 'text-slate-600'
                }`}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Pencarian & Kontrol Tampilan (Search Bar Dominan + Filter Lanjutan + Tab View) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Kolom Pencarian Dominan di Sisi Kiri */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-cari-arsip"
              type="text"
              placeholder="Cari nomor SK, NIP, nama pegawai, perihal, atau unit kerja..."
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

          {/* Tombol Filter Lanjutan & Segmented View Mode di Sisi Kanan */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tombol Filter Lanjutan */}
            <button
              id="btn-toggle-filter-lanjutan"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-heading font-bold transition-all cursor-pointer ${
                showAdvancedFilter || activeFiltersCount > 0
                  ? 'bg-blue-50 border-blue-300 text-[#004B87]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#004B87] text-white text-[9px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvancedFilter ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              )}
            </button>

            {/* Segmented Tab View (Tampilan Berkas vs Tampilan Folder Pegawai) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
              <button
                id="view-tab-timeline"
                onClick={() => setViewMode('timeline')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-[#004B87] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Linimasa Berkas</span>
              </button>
              <button
                id="view-tab-folder"
                onClick={() => setViewMode('per_pegawai')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  viewMode === 'per_pegawai'
                    ? 'bg-white text-[#004B87] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Folder Pegawai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Filter Lanjutan (Dropdown / Collapsible) */}
        {showAdvancedFilter && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-heading font-bold text-slate-600 mb-1">
                Kategori Spesifik Dokumen
              </label>
              <select
                id="filter-kategori-select"
                value={filterJenisSk}
                onChange={(e) => setFilterJenisSk(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3 py-2 rounded-xl outline-none font-semibold focus:bg-white focus:border-[#004B87]"
              >
                <option value="Semua">Semua Kategori Dokumen</option>
                <option value="Pangkat">SK Kenaikan Pangkat</option>
                <option value="KGB">SK KGB Berkala</option>
                <option value="Jafung_PAK">SK Jabatan Fungsional / PAK</option>
                <option value="UKOM">Sertifikat Uji Kompetensi (UKKJ)</option>
                <option value="STLUD">STLUD Ujian Dinas Pelaksana</option>
                <option value="Izin Belajar">SK Izin / Tugas Belajar</option>
                <option value="Pencantuman_Gelar">Pencantuman Gelar BKN</option>
                <option value="Mutasi">SK Mutasi Kepegawaian</option>
                <option value="KP4">Berkas Tunjangan KP4</option>
                <option value="Pensiun">SK Pensiun / DPCP</option>
                <option value="Lainnya">Dokumen Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-heading font-bold text-slate-600 mb-1">
                Unit Kerja / Satuan Kerja
              </label>
              <select
                id="filter-unit-select"
                value={filterUnitKerja}
                onChange={(e) => setFilterUnitKerja(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3 py-2 rounded-xl outline-none font-medium focus:bg-white focus:border-[#004B87]"
              >
                <option value="Semua">Semua Unit Kerja Satker</option>
                {unitList.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-heading font-bold text-slate-600 mb-1">
                Status Versi Dokumen
              </label>
              <select
                id="filter-status-versi-select"
                value={filterStatusVersi}
                onChange={(e) => setFilterStatusVersi(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3 py-2 rounded-xl outline-none font-medium focus:bg-white focus:border-[#004B87]"
              >
                <option value="Semua">Semua Versi (Aktif & Historis)</option>
                <option value="terbaru">Hanya Versi Terbaru (Aktif)</option>
                <option value="historis">Hanya Arsip Historis</option>
              </select>
            </div>
          </div>
        )}

        {/* Selected Pegawai / Filter Active Tag */}
        {(selectedPegawaiNip || filterJenisSk !== 'Semua' || filterUnitKerja !== 'Semua' || filterStatusVersi !== 'Semua') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Filter Aktif:</span>
              {selectedPegawaiNip && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-[#004B87] font-semibold text-[11px]">
                  Pegawai: {pegawaiMap.get(selectedPegawaiNip)?.nama_lengkap || selectedPegawaiNip}
                  <button onClick={() => setSelectedPegawaiNip(null)} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterJenisSk !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-semibold text-[11px]">
                  Kategori: {filterJenisSk}
                  <button onClick={() => setFilterJenisSk('Semua')} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterUnitKerja !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-semibold text-[11px]">
                  Unit: {filterUnitKerja}
                  <button onClick={() => setFilterUnitKerja('Semua')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatusVersi !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 font-semibold text-[11px]">
                  Status: {filterStatusVersi === 'terbaru' ? 'Terbaru (Aktif)' : 'Historis'}
                  <button onClick={() => setFilterStatusVersi('Semua')} className="hover:text-purple-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-800 font-heading font-semibold text-xs ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Area Konten Utama: Daftar Arsip Bersih Tanpa Tombol Duplikat */}
      {viewMode === 'timeline' ? (
        /* Linimasa List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#004B87]" />
              <span className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wide">
                Daftar Berkas Digital ({filteredSk.length} Dokumen)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Terurut Berkas Terbaru
            </span>
          </div>

          {filteredSk.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-heading font-bold text-sm text-slate-700">
                Tidak ada dokumen SK / berkas yang sesuai pencarian.
              </p>
              <p className="text-xs text-slate-400">
                Coba sesuaikan kata kunci atau ubah filter kategori dokumen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-heading font-bold text-[11px]">
                    <th className="p-3.5">Pegawai ASN</th>
                    <th className="p-3.5">Kategori & Nomor Dokumen</th>
                    <th className="p-3.5">TMT / Tgl Berlaku</th>
                    <th className="p-3.5">Status Versi</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSk.map((sk) => {
                    const pegawai = pegawaiMap.get(sk.nip_pegawai);
                    const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;
                    const jenisMeta = getJenisLabel(sk.jenis_sk);

                    return (
                      <tr key={sk.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedPegawaiNip(sk.nip_pegawai)}
                            className="text-left group/btn cursor-pointer"
                            title="Filter khusus pegawai ini"
                          >
                            <div className="font-heading font-bold text-slate-900 group-hover/btn:text-[#004B87] transition-colors">
                              {pegawai?.nama_lengkap || '-'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              NIP: {sk.nip_pegawai} &bull; {pegawai?.unit_kerja || '-'}
                            </div>
                          </button>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block font-heading font-bold px-2 py-0.5 rounded-md text-[10px] border mb-1 ${jenisMeta.bg}`}
                          >
                            {jenisMeta.name}
                          </span>
                          <div className="font-mono font-bold text-slate-800 text-[11.5px]">{sk.nomor_sk}</div>
                        </td>

                        <td className="p-3.5 font-medium text-slate-800">
                          {formatDateIndonesian(sk.tmt_berlaku)}
                        </td>

                        <td className="p-3.5">
                          {isLatest ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-heading font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>TERBARU (AKTIF)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 border border-slate-300 font-medium px-2 py-0.5 rounded-full text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>HISTORIS</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-600 max-w-xs truncate text-[11.5px]">
                          {sk.keterangan || '-'}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              id={`btn-preview-sk-${sk.id}`}
                              type="button"
                              onClick={() => handleOpenFile(sk)}
                              className="inline-flex items-center space-x-1 text-[#004B87] hover:text-[#003663] font-heading font-bold hover:underline py-1 px-2 rounded-lg hover:bg-blue-50 transition-all text-xs cursor-pointer"
                              title="Buka Dokumen di Tab Baru"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Buka Berkas</span>
                            </button>

                            {onDeleteSk && (
                              <button
                                id={`btn-hapus-sk-${sk.id}`}
                                onClick={() => setSkToDelete(sk)}
                                className="inline-flex items-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas dari Database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Folder Per Pegawai View */
        <div className="space-y-4">
          {pegawaiSkGroups.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-heading font-bold text-sm text-slate-700">
                Tidak ada folder pegawai yang cocok.
              </p>
            </div>
          ) : (
            pegawaiSkGroups.map(({ pegawai, docs }) => (
              <div
                key={pegawai.nip}
                id={`folder-pegawai-${pegawai.nip}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Employee Header Bar: Padding longgar, hierarki jelas, TANPA tombol duplikat Unggah Berkas */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 text-[#004B87] font-heading font-extrabold flex items-center justify-center text-sm border border-blue-200 shrink-0">
                      {pegawai.nama_lengkap.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base flex items-center flex-wrap gap-2">
                        <span>{pegawai.nama_lengkap}</span>
                        <span className="text-xs font-normal text-slate-500 font-mono">
                          (NIP: {pegawai.nip})
                        </span>
                      </h3>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-semibold text-slate-800">{pegawai.jabatan_spesifik}</span>
                        <span>&bull;</span>
                        <span>{pegawai.unit_kerja}</span>
                        <span>&bull;</span>
                        <span className="bg-slate-200/80 text-slate-800 font-semibold px-2 py-0.2 rounded text-[10px]">
                          {pegawai.status_kepegawaian} {pegawai.golongan_pangkat || ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-heading font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                    {docs.length} Berkas Tersimpan
                  </div>
                </div>

                {/* Document List for this employee */}
                <div className="p-4 sm:p-5">
                  {docs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Belum ada dokumen SK yang tersimpan untuk pegawai ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {docs.map((sk) => {
                        const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;
                        const jenisMeta = getJenisLabel(sk.jenis_sk);

                        return (
                          <div
                            key={sk.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                              isLatest
                                ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-100 shadow-2xs'
                                : 'bg-slate-50/50 border-slate-200/90 opacity-95'
                            }`}
                          >
                            <div>
                              {/* Hierarki Atas: Badge Jenis SK berdampingan langsung dengan Status Versi */}
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <span
                                  className={`font-heading font-bold px-2 py-0.5 rounded text-[10px] border truncate ${jenisMeta.bg}`}
                                >
                                  {jenisMeta.name}
                                </span>
                                {isLatest ? (
                                  <span className="bg-emerald-600 text-white font-heading font-extrabold px-2 py-0.5 rounded text-[9px] shrink-0 shadow-2xs">
                                    TERBARU (AKTIF)
                                  </span>
                                ) : (
                                  <span className="bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded text-[9px] shrink-0">
                                    HISTORIS
                                  </span>
                                )}
                              </div>

                              <div className="font-mono font-bold text-xs text-slate-900 truncate">
                                {sk.nomor_sk}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1">
                                TMT: <strong className="text-slate-800">{formatDateIndonesian(sk.tmt_berlaku)}</strong>
                              </div>

                              {sk.keterangan && (
                                <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 bg-white p-2 rounded-lg border border-slate-100">
                                  {sk.keterangan}
                                </p>
                              )}
                            </div>

                            {/* Footer Kartu Berkas: Modern Link Buka Berkas & Tombol Hapus */}
                            <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(sk.created_at).toLocaleDateString('id-ID')}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  id={`btn-folder-preview-sk-${sk.id}`}
                                  type="button"
                                  onClick={() => handleOpenFile(sk)}
                                  className="text-[#004B87] hover:text-[#003663] font-heading font-bold flex items-center space-x-1 hover:underline text-xs cursor-pointer"
                                  title="Buka Dokumen di Tab Baru"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Buka Berkas</span>
                                </button>

                                {onDeleteSk && (
                                  <button
                                    id={`btn-hapus-folder-sk-${sk.id}`}
                                    onClick={() => setSkToDelete(sk)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer ml-1"
                                    title="Hapus Berkas"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Berkas Arsip dari Database */}
      {skToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-heading font-extrabold text-slate-900">
                  Hapus Berkas Arsip Digital?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tindakan ini akan menghapus dokumen berkas ini secara permanen dari database Supabase dan histori SIMORANG.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Dokumen/SK:</span>
                <span className="font-mono font-bold text-slate-800">{skToDelete.nomor_sk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Dokumen:</span>
                <span className="font-semibold text-slate-800">{getJenisLabel(skToDelete.jenis_sk).name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIP / Pegawai:</span>
                <span className="font-medium text-slate-800">
                  {skToDelete.nip_pegawai} ({pegawaiMap.get(skToDelete.nip_pegawai)?.nama_lengkap || '-'})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSkToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-heading font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-konfirmasi-hapus-arsip"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Hapus Berkas Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
