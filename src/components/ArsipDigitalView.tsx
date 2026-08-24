import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Search,
  FileUp,
  Download,
  Filter,
  CheckCircle2,
  X,
  FileCheck,
  Clock,
  History,
  Layers,
  Award,
  Briefcase,
  BadgeCheck,
  GraduationCap,
  Baby,
  Calendar,
  Building2,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { RiwayatSK, Pegawai, JenisSK, UnitKerjaItem } from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';

interface ArsipDigitalViewProps {
  skList: RiwayatSK[];
  pegawaiList: Pegawai[];
  unitsList?: UnitKerjaItem[];
  onOpenUploadSkModal: (nip?: string, defaultJenisSk?: JenisSK) => void;
}

export const ArsipDigitalView: React.FC<ArsipDigitalViewProps> = ({
  skList,
  pegawaiList,
  unitsList = [],
  onOpenUploadSkModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenisSk, setFilterJenisSk] = useState<string>('Semua');
  const [filterUnitKerja, setFilterUnitKerja] = useState<string>('Semua');
  const [selectedPegawaiNip, setSelectedPegawaiNip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'per_pegawai'>('timeline');

  const pegawaiMap = new Map<string, Pegawai>(pegawaiList.map((p) => [p.nip, p]));

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

  // Filtered SK list
  const filteredSk = sortedSkList.filter((sk) => {
    const pegawai = pegawaiMap.get(sk.nip_pegawai);

    if (filterJenisSk !== 'Semua' && sk.jenis_sk !== filterJenisSk) return false;
    if (filterUnitKerja !== 'Semua' && pegawai?.unit_kerja !== filterUnitKerja) return false;
    if (selectedPegawaiNip && sk.nip_pegawai !== selectedPegawaiNip) return false;

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
        if (filterJenisSk !== 'Semua' && sk.jenis_sk !== filterJenisSk) return false;
        return true;
      });
      return { pegawai, docs };
    })
    .filter((group) => group.docs.length > 0 || searchTerm.trim() === '');

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

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Arsip Digital Kepegawaian & Histori SK</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Penyimpanan digital SK Pangkat, KGB, Jafung/PAK, UKKJ, Gelar, KP4 & Pensiun.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenUploadSkModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          <span>+ Unggah Berkas Baru</span>
        </button>
      </div>

      {/* Quick Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Semua Berkas', type: 'Semua', count: skList.length, color: 'border-slate-300 text-slate-700 bg-white' },
          { label: 'SK Kenaikan Pangkat', type: 'Pangkat', count: skList.filter((s) => s.jenis_sk === 'Pangkat').length, color: 'border-amber-300 text-amber-800 bg-amber-50/50' },
          { label: 'SK KGB Berkala', type: 'KGB', count: skList.filter((s) => s.jenis_sk === 'KGB').length, color: 'border-emerald-300 text-emerald-800 bg-emerald-50/50' },
          { label: 'SK Jafung & PAK', type: 'Jafung_PAK', count: skList.filter((s) => s.jenis_sk === 'Jafung_PAK').length, color: 'border-blue-300 text-blue-800 bg-blue-50/50' },
          { label: 'Ukom & Ujian Dinas', type: 'UKOM', count: skList.filter((s) => s.jenis_sk === 'UKOM' || s.jenis_sk === 'STLUD').length, color: 'border-indigo-300 text-indigo-800 bg-indigo-50/50' },
          { label: 'Izin Belajar & Gelar', type: 'Izin Belajar', count: skList.filter((s) => s.jenis_sk === 'Izin Belajar' || s.jenis_sk === 'Pencantuman_Gelar').length, color: 'border-purple-300 text-purple-800 bg-purple-50/50' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setFilterJenisSk(item.type)}
            className={`p-3 rounded-xl border text-left transition-all ${item.color} ${
              filterJenisSk === item.type ? 'ring-2 ring-blue-500 shadow-sm font-extrabold' : 'hover:opacity-90'
            }`}
          >
            <div className="text-lg font-black">{item.count}</div>
            <div className="text-[11px] font-semibold opacity-80 leading-tight">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Search, Filter, and View Mode Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari Nomor SK, NIP, Nama Pegawai, atau Unit Kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium text-slate-800"
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterJenisSk}
              onChange={(e) => setFilterJenisSk(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-3 py-2 rounded-xl outline-none font-bold"
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

            <select
              value={filterUnitKerja}
              onChange={(e) => setFilterUnitKerja(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-3 py-2 rounded-xl outline-none font-medium"
            >
              <option value="Semua">Semua Unit Kerja Satker</option>
              {unitList.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 ml-auto md:ml-0">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Linimasa Dokumen
              </button>
              <button
                onClick={() => setViewMode('per_pegawai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'per_pegawai'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Folder Per Pegawai
              </button>
            </div>
          </div>
        </div>

        {selectedPegawaiNip && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900">
            <span>
              Menampilkan khusus berkas pegawai: <strong>{pegawaiMap.get(selectedPegawaiNip)?.nama_lengkap}</strong> (NIP: {selectedPegawaiNip})
            </span>
            <button
              onClick={() => setSelectedPegawaiNip(null)}
              className="text-blue-700 hover:underline font-bold"
            >
              Reset Filter Pegawai
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'timeline' ? (
        /* Timeline List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ARSIP DOKUMEN DIGITAL ({filteredSk.length} DOKUMEN TERDAFTAR)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Terurut Berkas Terbaru di Atas
            </span>
          </div>

          {filteredSk.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">Tidak ada dokumen SK / berkas yang sesuai pencarian.</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter kategori dokumen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-bold">
                    <th className="p-3.5">Pegawai ASN</th>
                    <th className="p-3.5">Kategori & Nomor SK</th>
                    <th className="p-3.5">TMT / Tgl SK</th>
                    <th className="p-3.5">Status Versi Arsip</th>
                    <th className="p-3.5">Keterangan / Perihal</th>
                    <th className="p-3.5 text-right">Aksi Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSk.map((sk) => {
                    const pegawai = pegawaiMap.get(sk.nip_pegawai);
                    const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;
                    const jenisMeta = getJenisLabel(sk.jenis_sk);

                    return (
                      <tr key={sk.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedPegawaiNip(sk.nip_pegawai)}
                            className="text-left group cursor-pointer"
                          >
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {pegawai?.nama_lengkap || '-'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              NIP: {sk.nip_pegawai} &bull; {pegawai?.unit_kerja}
                            </div>
                          </button>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-[10px] border mb-1 ${jenisMeta.bg}`}>
                            {jenisMeta.name}
                          </span>
                          <div className="font-mono font-bold text-slate-800">{sk.nomor_sk}</div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-800">
                          {formatDateIndonesian(sk.tmt_berlaku)}
                        </td>

                        <td className="p-3.5">
                          {isLatest ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>VERSI TERBARU (AKTIF)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 border border-slate-300 font-medium px-2.5 py-0.5 rounded-full text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>HISTORIS (ARSIP LAMA)</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {sk.keterangan || '-'}
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          {sk.file_url ? (
                            <a
                              href={sk.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Buka File</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => onOpenUploadSkModal(sk.nip_pegawai, sk.jenis_sk)}
                              className="inline-flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>Unggah</span>
                            </button>
                          )}
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
        /* Per Pegawai Folder Group View */
        <div className="space-y-4">
          {pegawaiSkGroups.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">Tidak ada folder pegawai yang cocok.</p>
            </div>
          ) : (
            pegawaiSkGroups.map(({ pegawai, docs }) => (
              <div
                key={pegawai.nip}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                {/* Employee Header Bar */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                      {pegawai.nama_lengkap.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <span>{pegawai.nama_lengkap}</span>
                        <span className="text-xs font-normal text-slate-500 font-mono">
                          (NIP: {pegawai.nip})
                        </span>
                      </h3>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700">{pegawai.jabatan_spesifik}</span>
                        <span>&bull;</span>
                        <span>{pegawai.unit_kerja}</span>
                        <span>&bull;</span>
                        <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.2 rounded text-[10px]">
                          {pegawai.status_kepegawaian} {pegawai.golongan_pangkat || ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenUploadSkModal(pegawai.nip)}
                    className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Unggah Berkas Baru</span>
                  </button>
                </div>

                {/* Document List for this employee */}
                <div className="p-4">
                  {docs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Belum ada dokumen SK yang diunggah untuk pegawai ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {docs.map((sk) => {
                        const isLatest = latestSkMap.get(`${sk.nip_pegawai}_${sk.jenis_sk}`) === sk.id;
                        const jenisMeta = getJenisLabel(sk.jenis_sk);

                        return (
                          <div
                            key={sk.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isLatest
                                ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                                : 'bg-slate-50/50 border-slate-200 opacity-90'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${jenisMeta.bg}`}>
                                {jenisMeta.name}
                              </span>
                              {isLatest ? (
                                <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-[9px]">
                                  TERBARU (AKTIF)
                                </span>
                              ) : (
                                <span className="bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded text-[9px]">
                                  ARSIP HISTORIS
                                </span>
                              )}
                            </div>

                            <div className="font-mono font-bold text-xs text-slate-800 truncate">
                              {sk.nomor_sk}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              TMT: <strong className="text-slate-700">{formatDateIndonesian(sk.tmt_berlaku)}</strong>
                            </div>

                            {sk.keterangan && (
                              <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 bg-white/60 p-1.5 rounded border border-slate-100">
                                {sk.keterangan}
                              </p>
                            )}

                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400">
                                {new Date(sk.created_at).toLocaleDateString('id-ID')}
                              </span>
                              {sk.file_url ? (
                                <a
                                  href={sk.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
                                >
                                  <span>Buka Berkas</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Tanpa File</span>
                              )}
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
    </div>
  );
};
