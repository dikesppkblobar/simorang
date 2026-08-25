import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  FileCheck,
  X,
  Edit2,
  Trash2,
  Eye,
  Upload,
  User,
  Users,
  AlertTriangle,
  Search,
  FileText,
  Building2,
  Calendar,
  GraduationCap,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { KeluargaKP4, Pegawai, StatusHubungan } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatDateIndonesian } from '../services/dateCalculator';
import { openDocumentInNewTab, downloadDocumentFile } from '../utils/fileHelper';

interface Kp4TunjanganViewProps {
  keluargaList: KeluargaKP4[];
  pegawaiList: Pegawai[];
  onAddKeluarga: (data: any) => Promise<boolean>;
  onUpdateKeluarga?: (id: string, updates: Partial<KeluargaKP4>) => Promise<boolean>;
  onDeleteKeluarga?: (id: string) => Promise<boolean>;
  onUpdateTanggungan: (id: string, status: boolean, suratUrl?: string) => Promise<boolean>;
}

export const Kp4TunjanganView: React.FC<Kp4TunjanganViewProps> = ({
  keluargaList,
  pegawaiList,
  onAddKeluarga,
  onUpdateKeluarga,
  onDeleteKeluarga,
  onUpdateTanggungan,
}) => {
  const [filterType, setFilterType] = useState<'semua' | 'anak_alert' | 'aktif'>('semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeluargaKP4 | null>(null);
  const [viewingDetailItem, setViewingDetailItem] = useState<KeluargaKP4 | null>(null);
  const [keluargaToDelete, setKeluargaToDelete] = useState<KeluargaKP4 | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nip_pegawai: pegawaiList[0]?.nip || '',
    nama_keluarga: '',
    status_hubungan: 'Anak' as StatusHubungan,
    tanggal_lahir: '2008-01-01',
    status_tanggungan: true,
    nama_sekolah_pt: '',
    no_surat_kuliah: '',
    tgl_surat_kuliah: '',
    semester_kuliah: '',
    surat_ket_kuliah_url: '' as string | null,
    fileName: '',
  });

  const pegawaiMap = new Map<string, Pegawai>(pegawaiList.map((p) => [p.nip, p]));

  // Helper age calculator
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return { years: 0, months: 0 };
    const birth = new Date(birthDateStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    if (now.getDate() < birth.getDate() && months > 0) {
      months--;
    }
    return { years, months };
  };

  // Open Add Modal
  const handleOpenAddModal = (nip?: string) => {
    setEditingItem(null);
    setFormData({
      nip_pegawai: nip || pegawaiList[0]?.nip || '',
      nama_keluarga: '',
      status_hubungan: 'Anak',
      tanggal_lahir: '2008-01-01',
      status_tanggungan: true,
      nama_sekolah_pt: '',
      no_surat_kuliah: '',
      tgl_surat_kuliah: '',
      semester_kuliah: '',
      surat_ket_kuliah_url: null,
      fileName: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: KeluargaKP4) => {
    setEditingItem(item);
    setFormData({
      nip_pegawai: item.nip_pegawai,
      nama_keluarga: item.nama_keluarga,
      status_hubungan: item.status_hubungan,
      tanggal_lahir: item.tanggal_lahir,
      status_tanggungan: item.status_tanggungan,
      nama_sekolah_pt: item.nama_sekolah_pt || '',
      no_surat_kuliah: item.no_surat_kuliah || '',
      tgl_surat_kuliah: item.tgl_surat_kuliah || '',
      semester_kuliah: item.semester_kuliah || '',
      surat_ket_kuliah_url: item.surat_ket_kuliah_url || null,
      fileName: item.surat_ket_kuliah_url ? 'Dokumen_Suket_Kuliah.pdf' : '',
    });
    setIsAddModalOpen(true);
  };

  // Handle File Upload Simulation / Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          surat_ket_kuliah_url: reader.result as string,
          fileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && onUpdateKeluarga) {
      const success = await onUpdateKeluarga(editingItem.id, {
        nip_pegawai: formData.nip_pegawai,
        nama_keluarga: formData.nama_keluarga,
        status_hubungan: formData.status_hubungan,
        tanggal_lahir: formData.tanggal_lahir,
        status_tanggungan: formData.status_tanggungan,
        nama_sekolah_pt: formData.nama_sekolah_pt || null,
        no_surat_kuliah: formData.no_surat_kuliah || null,
        tgl_surat_kuliah: formData.tgl_surat_kuliah || null,
        semester_kuliah: formData.semester_kuliah || null,
        surat_ket_kuliah_url: formData.surat_ket_kuliah_url || null,
      });
      if (success) {
        setIsAddModalOpen(false);
        setEditingItem(null);
      }
    } else {
      const success = await onAddKeluarga(formData);
      if (success) {
        setIsAddModalOpen(false);
      }
    }
  };

  // Delete Action
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus anggota keluarga KP4: "${name}"?`)) {
      if (onDeleteKeluarga) {
        await onDeleteKeluarga(id);
      } else {
        await onUpdateTanggungan(id, false);
      }
    }
  };

  // Filter List
  const filteredList = keluargaList.filter((item) => {
    const pegawai = pegawaiMap.get(item.nip_pegawai);
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      item.nama_keluarga.toLowerCase().includes(searchLower) ||
      item.nip_pegawai.includes(searchLower) ||
      (pegawai?.nama_lengkap && pegawai.nama_lengkap.toLowerCase().includes(searchLower)) ||
      (item.nama_sekolah_pt && item.nama_sekolah_pt.toLowerCase().includes(searchLower));

    if (!matchSearch) return false;

    if (filterType === 'aktif') return item.status_tanggungan;
    if (filterType === 'anak_alert') {
      if (item.status_hubungan !== 'Anak' || !item.status_tanggungan) return false;
      const { years } = calculateAge(item.tanggal_lahir);
      return years >= 21;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-[#1E293B]">Pengelolaan Tunjangan KP4 Keluarga</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Validasi tunjangan anak & pasangan ASN Dikes. Anak usia 21-25 tahun wajib melampirkan Surat Keterangan Kuliah Aktif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-[#334155] px-3 py-2 rounded-lg outline-none font-semibold"
          >
            <option value="semua">Semua Tanggungan</option>
            <option value="anak_alert">🔴 Alert Anak &gt; 21 Thn (Butuh Suket)</option>
            <option value="aktif">Tanggungan Aktif</option>
          </select>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center space-x-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah KP4 Baru</span>
          </button>
        </div>
      </div>

      {/* DAFTAR UTAMA SEMUA ANGGOTA KELUARGA KP4 (TABEL + CRUD AKSI ADMIN) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
            DAFTAR ANGGOTA KELUARGA KP4 ({filteredList.length} ANGGOTA)
          </span>

          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama keluarga, NIP, PT/Sekolah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium text-sm text-[#1E293B]">Tidak ada data anggota keluarga KP4 yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Nama Anggota Keluarga & Usia</th>
                  <th className="p-3.5">Pegawai Orang Tua / Pasangan</th>
                  <th className="p-3.5">Hubungan & Tgl Lahir</th>
                  <th className="p-3.5">Informasi Suket Kuliah / PT</th>
                  <th className="p-3.5">Status Tanggungan</th>
                  <th className="p-3.5 text-right">Aksi Admin (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const pegawai = pegawaiMap.get(item.nip_pegawai);
                  const age = calculateAge(item.tanggal_lahir);
                  const isAnak = item.status_hubungan === 'Anak';
                  const isNeedsSuket = isAnak && age.years >= 21 && item.status_tanggungan;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Nama Keluarga */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#1E293B] text-sm">{item.nama_keluarga}</div>
                        <div className="text-[11px] text-blue-800 font-semibold mt-0.5">
                          Usia: {age.years} Thn {age.months} Bln
                        </div>
                      </td>

                      {/* Pegawai Orang Tua */}
                      <td className="p-3.5">
                        <div className="font-semibold text-[#334155]">{pegawai?.nama_lengkap || '-'}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">NIP: {item.nip_pegawai}</div>
                      </td>

                      {/* Hubungan & DOB */}
                      <td className="p-3.5">
                        <div className="font-semibold text-[#334155]">{item.status_hubungan}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {formatDateIndonesian(item.tanggal_lahir)}
                        </div>
                      </td>

                      {/* Suket Kuliah / PT */}
                      <td className="p-3.5">
                        {isAnak ? (
                          <div className="space-y-1">
                            {item.nama_sekolah_pt ? (
                              <div className="font-semibold text-slate-800">{item.nama_sekolah_pt}</div>
                            ) : (
                              <div className="text-slate-400 italic">Belum diset PT/Sekolah</div>
                            )}

                            {item.surat_ket_kuliah_url ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const pegawai = pegawaiMap.get(item.nip_pegawai) || null;
                                  const cleanNama = item.nama_keluarga.replace(/[^a-zA-Z0-9]/g, '_');
                                  const fileName = `Suket_Kuliah_${cleanNama}_${item.nip_pegawai}.pdf`;
                                  openDocumentInNewTab(item.surat_ket_kuliah_url, fileName, {
                                    pegawai,
                                    title: `Surat Keterangan Kuliah - ${item.nama_keluarga}`,
                                  });
                                }}
                                className="inline-flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer"
                                title="Buka Dokumen Suket Kuliah di Tab Baru"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Kuliah Aktif (Buka Berkas)</span>
                              </button>
                            ) : isNeedsSuket ? (
                              <span className="inline-flex items-center space-x-1 text-red-800 font-bold bg-red-100 px-2 py-0.5 rounded text-[10px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>🔴 Usia &gt; 21 Thn (Butuh Suket)</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium text-[11px]">Belum Ada Suket</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">-</span>
                        )}
                      </td>

                      {/* Status Tanggungan */}
                      <td className="p-3.5">
                        {item.status_tanggungan ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            AKTIF
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            NON-AKTIF
                          </span>
                        )}
                      </td>

                      {/* Aksi Admin CRUD */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Eye / Detail */}
                          <button
                            onClick={() => setViewingDetailItem(item)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Lihat Detail & Dokumen Suket"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors flex items-center space-x-1"
                            title="Edit KP4 & Upload Suket Kuliah"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden lg:inline">Edit</span>
                          </button>

                          {/* Status Toggle */}
                          {item.status_tanggungan ? (
                            <button
                              onClick={() => onUpdateTanggungan(item.id, false)}
                              className="bg-[#FEE2E2] hover:bg-red-200 text-[#991B1B] text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                              title="Non-Aktifkan Tanggungan"
                            >
                              Non-Aktif
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateTanggungan(item.id, true)}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                              title="Aktifkan Tanggungan"
                            >
                              Aktifkan
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setKeluargaToDelete(item)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Tanggungan KP4"
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
        )}
      </div>

      {/* MODAL TAMBAH & EDIT ANGGOTA KP4 (DENGAN UPLOAD & INFORMASI SUKET KULIAH) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-[#1E293B] text-base">
                  {editingItem ? 'Edit Data KP4 & Upload Suket Kuliah' : 'Tambah Anggota Keluarga KP4 Baru'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Pegawai ASN */}
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Pegawai ASN Orang Tua / Pasangan:*</label>
                <select
                  value={formData.nip_pegawai}
                  onChange={(e) => setFormData({ ...formData, nip_pegawai: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-[#334155]"
                  required
                >
                  {pegawaiList.map((p) => (
                    <option key={p.nip} value={p.nip}>
                      {p.nama_lengkap} (NIP: {p.nip}) - {p.unit_kerja}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Anggota Keluarga */}
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Nama Lengkap Anggota Keluarga:*</label>
                <input
                  type="text"
                  required
                  value={formData.nama_keluarga}
                  onChange={(e) => setFormData({ ...formData, nama_keluarga: e.target.value })}
                  placeholder="Nama lengkap anak / suami / istri"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              {/* Status Hubungan & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Status Hubungan:*</label>
                  <select
                    value={formData.status_hubungan}
                    onChange={(e) => setFormData({ ...formData, status_hubungan: e.target.value as StatusHubungan })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold"
                  >
                    <option value="Anak">Anak</option>
                    <option value="Suami">Suami</option>
                    <option value="Istri">Istri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">Tanggal Lahir:*</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  />
                  {formData.tanggal_lahir && (
                    <div className="text-[10px] text-blue-700 font-bold mt-1">
                      Usia: {calculateAge(formData.tanggal_lahir).years} Thn {calculateAge(formData.tanggal_lahir).months} Bln
                    </div>
                  )}
                </div>
              </div>

              {/* Status Tanggungan Toggle */}
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="status_tanggungan_check"
                  checked={formData.status_tanggungan}
                  onChange={(e) => setFormData({ ...formData, status_tanggungan: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded outline-none"
                />
                <label htmlFor="status_tanggungan_check" className="font-bold text-slate-800 cursor-pointer">
                  Status Tanggungan Aktif (Berhak Tunjangan KP4)
                </label>
              </div>

              {/* INFORMASI SURAT KETERANGAN (SUKET) KULIAH */}
              {formData.status_hubungan === 'Anak' && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-900 border-b border-blue-200 pb-2">
                    <GraduationCap className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      INFORMASI & UPLOAD SURAT KETERANGAN (SUKET) KULIAH
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">Nama Perguruan Tinggi / Sekolah:</label>
                      <input
                        type="text"
                        value={formData.nama_sekolah_pt}
                        onChange={(e) => setFormData({ ...formData, nama_sekolah_pt: e.target.value })}
                        placeholder="e.g. Universitas Mataram / Poltekkes"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">Semester / Tingkat Kuliah:</label>
                      <input
                        type="text"
                        value={formData.semester_kuliah}
                        onChange={(e) => setFormData({ ...formData, semester_kuliah: e.target.value })}
                        placeholder="e.g. Semester 4 / Tingkat II"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">Nomor Surat Keterangan Kuliah:</label>
                      <input
                        type="text"
                        value={formData.no_surat_kuliah}
                        onChange={(e) => setFormData({ ...formData, no_surat_kuliah: e.target.value })}
                        placeholder="e.g. 450/UN18/KM/2024"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1E293B] mb-1">Tanggal Surat Keterangan:</label>
                      <input
                        type="date"
                        value={formData.tgl_surat_kuliah}
                        onChange={(e) => setFormData({ ...formData, tgl_surat_kuliah: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Upload Suket File */}
                  <div>
                    <label className="block font-bold text-[#1E293B] mb-1">Upload File Dokumen Suket Kuliah (PDF/Gambar):</label>
                    <div className="flex items-center space-x-2">
                      <label className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white rounded-lg cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 truncate">
                          {formData.fileName ? formData.fileName : 'Pilih / Unggah Berkas Suket Kuliah'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {formData.surat_ket_kuliah_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, surat_ket_kuliah_url: null, fileName: '' })}
                          className="px-2.5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold"
                          title="Hapus berkas"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {formData.surat_ket_kuliah_url && (
                      <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dokumen Surat Keterangan Kuliah Siap Disimpan</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan KP4' : 'Simpan Anggota KP4'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL / PREVIEW SUKET KULIAH */}
      {viewingDetailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-[#1E293B] text-base">Detail Anggota KP4 & Suket Kuliah</h3>
              </div>
              <button onClick={() => setViewingDetailItem(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-sm font-bold text-slate-900">{viewingDetailItem.nama_keluarga}</div>
                <div className="text-slate-600">
                  Hubungan: <strong className="text-slate-800">{viewingDetailItem.status_hubungan}</strong> | Tgl Lahir: <strong className="text-slate-800">{formatDateIndonesian(viewingDetailItem.tanggal_lahir)}</strong>
                </div>
                <div className="text-slate-600">
                  Usia: <strong className="text-blue-900 font-bold">{calculateAge(viewingDetailItem.tanggal_lahir).years} Tahun {calculateAge(viewingDetailItem.tanggal_lahir).months} Bulan</strong>
                </div>
                <div className="text-slate-600">
                  Pegawai Orang Tua/Pasangan: <strong className="text-slate-800">{pegawaiMap.get(viewingDetailItem.nip_pegawai)?.nama_lengkap} (NIP: {viewingDetailItem.nip_pegawai})</strong>
                </div>
              </div>

              {/* Suket Detail */}
              <div className="p-3.5 bg-blue-50/70 rounded-lg border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 flex items-center space-x-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <span>DOKUMEN SURAT KETERANGAN KULIAH</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Perguruan Tinggi / Sekolah:</span>
                    <strong className="text-slate-900">{viewingDetailItem.nama_sekolah_pt || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Semester / Tingkat:</span>
                    <strong className="text-slate-900">{viewingDetailItem.semester_kuliah || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">No. Surat Kuliah:</span>
                    <strong className="text-slate-900 font-mono">{viewingDetailItem.no_surat_kuliah || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tgl. Surat Kuliah:</span>
                    <strong className="text-slate-900">{viewingDetailItem.tgl_surat_kuliah ? formatDateIndonesian(viewingDetailItem.tgl_surat_kuliah) : '-'}</strong>
                  </div>
                </div>

                {viewingDetailItem.surat_ket_kuliah_url ? (
                  <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Berkas Terlampir</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const pegawai = pegawaiMap.get(viewingDetailItem.nip_pegawai) || null;
                        const cleanNama = viewingDetailItem.nama_keluarga.replace(/[^a-zA-Z0-9]/g, '_');
                        const fileName = `Suket_Kuliah_${cleanNama}_${viewingDetailItem.nip_pegawai}.pdf`;
                        openDocumentInNewTab(viewingDetailItem.surat_ket_kuliah_url, fileName, {
                          pegawai,
                          title: `Surat Keterangan Kuliah - ${viewingDetailItem.nama_keluarga}`,
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center space-x-1 transition-colors cursor-pointer text-xs"
                      title="Buka Dokumen di Tab Baru"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Buka di Tab Baru</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 p-2 bg-amber-100 text-amber-900 rounded font-semibold text-[11px] flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Belum ada file dokumen Suket Kuliah yang diunggah.</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingDetailItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!keluargaToDelete}
        title="Konfirmasi Hapus Tanggungan KP4"
        itemName={
          keluargaToDelete
            ? `${keluargaToDelete.nama_keluarga} (${keluargaToDelete.status_hubungan} dari ${
                pegawaiMap.get(keluargaToDelete.nip_pegawai)?.nama_lengkap || keluargaToDelete.nip_pegawai
              })`
            : ''
        }
        message="Apakah Anda yakin ingin menghapus data anggota keluarga ini dari tanggungan KP4?"
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        onClose={() => setKeluargaToDelete(null)}
        onConfirm={async () => {
          if (keluargaToDelete) {
            if (onDeleteKeluarga) {
              await onDeleteKeluarga(keluargaToDelete.id);
            } else {
              await onUpdateTanggungan(keluargaToDelete.id, false);
            }
            setKeluargaToDelete(null);
          }
        }}
      />
    </div>
  );
};
