import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Edit,
  X,
  UserCheck,
  GraduationCap,
  Award,
  Heart,
  CreditCard,
  Phone,
  Building2,
  Calendar,
  FileText,
  Users,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StatusKepegawaian, JenisJabatan, SumberPembiayaan, AppFeatureConfig, DEFAULT_FEATURE_CONFIG } from '../types';
import { PANGKAT_GOLONGAN_MAP } from '../services/dateCalculator';

interface PegawaiAddEditModalProps {
  isOpen: boolean;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  activeFormTab?: 'identitas' | 'akademik' | 'golongan' | 'keluarga' | null;
  setActiveFormTab?: (tab: 'identitas' | 'akademik' | 'golongan' | 'keluarga' | any) => void;
  nikValidationResult: any;
  handleNikChange: (val: string) => void;
  nipValidationResult: any;
  handleNipChange: (val: string) => void;
  handleStatusKepegawaianChange: (status: StatusKepegawaian) => void;
  handleGolonganPnsChange: (gol: string) => void;
  synchronizedUnitOptions: string[];
  featureConfig?: AppFeatureConfig;
  handleSubmitAdd: (e: React.FormEvent) => void;
  handleSubmitEdit: (e: React.FormEvent) => void;
  statusPerkawinan: 'Menikah' | 'Belum Menikah' | 'Duda' | 'Janda';
  setStatusPerkawinan: (val: 'Menikah' | 'Belum Menikah' | 'Duda' | 'Janda') => void;
  namaPasangan: string;
  setNamaPasangan: (val: string) => void;
  tglLahirPasangan: string;
  setTglLahirPasangan: (val: string) => void;
  tanggunganPasangan: boolean;
  setTanggunganPasangan: (val: boolean) => void;
  daftarAnak: any[];
  handleAddChildRow: () => void;
  handleRemoveChildRow: (id: string) => void;
  handleUpdateChildRow: (id: string, field: string, val: any) => void;
}

export const PegawaiAddEditModal: React.FC<PegawaiAddEditModalProps> = ({
  isOpen,
  isAddModalOpen,
  isEditModalOpen,
  onClose,
  formData,
  setFormData,
  activeFormTab = 'identitas',
  setActiveFormTab,
  nikValidationResult,
  handleNikChange,
  nipValidationResult,
  handleNipChange,
  handleStatusKepegawaianChange,
  handleGolonganPnsChange,
  synchronizedUnitOptions,
  featureConfig = DEFAULT_FEATURE_CONFIG,
  handleSubmitAdd,
  handleSubmitEdit,
  statusPerkawinan,
  setStatusPerkawinan,
  namaPasangan,
  setNamaPasangan,
  tglLahirPasangan,
  setTglLahirPasangan,
  tanggunganPasangan,
  setTanggunganPasangan,
  daftarAnak,
  handleAddChildRow,
  handleRemoveChildRow,
  handleUpdateChildRow,
}) => {
  // Feature flags validation helpers
  const isCutiEnabled = featureConfig?.sub_cuti !== false && (featureConfig as any)?.hak_cuti_tahunan !== false;
  const isIzinBelajarEnabled = featureConfig?.sub_izin_belajar !== false && (featureConfig as any)?.izin_tugas_belajar !== false;
  const isGelarEnabled = featureConfig?.sub_pencantuman_gelar !== false && (featureConfig as any)?.pencantuman_gelar !== false;
  const isJafungEnabled = featureConfig?.sub_jafung !== false && (featureConfig as any)?.jabatan_fungsional_pak !== false;
  const isUkomEnabled = featureConfig?.sub_ukom !== false && (featureConfig as any)?.uji_kompetensi_ukkj !== false;
  const isUjianDinasEnabled = featureConfig?.sub_ujian_dinas !== false && (featureConfig as any)?.ujian_dinas_stlud !== false;
  const isPangkatEnabled = featureConfig?.sub_pangkat !== false && (featureConfig as any)?.kenaikan_pangkat_reguler !== false;
  const isMutasiEnabled = featureConfig?.sub_mutasi !== false && (featureConfig as any)?.mutasi_kepegawaian !== false;
  const isKp4Enabled = featureConfig?.sub_kp4 !== false && (featureConfig as any)?.tunjangan_kp4 !== false;

  // Active accordion section: 'identitas' | 'akademik' | 'golongan' | 'keluarga' | null
  const [openTab, setOpenTab] = useState<'identitas' | 'akademik' | 'golongan' | 'keluarga' | null>(
    activeFormTab ?? 'identitas'
  );

  // Sync internal accordion state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setOpenTab(activeFormTab !== undefined && activeFormTab !== null ? activeFormTab : 'identitas');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTab = (tabKey: 'identitas' | 'akademik' | 'golongan' | 'keluarga') => {
    const next = openTab === tabKey ? null : tabKey;
    setOpenTab(next);
    if (setActiveFormTab) {
      setActiveFormTab(next);
    }
  };

  const goToNextTab = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let next: 'identitas' | 'akademik' | 'golongan' | 'keluarga' = 'identitas';
    if (openTab === 'identitas') {
      next = 'akademik';
    } else if (openTab === 'akademik') {
      next = 'golongan';
    } else if (openTab === 'golongan') {
      if (isKp4Enabled) {
        next = 'keluarga';
      } else {
        return; // Sudah tab terakhir jika KP4 non-aktif
      }
    } else {
      next = 'identitas';
    }
    setOpenTab(next);
    if (setActiveFormTab) setActiveFormTab(next);
  };

  const goToPrevTab = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let prevTab: 'identitas' | 'akademik' | 'golongan' | 'keluarga' = 'identitas';
    if (openTab === 'keluarga') {
      prevTab = 'golongan';
    } else if (openTab === 'golongan') {
      prevTab = 'akademik';
    } else if (openTab === 'akademik') {
      prevTab = 'identitas';
    } else {
      prevTab = 'identitas';
    }
    setOpenTab(prevTab);
    if (setActiveFormTab) setActiveFormTab(prevTab);
  };

  return (
    <div
      id="pegawai-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden"
    >
      <div
        id="pegawai-form-container"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* ========================================================================= */}
        {/* 1. STICKY HEADER */}
        {/* ========================================================================= */}
        <div
          id="pegawai-form-header"
          className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              {isAddModalOpen ? <UserPlus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[#1E293B] text-sm sm:text-base truncate">
                {isAddModalOpen ? 'Tambah Data Pegawai Baru' : 'Edit Biodata Pegawai'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Klik pada masing-masing tab untuk membuka & menutup rincian formulir
              </p>
            </div>
          </div>
          <button
            id="btn-close-pegawai-form"
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0 ml-2"
            title="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. ACCORDION FORM BODY (NO HORIZONTAL SCROLL) */}
        {/* ========================================================================= */}
        <form
          id="pegawai-main-form"
          onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-3 text-xs">
            
            {/* ======================================================================= */}
            {/* ACCORDION TAB 1: IDENTITAS UTAMA */}
            {/* ======================================================================= */}
            <div
              id="accordion-item-identitas"
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                openTab === 'identitas'
                  ? 'border-blue-300 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                id="btn-toggle-tab-identitas"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTab('identitas');
                }}
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      openTab === 'identitas'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    1
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <UserCheck className={`w-4 h-4 shrink-0 ${openTab === 'identitas' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className={`font-heading font-bold text-xs sm:text-sm truncate ${openTab === 'identitas' ? 'text-blue-950' : 'text-slate-800'}`}>
                        Identitas Utama &amp; Kontak Pegawai
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                      Status Kepegawaian, NIK 16 Digit, NIP/NI PPPK, Nama Lengkap &amp; Gelar, Demografi
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      openTab === 'identitas'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {openTab === 'identitas' ? 'Buka (Klik untuk Tutup)' : 'Tutup (Klik untuk Buka)'}
                  </span>
                  <div
                    className={`p-1 rounded-md text-slate-500 transition-transform duration-200 ${
                      openTab === 'identitas' ? 'rotate-180 text-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openTab === 'identitas' && (
                <div
                  id="tab-content-identitas"
                  className="p-3.5 sm:p-5 border-t border-blue-100 bg-white space-y-4 animate-in fade-in duration-150"
                >
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 sm:p-3.5 flex items-start space-x-3 text-blue-900">
                    <CreditCard className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-relaxed">
                      <strong>Identitas &amp; Nomor Registrasi Resmi:</strong> NIK wajib 16 digit murni dan NIP/NI PPPK 18 digit valid sesuai algoritma BKN &amp; Ditjen Dukcapil Kemendagri.
                    </div>
                  </div>

                  {/* Baris Identitas & Nomor Pengenal (Responsive Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Kolom 1: Status Kepegawaian */}
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Status Kepegawaian:*
                      </label>
                      {isEditModalOpen ? (
                        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 text-xs">
                          {formData.status_kepegawaian}
                        </div>
                      ) : (
                        <select
                          id="select-status-kepegawaian"
                          value={formData.status_kepegawaian}
                          onChange={(e) =>
                            handleStatusKepegawaianChange(e.target.value as StatusKepegawaian)
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                          <option value="PPPK Penuh Waktu">PPPK Penuh Waktu</option>
                          <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                          <option value="Non-ASN">Non-ASN (Tenaga Kontrak/PKWT)</option>
                        </select>
                      )}
                    </div>

                    {/* Kolom 2: NIK 16 Digit */}
                    <div className="sm:col-span-1">
                      <label className="block font-bold text-[#1E293B] mb-1">
                        NIK (16 Digit):*
                      </label>
                      <input
                        id="input-nik"
                        type="text"
                        required
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => handleNikChange(e.target.value)}
                        placeholder="16 digit KTP murni"
                        className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-semibold ${
                          nikValidationResult
                            ? nikValidationResult.isValid
                              ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-400'
                              : 'border-red-500 focus:ring-2 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                      {nikValidationResult && (
                        <p
                          className={`text-[10px] mt-0.5 font-medium ${
                            nikValidationResult.isValid ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {nikValidationResult.isValid ? 'NIK Valid 16 Digit' : nikValidationResult.error}
                        </p>
                      )}
                    </div>

                    {/* Kolom 3 & 4 (2 Kolom): NIP / NI PPPK 18 Digit */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[#1E293B] mb-1">
                        {formData.status_kepegawaian === 'Non-ASN'
                          ? 'ID Pegawai Non-ASN (Auto NIK):*'
                          : formData.status_kepegawaian?.startsWith('PPPK')
                          ? 'NI PPPK (18 Digit Resmi BKN):*'
                          : 'NIP Baru (18 Digit Resmi BKN):*'}
                      </label>
                      <input
                        id="input-nip"
                        type="text"
                        required
                        disabled={isEditModalOpen || formData.status_kepegawaian === 'Non-ASN'}
                        maxLength={18}
                        value={formData.status_kepegawaian === 'Non-ASN' ? formData.nik : formData.nip}
                        onChange={(e) => handleNipChange(e.target.value)}
                        placeholder={
                          formData.status_kepegawaian === 'Non-ASN'
                            ? 'Otomatis diisi dari NIK'
                            : 'Contoh: 198505122010011002'
                        }
                        className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-xs font-mono font-semibold ${
                          formData.status_kepegawaian === 'Non-ASN' || isEditModalOpen
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                            : nipValidationResult
                            ? nipValidationResult.isValid
                              ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-400'
                              : 'border-red-500 focus:ring-2 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                      {nipValidationResult && formData.status_kepegawaian !== 'Non-ASN' && (
                        <p
                          className={`text-[10px] mt-0.5 font-medium ${
                            nipValidationResult.isValid
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          {nipValidationResult.isValid
                            ? 'NIP Valid 18 Digit (Tgl Lahir & Gender Terdeteksi)'
                            : nipValidationResult.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Baris Nama & Gelar (Responsive Grid: Adapt based on featureConfig?.pencantuman_gelar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 pt-1">
                    {/* Gelar Depan (Tampil jika fitur pencantuman gelar aktif) */}
                    {featureConfig?.pencantuman_gelar !== false && (
                      <div className="sm:col-span-1">
                        <label className="block font-bold text-[#1E293B] mb-1">
                          Gelar Depan:
                        </label>
                        <input
                          id="input-gelar-depan"
                          type="text"
                          value={formData.gelar_depan || ''}
                          onChange={(e) => setFormData({ ...formData, gelar_depan: e.target.value })}
                          placeholder="dr., Dr., Ns."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Nama Lengkap */}
                    <div className={featureConfig?.pencantuman_gelar !== false ? "sm:col-span-4" : "sm:col-span-6"}>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Nama Lengkap (Tanpa Gelar):*
                      </label>
                      <input
                        id="input-nama-lengkap"
                        type="text"
                        required
                        value={formData.nama_lengkap}
                        onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                        placeholder="Masukkan nama lengkap sesuai KTP / SK BKN"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Gelar Belakang (Tampil jika fitur pencantuman gelar aktif) */}
                    {featureConfig?.pencantuman_gelar !== false && (
                      <div className="sm:col-span-1">
                        <label className="block font-bold text-[#1E293B] mb-1">
                          Gelar Belakang:
                        </label>
                        <input
                          id="input-gelar-belakang"
                          type="text"
                          value={formData.gelar_belakang || ''}
                          onChange={(e) => setFormData({ ...formData, gelar_belakang: e.target.value })}
                          placeholder="S.Kep., M.Kes."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Baris Demografi & Kontak (Responsive Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Tempat Lahir:*
                      </label>
                      <input
                        id="input-tempat-lahir"
                        type="text"
                        required
                        value={formData.tempat_lahir}
                        onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                        placeholder="Contoh: Lombok Barat"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Tanggal Lahir:*
                      </label>
                      <input
                        id="input-tanggal-lahir"
                        type="date"
                        required
                        value={formData.tanggal_lahir}
                        onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Jenis Kelamin:*
                      </label>
                      <select
                        id="select-jenis-kelamin"
                        value={formData.jenis_kelamin}
                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Nomor WhatsApp / HP:
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="input-no-whatsapp"
                          type="text"
                          value={formData.no_whatsapp || ''}
                          onChange={(e) => setFormData({ ...formData, no_whatsapp: e.target.value })}
                          placeholder="08123456789"
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informasi Tambahan: Profesi Kesehatan & Sisa Cuti (Sisa Cuti kondisional) */}
                  <div className={`grid grid-cols-1 ${featureConfig?.hak_cuti_tahunan !== false ? 'sm:grid-cols-2' : ''} gap-3 pt-1 border-t border-slate-100`}>
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Rumpun Profesi Kesehatan (SDMK):*
                      </label>
                      <select
                        id="select-profesi-sdmk"
                        value={formData.profesi_sdmk}
                        onChange={(e) => setFormData({ ...formData, profesi_sdmk: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Dokter Umum">Dokter Umum</option>
                        <option value="Dokter Gigi">Dokter Gigi</option>
                        <option value="Dokter Spesialis">Dokter Spesialis</option>
                        <option value="Perawat">Perawat</option>
                        <option value="Bidan">Bidan</option>
                        <option value="Tenaga Farmasi (Apoteker / TTK)">Tenaga Farmasi (Apoteker / TTK)</option>
                        <option value="Nutrisionis / Dietisien">Nutrisionis / Dietisien</option>
                        <option value="Tenaga Sanitasi Lingkungan / Sanitarian">Tenaga Sanitasi Lingkungan / Sanitarian</option>
                        <option value="Pranata Laboratorium Kesehatan">Pranata Laboratorium Kesehatan</option>
                        <option value="Epidemiolog Kesehatan">Epidemiolog Kesehatan</option>
                        <option value="Perekam Medis & Informasi Kesehatan">Perekam Medis & Informasi Kesehatan</option>
                        <option value="Radiografer / Teknisi Medis">Radiografer / Teknisi Medis</option>
                        <option value="Fisioterapis">Fisioterapis</option>
                        <option value="Administrator Kesehatan">Administrator Kesehatan</option>
                        <option value="Penyuluh Kesehatan Masyarakat">Penyuluh Kesehatan Masyarakat</option>
                        <option value="Tenaga Teknis / Administrasi">Tenaga Teknis / Administrasi</option>
                      </select>
                    </div>

                    {isCutiEnabled && (
                      <div>
                        <label className="block font-bold text-[#1E293B] mb-1">
                          Sisa Kuota Cuti Tahunan (Hari):*
                        </label>
                        <input
                          id="input-sisa-cuti-tahunan"
                          type="number"
                          min={0}
                          max={24}
                          value={formData.sisa_cuti_tahunan ?? 12}
                          onChange={(e) => setFormData({ ...formData, sisa_cuti_tahunan: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================================= */}
            {/* ACCORDION TAB 2: AKADEMIK & JABATAN */}
            {/* ======================================================================= */}
            <div
              id="accordion-item-akademik"
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                openTab === 'akademik'
                  ? 'border-indigo-300 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                id="btn-toggle-tab-akademik"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTab('akademik');
                }}
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      openTab === 'akademik'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    2
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className={`w-4 h-4 shrink-0 ${openTab === 'akademik' ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <span className={`font-heading font-bold text-xs sm:text-sm truncate ${openTab === 'akademik' ? 'text-indigo-950' : 'text-slate-800'}`}>
                        Riwayat Akademik, Jabatan &amp; Izin Belajar
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                      Pendidikan, Unit Kerja, Jenis Jabatan, Tugas Belajar, Pencantuman Gelar &amp; UKKJ
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      openTab === 'akademik'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {openTab === 'akademik' ? 'Buka (Klik untuk Tutup)' : 'Tutup (Klik untuk Buka)'}
                  </span>
                  <div
                    className={`p-1 rounded-md text-slate-500 transition-transform duration-200 ${
                      openTab === 'akademik' ? 'rotate-180 text-indigo-600 bg-indigo-50' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openTab === 'akademik' && (
                <div
                  id="tab-content-akademik"
                  className="p-3.5 sm:p-5 border-t border-indigo-100 bg-white space-y-4 animate-in fade-in duration-150"
                >
                  {/* Baris Jabatan & Unit Kerja (Responsive Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Jenis Jabatan:*
                      </label>
                      <select
                        id="select-jenis-jabatan"
                        value={formData.jenis_jabatan}
                        onChange={(e) => {
                          const val = e.target.value as JenisJabatan;
                          setFormData((prev: any) => ({
                            ...prev,
                            jenis_jabatan: val,
                            status_ukkj: val === 'Fungsional' ? prev.status_ukkj : 'Bukan Jafung',
                            status_ujian_dinas: val === 'Pelaksana' ? prev.status_ujian_dinas : 'Bukan Pelaksana',
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Fungsional">Fungsional (Jafung Nakes/Non-Nakes)</option>
                        <option value="Pelaksana">Pelaksana (Staf Teknis/Umum)</option>
                        <option value="Struktural">Struktural (Manajerial/Pimpinan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Jabatan Spesifik / Nomenklatur:*
                      </label>
                      <input
                        id="input-jabatan-spesifik"
                        type="text"
                        required
                        value={formData.jabatan_spesifik}
                        onChange={(e) => setFormData({ ...formData, jabatan_spesifik: e.target.value })}
                        placeholder="Contoh: Perawat Ahli Muda / Bidan Terampil"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Unit Kerja Penempatan:*
                      </label>
                      <select
                        id="select-unit-kerja"
                        value={formData.unit_kerja}
                        onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        {synchronizedUnitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Baris Pendidikan Terakhir */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Pendidikan Terakhir:*
                      </label>
                      <input
                        id="input-pendidikan-terakhir"
                        type="text"
                        required
                        value={formData.pendidikan_terakhir}
                        onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
                        placeholder="Contoh: S1 Keperawatan / D3 Kebidanan"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Nama Universitas / Institusi PT:
                      </label>
                      <input
                        id="input-nama-universitas"
                        type="text"
                        value={formData.nama_universitas_pt || ''}
                        onChange={(e) => setFormData({ ...formData, nama_universitas_pt: e.target.value })}
                        placeholder="Contoh: Universitas Mataram / Poltekkes"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">
                        Jurusan / Program Studi:
                      </label>
                      <input
                        id="input-program-studi"
                        type="text"
                        value={formData.program_studi || ''}
                        onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
                        placeholder="Contoh: Ilmu Keperawatan / Kesehatan Masyarakat"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* BAGIAN KHUSUS: PENGEMBANGAN KOMPETENSI & STUDI (IZIN / TUGAS BELAJAR & GELAR) */}
                  {(isIzinBelajarEnabled || isGelarEnabled) && (
                    <div
                      id="section-izin-tugas-belajar"
                      className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 sm:p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-5 h-5 text-indigo-700 shrink-0" />
                          <div>
                            <h4 className="font-heading font-bold text-indigo-950 text-xs">
                              Pengembangan Kompetensi &amp; Studi {isIzinBelajarEnabled ? '(Izin / Tugas Belajar)' : ''} {isGelarEnabled ? '& Pencantuman Gelar' : ''}
                            </h4>
                            <p className="text-[11px] text-indigo-700">
                              Layanan administrasi peningkatan kualifikasi pendidikan dan pencatatan gelar SAPK BKN
                            </p>
                          </div>
                        </div>

                        {/* Checkbox Status Izin / Tugas Belajar (Hanya jika fitur izin_tugas_belajar aktif) */}
                        {isIzinBelajarEnabled && (
                          <label className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-indigo-300 rounded-lg shadow-2xs cursor-pointer hover:bg-indigo-50/50 transition-colors shrink-0">
                            <input
                              id="checkbox-status-izin-belajar"
                              type="checkbox"
                              checked={!!formData.status_izin_belajar}
                              onChange={(e) => setFormData({ ...formData, status_izin_belajar: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-xs font-bold text-indigo-900">
                              Status Izin / Tugas Belajar Aktif
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Detail form studi & gelar */}
                      {((isIzinBelajarEnabled && formData.status_izin_belajar) || (!isIzinBelajarEnabled && isGelarEnabled)) && (
                        <div className="pt-2 border-t border-indigo-200/80 space-y-3 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {isIzinBelajarEnabled && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                                    Akreditasi Program Studi / PT:*
                                  </label>
                                  <select
                                    id="select-akreditasi-pt"
                                    value={formData.akreditasi_pt || 'A / Unggul'}
                                    onChange={(e) => setFormData({ ...formData, akreditasi_pt: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-indigo-400"
                                  >
                                    <option value="A / Unggul">A / Unggul (BAN-PT / LAM-PTKes)</option>
                                    <option value="B / Baik Sekali">B / Baik Sekali</option>
                                    <option value="C / Baik">C / Baik</option>
                                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                                    Progres Semester:*
                                  </label>
                                  <select
                                    id="select-progres-semester"
                                    value={formData.progres_semester || 'Semester 1'}
                                    onChange={(e) => setFormData({ ...formData, progres_semester: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-indigo-400"
                                  >
                                    <option value="Semester 1">Semester 1 (Awal Studi)</option>
                                    <option value="Semester 2">Semester 2</option>
                                    <option value="Semester 3">Semester 3</option>
                                    <option value="Semester 4">Semester 4</option>
                                    <option value="Semester 5">Semester 5</option>
                                    <option value="Semester 6">Semester 6</option>
                                    <option value="Semester 7">Semester 7</option>
                                    <option value="Semester 8">Semester 8</option>
                                    <option value="Tahap Akhir / Tesis / Skripsi">Tahap Akhir / Tesis / Skripsi</option>
                                    <option value="Selesai / Lulus">Selesai / Lulus (Menunggu Pencantuman Gelar)</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {isGelarEnabled && (
                              <div className={!isIzinBelajarEnabled ? 'sm:col-span-3' : ''}>
                                <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                                  Status Pencantuman Gelar BKN:*
                                </label>
                                <select
                                  id="select-status-pencantuman-gelar"
                                  value={formData.status_pencantuman_gelar || 'Proses Verval'}
                                  onChange={(e) => setFormData({ ...formData, status_pencantuman_gelar: e.target.value })}
                                  className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-indigo-400"
                                >
                                  <option value="Terverifikasi BKN">Terverifikasi BKN (Gelar Resmi Masuk SAPK)</option>
                                  <option value="Proses Verval">Proses Verval / Usulan SIASN Dikes</option>
                                  <option value="Belum Pengajuan">Belum Pengajuan Usulan</option>
                                  <option value="Bukan Tugas Belajar">Bukan Tugas Belajar</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ATRIBUT PEMANTAUAN ASN SESUAI JENIS JABATAN: FUNGSIONAL */}
                  {formData.jenis_jabatan === 'Fungsional' && (isJafungEnabled || isUkomEnabled) && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="font-heading font-bold text-slate-800 flex items-center space-x-2 text-xs">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>Atribut Jabatan Fungsional {isJafungEnabled ? '(PAK Integrasi / PermenPANRB)' : ''}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Jenjang Jafung:*
                          </label>
                          <select
                            value={formData.jenjang_jabatan}
                            onChange={(e) => setFormData({ ...formData, jenjang_jabatan: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          >
                            <option value="Ahli Utama">Ahli Utama</option>
                            <option value="Ahli Madya">Ahli Madya</option>
                            <option value="Ahli Muda">Ahli Muda</option>
                            <option value="Ahli Pertama">Ahli Pertama</option>
                            <option value="Penyelia">Penyelia</option>
                            <option value="Mahir">Mahir</option>
                            <option value="Terampil">Terampil</option>
                            <option value="Pemula">Pemula</option>
                          </select>
                        </div>

                        {isJafungEnabled && (
                          <>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                AK Konversi SKP Tahunan:*
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.ak_konversi_skp ?? 12.5}
                                onChange={(e) => setFormData({ ...formData, ak_konversi_skp: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                Total AK Kumulatif (PAK):*
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.total_ak_kumulatif ?? 37.5}
                                onChange={(e) => setFormData({ ...formData, total_ak_kumulatif: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">
                                Predikat Kinerja SKP:*
                              </label>
                              <select
                                value={formData.predikat_skp_terakhir}
                                onChange={(e) => setFormData({ ...formData, predikat_skp_terakhir: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                              >
                                <option value="Sangat Baik">Sangat Baik (150% AK)</option>
                                <option value="Baik">Baik (100% AK)</option>
                                <option value="Cukup">Cukup (75% AK)</option>
                                <option value="Kurang">Kurang (50% AK)</option>
                                <option value="Sangat Kurang">Sangat Kurang (25% AK)</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Baris UKKJ: Hanya tampil jika fitur uji kompetensi aktif */}
                      {isUkomEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Status UKKJ (Uji Kompetensi Kenaikan Jenjang):
                            </label>
                            <select
                              value={formData.status_ukkj || 'Belum UKKJ'}
                              onChange={(e) => setFormData({ ...formData, status_ukkj: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                            >
                              <option value="Lulus UKKJ">Lulus UKKJ (Siap Naik Jenjang)</option>
                              <option value="Dalam Proses">Dalam Proses Uji Kompetensi</option>
                              <option value="Belum UKKJ">Belum UKKJ</option>
                              <option value="Bukan Jafung">Bukan Jafung</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Nomor Sertifikat UKKJ (Jika Lulus):
                            </label>
                            <input
                              type="text"
                              value={formData.no_sertifikat_ukkj || ''}
                              onChange={(e) => setFormData({ ...formData, no_sertifikat_ukkj: e.target.value })}
                              placeholder="Nomor sertifikat ukom kemenkes/bkn"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ATRIBUT PEMANTAUAN ASN: PELAKSANA (UJIAN DINAS & STLUD) */}
                  {formData.jenis_jabatan === 'Pelaksana' && isUjianDinasEnabled && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="font-heading font-bold text-slate-800 flex items-center space-x-2 text-xs">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Atribut Jabatan Pelaksana (Ujian Dinas &amp; STLUD BKN)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Status Ujian Dinas / Penyesuaian Ijazah:*
                          </label>
                          <select
                            value={formData.status_ujian_dinas || 'Belum Ujian'}
                            onChange={(e) => setFormData({ ...formData, status_ujian_dinas: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          >
                            <option value="Lulus STLUD">Lulus STLUD (Surat Tanda Lulus Ujian Dinas)</option>
                            <option value="Penyesuaian Ijazah">Lulus Ujian Penyesuaian Ijazah</option>
                            <option value="Belum Ujian">Belum Ujian Dinas</option>
                            <option value="Bukan Pelaksana">Bukan Pelaksana</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Nomor STLUD / Sertifikat Lulus:
                          </label>
                          <input
                            type="text"
                            value={formData.no_stlud || ''}
                            onChange={(e) => setFormData({ ...formData, no_stlud: e.target.value })}
                            placeholder="Nomor sertifikat STLUD BKN"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Predikat Kinerja SKP:*
                          </label>
                          <select
                            value={formData.predikat_skp_terakhir}
                            onChange={(e) => setFormData({ ...formData, predikat_skp_terakhir: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          >
                            <option value="Sangat Baik">Sangat Baik</option>
                            <option value="Baik">Baik</option>
                            <option value="Cukup">Cukup</option>
                            <option value="Kurang">Kurang</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================================= */}
            {/* ACCORDION TAB 3: ATRIBUT GOLONGAN & LEGALITAS MUTASI */}
            {/* ======================================================================= */}
            <div
              id="accordion-item-golongan"
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                openTab === 'golongan'
                  ? 'border-amber-300 bg-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                id="btn-toggle-tab-golongan"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTab('golongan');
                }}
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      openTab === 'golongan'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    3
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <Award className={`w-4 h-4 shrink-0 ${openTab === 'golongan' ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span className={`font-heading font-bold text-xs sm:text-sm truncate ${openTab === 'golongan' ? 'text-amber-950' : 'text-slate-800'}`}>
                        Kepangkatan, Golongan &amp; Legalitas Mutasi
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                      Pangkat Golongan, Masa Kerja, SPK PPPK/Non-ASN, Penempatan &amp; Pertek BKN
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      openTab === 'golongan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {openTab === 'golongan' ? 'Buka (Klik untuk Tutup)' : 'Tutup (Klik untuk Buka)'}
                  </span>
                  <div
                    className={`p-1 rounded-md text-slate-500 transition-transform duration-200 ${
                      openTab === 'golongan' ? 'rotate-180 text-amber-600 bg-amber-50' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openTab === 'golongan' && (
                <div
                  id="tab-content-golongan"
                  className="p-3.5 sm:p-5 border-t border-amber-100 bg-white space-y-4 animate-in fade-in duration-150"
                >
                  {/* ======================= PNS SECTION ======================= */}
                  {formData.status_kepegawaian === 'PNS' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                        <div className="font-heading font-bold text-blue-900 text-xs flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Pangkat &amp; Golongan Ruang PNS Terakhir</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              Golongan / Ruang:*
                            </label>
                            <select
                              id="select-golongan-pns"
                              value={formData.golongan_pangkat}
                              onChange={(e) => handleGolonganPnsChange(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-bold text-blue-900"
                            >
                              {Object.keys(PANGKAT_GOLONGAN_MAP).map((gol) => (
                                <option key={gol} value={gol}>
                                  {gol} - {PANGKAT_GOLONGAN_MAP[gol]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              Nama Pangkat (Auto):
                            </label>
                            <input
                              type="text"
                              disabled
                              value={formData.nama_pangkat}
                              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              TMT Golongan Terakhir:*
                            </label>
                            <input
                              type="date"
                              value={formData.tmt_golongan || ''}
                              onChange={(e) => setFormData({ ...formData, tmt_golongan: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-blue-100">
                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              Masa Kerja (Tahun):*
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={formData.masa_kerja_tahun ?? 0}
                              onChange={(e) => setFormData({ ...formData, masa_kerja_tahun: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              Masa Kerja (Bulan):*
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={11}
                              value={formData.masa_kerja_bulan ?? 0}
                              onChange={(e) => setFormData({ ...formData, masa_kerja_bulan: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              No. SK Pangkat:
                            </label>
                            <input
                              type="text"
                              value={formData.no_sk_pangkat || ''}
                              onChange={(e) => setFormData({ ...formData, no_sk_pangkat: e.target.value })}
                              placeholder="Contoh: 823/123/BKD-PSDM/2023"
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-semibold font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-blue-950 mb-1">
                              Tanggal SK Pangkat:
                            </label>
                            <input
                              type="date"
                              value={formData.tgl_sk_pangkat || ''}
                              onChange={(e) => setFormData({ ...formData, tgl_sk_pangkat: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* LEGALITAS MUTASI KEPEGAWAIAN & PENEMPATAN (Hanya tampil jika fitur mutasi_kepegawaian aktif) */}
                      {isMutasiEnabled && (
                        <div
                          id="section-legalitas-mutasi"
                          className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 sm:p-4 space-y-3"
                        >
                          <div className="font-heading font-bold text-amber-950 text-xs flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-amber-700" />
                            <span>Legalitas Mutasi &amp; Penempatan Jabatan PNS</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Pengaturan mutasi antar unit kerja/puskesmas, alih jabatan struktural/fungsional, dan legalitas Pertek BKN
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                Unit Kerja Tujuan / Penempatan Baru:*
                              </label>
                              <select
                                id="select-unit-kerja-tujuan"
                                value={formData.unit_kerja}
                                onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-amber-400"
                              >
                                {synchronizedUnitOptions.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                Jenis Mutasi Kepegawaian:*
                              </label>
                              <select
                                id="select-jenis-mutasi"
                                value={formData.jenis_mutasi || 'Kenaikan Pangkat Reguler'}
                                onChange={(e) => setFormData({ ...formData, jenis_mutasi: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold focus:ring-2 focus:ring-amber-400"
                              >
                                <option value="Kenaikan Pangkat Reguler">Kenaikan Pangkat Reguler</option>
                                <option value="Mutasi Internal Antar-Puskesmas/RSUD">Mutasi Internal Antar-Puskesmas / RSUD Lobar</option>
                                <option value="Mutasi Masuk dari Luar Daerah">Mutasi Masuk dari Luar Daerah</option>
                                <option value="Mutasi Keluar Daerah">Mutasi Keluar Daerah</option>
                                <option value="Alih Jabatan Struktural ke Fungsional">Alih Jabatan Struktural ke Fungsional</option>
                                <option value="Alih Jabatan Fungsional ke Struktural">Alih Jabatan Fungsional ke Struktural</option>
                                <option value="Penyesuaian Ijazah">Penyesuaian Ijazah</option>
                                <option value="Pengangkatan Pertama CPNS">Pengangkatan Pertama CPNS</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-amber-200">
                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                No. Pertek BKN (Persetujuan Teknis):
                              </label>
                              <input
                                id="input-no-pertek-bkn"
                                type="text"
                                value={formData.no_pertek_bkn || ''}
                                onChange={(e) => setFormData({ ...formData, no_pertek_bkn: e.target.value })}
                                placeholder="Contoh: 12345/B-MP.01.01/SD/D/2023"
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                Tanggal Pertek BKN:
                              </label>
                              <input
                                id="input-tgl-pertek-bkn"
                                type="date"
                                value={formData.tgl_pertek_bkn || ''}
                                onChange={(e) => setFormData({ ...formData, tgl_pertek_bkn: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-amber-200">
                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                Nama Jabatan / Penempatan:
                              </label>
                              <input
                                id="input-nama-jabatan-pns"
                                type="text"
                                value={formData.nama_jabatan_pns || formData.jabatan_spesifik || ''}
                                onChange={(e) => setFormData({ ...formData, nama_jabatan_pns: e.target.value })}
                                placeholder="Nama jabatan sesuai SK penempatan"
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                No. SK Penempatan / Mutasi:
                              </label>
                              <input
                                id="input-no-sk-jabatan-pns"
                                type="text"
                                value={formData.no_sk_jabatan_pns || ''}
                                onChange={(e) => setFormData({ ...formData, no_sk_jabatan_pns: e.target.value })}
                                placeholder="Nomor SK Bupati / Kadinkes"
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                TMT Jabatan / Penempatan:
                              </label>
                              <input
                                id="input-tmt-jabatan-pns"
                                type="date"
                                value={formData.tmt_jabatan_pns || ''}
                                onChange={(e) => setFormData({ ...formData, tmt_jabatan_pns: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-amber-200">
                            <div>
                              <label className="block font-bold text-amber-950 mb-1">
                                TMT CPNS (Pengangkatan Awal):*
                              </label>
                              <input
                                id="input-tmt-cpns"
                                type="date"
                                value={formData.tmt_cpns || ''}
                                onChange={(e) => setFormData({ ...formData, tmt_cpns: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold"
                              />
                            </div>

                            {(featureConfig?.kenaikan_pangkat !== false || featureConfig?.kenaikan_gaji_berkala !== false) && (
                              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 flex items-center space-x-2.5">
                                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="text-[11px] text-amber-900">
                                  <strong>Otomatisasi Berkala:</strong>{' '}
                                  {featureConfig?.kenaikan_pangkat !== false && featureConfig?.kenaikan_gaji_berkala !== false
                                    ? 'Kenaikan Pangkat dihitung +4 Tahun dari TMT Golongan, dan KGB dihitung +2 Tahun.'
                                    : featureConfig?.kenaikan_pangkat !== false
                                    ? 'Kenaikan Pangkat dihitung +4 Tahun dari TMT Golongan.'
                                    : 'KGB dihitung +2 Tahun dari TMT Golongan/KGB.'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================= PPPK SECTION ======================= */}
                  {formData.status_kepegawaian?.startsWith('PPPK') && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="font-heading font-bold text-emerald-950 text-xs flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>Atribut &amp; Kontrak Kerja PPPK (Per BKN No. 18/2020)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            Golongan PPPK:*
                          </label>
                          <select
                            id="select-golongan-pppk"
                            value={formData.golongan_pppk || 'Golongan IX'}
                            onChange={(e) => setFormData({ ...formData, golongan_pppk: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-bold text-emerald-900"
                          >
                            {[
                              'Golongan I', 'Golongan II', 'Golongan III', 'Golongan IV',
                              'Golongan V', 'Golongan VI', 'Golongan VII', 'Golongan VIII',
                              'Golongan IX', 'Golongan X', 'Golongan XI', 'Golongan XII',
                              'Golongan XIII', 'Golongan XIV', 'Golongan XV', 'Golongan XVI', 'Golongan XVII'
                            ].map((gol) => (
                              <option key={gol} value={gol}>{gol}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            No. Perjanjian Kerja (SPK):*
                          </label>
                          <input
                            id="input-no-perjanjian-kerja"
                            type="text"
                            value={formData.no_perjanjian_kerja || ''}
                            onChange={(e) => setFormData({ ...formData, no_perjanjian_kerja: e.target.value })}
                            placeholder="Nomor SPK PPPK"
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            Tanggal SPK:
                          </label>
                          <input
                            id="input-tgl-perjanjian-kerja"
                            type="date"
                            value={formData.tgl_perjanjian_kerja || ''}
                            onChange={(e) => setFormData({ ...formData, tgl_perjanjian_kerja: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-100">
                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            TMT Mulai Perjanjian:*
                          </label>
                          <input
                            id="input-tmt-perjanjian-mulai"
                            type="date"
                            value={formData.tmt_perjanjian_mulai || ''}
                            onChange={(e) => setFormData({ ...formData, tmt_perjanjian_mulai: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            TMT Selesai Perjanjian:*
                          </label>
                          <input
                            id="input-tmt-perjanjian-selesai"
                            type="date"
                            value={formData.tmt_perjanjian_selesai || ''}
                            onChange={(e) => setFormData({ ...formData, tmt_perjanjian_selesai: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            No. SK Pengangkatan PPPK:
                          </label>
                          <input
                            id="input-no-sk-pppk"
                            type="text"
                            value={formData.no_sk_pppk || ''}
                            onChange={(e) => setFormData({ ...formData, no_sk_pppk: e.target.value })}
                            placeholder="Nomor SK Bupati"
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            Satuan Kerja / Penempatan:*
                          </label>
                          <select
                            id="select-satker-pppk"
                            value={formData.satker || formData.unit_kerja}
                            onChange={(e) => setFormData({ ...formData, satker: e.target.value, unit_kerja: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold"
                          >
                            {synchronizedUnitOptions.map((unit) => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-950 mb-1">
                            TMT Pengangkatan Awal PPPK:*
                          </label>
                          <input
                            id="input-tmt-cpns-pppk"
                            type="date"
                            value={formData.tmt_cpns || formData.tmt_perjanjian_mulai || ''}
                            onChange={(e) => setFormData({ ...formData, tmt_cpns: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg outline-none text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================= NON-ASN SECTION ======================= */}
                  {formData.status_kepegawaian === 'Non-ASN' && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="font-heading font-bold text-amber-950 text-xs flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span>Atribut Tenaga Kontrak / Non-ASN (PKWT BLUD/APBD)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-amber-950 mb-1">
                            No. SK Kontrak Kerja:*
                          </label>
                          <input
                            id="input-no-sk-kontrak"
                            type="text"
                            value={formData.no_sk_kontrak || ''}
                            onChange={(e) => setFormData({ ...formData, no_sk_kontrak: e.target.value })}
                            placeholder="Contoh: 800/12/BLUD-PKM/2024"
                            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-amber-950 mb-1">
                            Masa Kerja Non-ASN:
                          </label>
                          <input
                            id="input-masa-kerja-non-asn"
                            type="text"
                            value={formData.masa_kerja_non_asn || '1 Tahun'}
                            onChange={(e) => setFormData({ ...formData, masa_kerja_non_asn: e.target.value })}
                            placeholder="Contoh: 2 Tahun 4 Bulan"
                            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-amber-950 mb-1">
                            Sumber Pembiayaan:*
                          </label>
                          <select
                            id="select-sumber-pembiayaan"
                            value={formData.sumber_pembiayaan || 'BLUD'}
                            onChange={(e) => setFormData({ ...formData, sumber_pembiayaan: e.target.value as SumberPembiayaan })}
                            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg outline-none text-xs font-bold text-amber-900"
                          >
                            <option value="BLUD">BLUD (Badan Layanan Umum Daerah)</option>
                            <option value="APBD">APBD Kabupaten Lombok Barat</option>
                            <option value="APBN">APBN / BOK (Bantuan Operasional Kesehatan)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================================= */}
            {/* ACCORDION TAB 4: KELUARGA & TUNJANGAN (KP4) */}
            {/* ======================================================================= */}
            {isKp4Enabled && (
              <div
                id="accordion-item-keluarga"
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  openTab === 'keluarga'
                    ? 'border-rose-300 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <button
                  id="btn-toggle-tab-keluarga"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTab('keluarga');
                  }}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        openTab === 'keluarga'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      4
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <Heart className={`w-4 h-4 shrink-0 ${openTab === 'keluarga' ? 'text-rose-600' : 'text-slate-500'}`} />
                        <span className={`font-heading font-bold text-xs sm:text-sm truncate ${openTab === 'keluarga' ? 'text-rose-950' : 'text-slate-800'}`}>
                          Data Keluarga &amp; Tunjangan Gaji (KP4)
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                        Status Pernikahan, Tunjangan Pasangan, Daftar Anak Tanggungan ({daftarAnak.length} Anak)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        openTab === 'keluarga'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {openTab === 'keluarga' ? 'Buka (Klik untuk Tutup)' : 'Tutup (Klik untuk Buka)'}
                    </span>
                    <div
                      className={`p-1 rounded-md text-slate-500 transition-transform duration-200 ${
                        openTab === 'keluarga' ? 'rotate-180 text-rose-600 bg-rose-50' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {openTab === 'keluarga' && (
                  <div
                    id="tab-content-keluarga"
                    className="p-3.5 sm:p-5 border-t border-rose-100 bg-white space-y-4 animate-in fade-in duration-150"
                  >
                    {/* Status Perkawinan & Data Pasangan */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="font-heading font-bold text-slate-800 text-xs flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Status Pernikahan &amp; Tunjangan Pasangan (KP4)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Status Perkawinan:*
                          </label>
                          <select
                            id="select-status-perkawinan"
                            value={statusPerkawinan}
                            onChange={(e) =>
                              setStatusPerkawinan(e.target.value as 'Menikah' | 'Belum Menikah' | 'Duda' | 'Janda')
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                          >
                            <option value="Menikah">Menikah</option>
                            <option value="Belum Menikah">Belum Menikah (Lajang)</option>
                            <option value="Duda">Duda</option>
                            <option value="Janda">Janda</option>
                          </select>
                        </div>

                        {statusPerkawinan === 'Menikah' && (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Nama Lengkap Pasangan (Suami / Istri):
                            </label>
                            <input
                              id="input-nama-pasangan"
                              type="text"
                              value={namaPasangan}
                              onChange={(e) => setNamaPasangan(e.target.value)}
                              placeholder="Nama lengkap suami/istri"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>
                        )}
                      </div>

                      {statusPerkawinan === 'Menikah' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Tanggal Lahir Pasangan:
                            </label>
                            <input
                              id="input-tgl-lahir-pasangan"
                              type="date"
                              value={tglLahirPasangan}
                              onChange={(e) => setTglLahirPasangan(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                            />
                          </div>

                          <div className="flex items-center pt-2 sm:pt-4">
                            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 w-full hover:bg-emerald-50/50 transition-colors">
                              <input
                                id="checkbox-tanggungan-pasangan"
                                type="checkbox"
                                checked={tanggunganPasangan}
                                onChange={(e) => setTanggunganPasangan(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                              />
                              <span className="text-xs font-semibold text-emerald-800">
                                Tunjangan Pasangan Aktif (Masuk Daftar Gaji)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DAFTAR ANAK TANGGUNGAN (KP4) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-heading font-bold text-slate-800 text-xs flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>Daftar Anak Tanggungan KP4 ({daftarAnak.length})</span>
                        </div>
                        <button
                          id="btn-tambah-anak-row"
                          type="button"
                          onClick={handleAddChildRow}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-heading font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Anak</span>
                        </button>
                      </div>

                      {daftarAnak.length === 0 ? (
                        <div className="p-4 sm:p-5 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                          <p className="font-medium text-xs">Belum ada data anak tanggungan.</p>
                          <p className="text-[11px] text-slate-400">
                            Klik tombol &quot;Tambah Anak&quot; di atas untuk mendaftarkan anak pada daftar gaji KP4.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {daftarAnak.map((anak, idx) => (
                            <div
                              key={anak.id || idx}
                              className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>Data Anak Ke-{idx + 1}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChildRow(anak.id)}
                                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Hapus baris anak"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                    Nama Lengkap Anak:*
                                  </label>
                                  <input
                                    type="text"
                                    value={anak.nama_keluarga}
                                    onChange={(e) =>
                                      handleUpdateChildRow(anak.id, 'nama_keluarga', e.target.value)
                                    }
                                    placeholder="Nama anak"
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                    Tanggal Lahir:*
                                  </label>
                                  <input
                                    type="date"
                                    value={anak.tanggal_lahir}
                                    onChange={(e) =>
                                      handleUpdateChildRow(anak.id, 'tanggal_lahir', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="flex items-center pt-2 sm:pt-4">
                                  <label className="flex items-center space-x-1.5 cursor-pointer bg-emerald-50/60 px-2.5 py-1.5 rounded border border-emerald-100 w-full">
                                    <input
                                      type="checkbox"
                                      checked={anak.status_tanggungan}
                                      onChange={(e) =>
                                        handleUpdateChildRow(anak.id, 'status_tanggungan', e.target.checked)
                                      }
                                      className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-semibold text-emerald-800">
                                      Tunjangan Aktif
                                    </span>
                                  </label>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                <div>
                                  <input
                                    type="text"
                                    value={anak.nama_sekolah_pt || ''}
                                    onChange={(e) =>
                                      handleUpdateChildRow(anak.id, 'nama_sekolah_pt', e.target.value)
                                    }
                                    placeholder="Sekolah / Perguruan Tinggi (opsional)"
                                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={anak.no_surat_kuliah || ''}
                                    onChange={(e) =>
                                      handleUpdateChildRow(anak.id, 'no_surat_kuliah', e.target.value)
                                    }
                                    placeholder="Nomor Surat Keterangan Kuliah (opsional)"
                                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 3. STICKY FOOTER NAVIGATION */}
          {/* ========================================================================= */}
          <div
            id="pegawai-form-footer"
            className="sticky bottom-0 z-30 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 shadow-xs"
          >
            <div>
              {openTab && openTab !== 'identitas' && (
                <button
                  id="btn-form-prev-step"
                  type="button"
                  onClick={goToPrevTab}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-heading font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <button
                id="btn-form-cancel"
                type="button"
                onClick={onClose}
                className="px-3.5 sm:px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-heading font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Batal
              </button>

              {openTab && (isKp4Enabled ? openTab !== 'keluarga' : openTab !== 'golongan') && (
                <button
                  id="btn-form-next-step"
                  type="button"
                  onClick={goToNextTab}
                  className="px-3.5 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-heading font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Lanjut Tab Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                id="btn-form-submit"
                type="submit"
                className="btn-success text-xs px-4 sm:px-5 py-2 flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Data Pegawai</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
