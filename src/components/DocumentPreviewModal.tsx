import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Printer,
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  FileCheck,
  Eye,
  Award,
} from 'lucide-react';
import { Pegawai, RiwayatSK, JenisSK } from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';
import { base64ToBlobUrl, downloadDocumentFile, openDocumentInNewTab, getFileTypeInfo } from '../utils/fileHelper';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  jenisSk?: JenisSK | string;
  nomorSk?: string;
  tmtBerlaku?: string;
  keterangan?: string;
  fileUrl?: string | null;
  pegawai?: Pegawai | null;
  createdAt?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  jenisSk = 'KGB',
  nomorSk = '',
  tmtBerlaku = '',
  keterangan = '',
  fileUrl = null,
  pegawai = null,
  createdAt = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'embed' | 'official_sheet'>('embed');
  const [hasEmbedError, setHasEmbedError] = useState<boolean>(false);

  const fileType = useMemo(() => getFileTypeInfo(fileUrl), [fileUrl]);

  // Clean filename for downloading
  const sanitizedFileName = useMemo(() => {
    const cleanJenis = (jenisSk || 'DOKUMEN').toString().replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNomor = (nomorSk || 'SK').replace(/[^a-zA-Z0-9]/g, '_');
    const nip = pegawai?.nip || 'PEGAWAI';
    return `${cleanJenis}_${nip}_${cleanNomor}.pdf`;
  }, [jenisSk, nomorSk, pegawai]);

  // Generate safe blob URL for preview
  useEffect(() => {
    if (!isOpen) {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl('');
      setHasEmbedError(false);
      setZoomLevel(100);
      return;
    }

    if (fileUrl) {
      if (fileUrl.startsWith('data:')) {
        const url = base64ToBlobUrl(fileUrl);
        setBlobUrl(url);
      } else {
        setBlobUrl(fileUrl);
      }
    } else {
      setBlobUrl('');
      setViewMode('official_sheet');
    }

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadDocumentFile(fileUrl || blobUrl, sanitizedFileName);
  };

  const handleOpenNewTab = () => {
    openDocumentInNewTab(fileUrl || blobUrl, sanitizedFileName);
  };

  const handlePrint = () => {
    window.print();
  };

  // Human readable title for Jenis SK
  const getJenisSkLabel = (jenis: string) => {
    switch (jenis) {
      case 'KGB':
        return 'Surat Pemberitahuan Kenaikan Gaji Berkala (KGB)';
      case 'Pangkat':
        return 'Surat Keputusan Kenaikan Pangkat ASN';
      case 'Jafung_PAK':
        return 'Surat Keputusan Pengangkatan Jabatan Fungsional / Penetapan Angka Kredit (PAK)';
      case 'UKOM':
        return 'Sertifikat Kelulusan Uji Kompetensi Kenaikan Jenjang (UKKJ)';
      case 'STLUD':
        return 'Surat Tanda Lulus Ujian Dinas (STLUD)';
      case 'Izin Belajar':
        return 'Surat Keputusan Izin / Tugas Belajar';
      case 'Pencantuman_Gelar':
        return 'Surat Keputusan Pencantuman Gelar Akademik';
      case 'Mutasi':
        return 'Surat Keputusan Mutasi & Penempatan Tugas';
      case 'KP4':
        return 'Surat Keterangan Hak Tunjangan Keluarga (KP4)';
      case 'Pensiun':
        return 'Surat Keputusan Pensiun / DPCP';
      default:
        return `Dokumen ${jenis}`;
    }
  };

  return (
    <div
      id="modal-document-preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  {jenisSk || 'BERKAS ARSIP'}
                </span>
                <span className="text-slate-400 text-xs font-mono truncate">
                  No: {nomorSk || 'Belum Bernomor'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {title || getJenisSkLabel(jenisSk)}
              </h3>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('embed')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                  viewMode === 'embed'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dokumen PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('official_sheet')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                  viewMode === 'official_sheet'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Lembar SK Resmi</span>
              </button>
            </div>

            {/* Action Buttons */}
            <button
              id="btn-preview-download"
              onClick={handleDownload}
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border border-slate-700"
              title="Unduh File PDF"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>

            <button
              id="btn-preview-newtab"
              onClick={handleOpenNewTab}
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border border-slate-700"
              title="Buka Dokumen di Tab Baru"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Buka Tab Baru</span>
            </button>

            <button
              id="btn-preview-print"
              onClick={handlePrint}
              className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors items-center space-x-1.5 border border-slate-700"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak</span>
            </button>

            <button
              id="btn-close-document-preview"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-colors ml-1"
              title="Tutup Pratinjau (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METADATA STRIP */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            {pegawai && (
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Pegawai:</span>
                <strong className="text-slate-900">{pegawai.nama_lengkap}</strong>
                <span className="text-slate-500 font-mono">({pegawai.nip})</span>
              </div>
            )}
            {tmtBerlaku && (
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-400">TMT Berlaku:</span>
                <strong className="text-slate-800">{formatDateIndonesian(tmtBerlaku)}</strong>
              </div>
            )}
            {pegawai?.unit_kerja && (
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-700 truncate max-w-xs">{pegawai.unit_kerja}</span>
              </div>
            )}
          </div>

          {/* Zoom controls for Embed */}
          {viewMode === 'embed' && (
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-slate-700 min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* MAIN VIEWER BODY */}
        <div className="flex-1 bg-slate-100 overflow-auto p-3 sm:p-6 flex items-center justify-center relative">
          {viewMode === 'embed' && blobUrl && !hasEmbedError ? (
            <div
              className="w-full h-full flex items-center justify-center transition-transform origin-top"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {fileType.isImage ? (
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 max-h-full flex items-center justify-center">
                  <img
                    src={blobUrl}
                    alt={title}
                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-sm"
                    onError={() => setHasEmbedError(true)}
                  />
                </div>
              ) : (
                <iframe
                  src={blobUrl}
                  title={title}
                  className="w-full h-full min-h-[600px] bg-white rounded-xl shadow-lg border border-slate-300"
                  onError={() => setHasEmbedError(true)}
                />
              )}
            </div>
          ) : (
            /* OFFICIAL DIGITAL SK SHEET VIEW */
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 text-slate-800 my-auto">
              {/* KOP SURAT RESMI */}
              <div className="text-center border-b-2 border-slate-900 pb-4 relative">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-amber-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-900 font-serif">
                      Pemerintah Kabupaten Lombok Barat
                    </h2>
                    <h1 className="text-base sm:text-xl font-extrabold uppercase tracking-wider text-blue-900 font-serif">
                      Dinas Kesehatan dan PPKB
                    </h1>
                    <p className="text-[10.5px] text-slate-600">
                      Jalan Soekarno - Hatta, Giri Menang, Gerung, Kabupaten Lombok Barat, NTB • Kode Pos: 83363
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Website: dikes.lombokbaratkab.go.id • SIMPEG DIKES PPKB Kepegawaian Digital
                    </p>
                  </div>
                </div>
              </div>

              {/* JUDUL DOKUMEN SK */}
              <div className="text-center space-y-1">
                <span className="text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200">
                  {getJenisSkLabel(jenisSk)}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 font-serif uppercase pt-2">
                  SURAT KEPUTUSAN KEPALA DINAS KESEHATAN KABUPATEN LOMBOK BARAT
                </h3>
                <p className="font-mono text-xs font-bold text-slate-800">
                  NOMOR: {nomorSk || '821.1/SK-SIMPEG/DK-PPKB/2026'}
                </p>
                <p className="text-[11px] text-slate-500">
                  TENTANG: {keterangan || `PENETAPAN ${jenisSk.toUpperCase()} PEGAWAI APARATUR SIPIL NEGARA`}
                </p>
              </div>

              {/* DETAIL PEGAWAI YANG BERSANGKUTAN */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
                  <span>IDENTITAS PEGAWAI:</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Terdaftar di SIMPEG DIKES PPKB
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Nama Lengkap:</span>
                    <strong className="text-slate-900 text-sm font-serif">
                      {pegawai?.nama_lengkap || 'Pegawai Terkait'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">NIP / Nomor Induk:</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {pegawai?.nip || '19XXXXXXXXXXXXXX'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Pangkat / Golongan Ruang:</span>
                    <span className="text-slate-900 font-semibold">
                      {pegawai?.nama_pangkat ? `${pegawai.nama_pangkat} (${pegawai.golongan_pangkat})` : 'Penata Muda (III/a)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Jabatan:</span>
                    <span className="text-slate-900 font-semibold">
                      {pegawai?.jabatan || 'Aparatur Sipil Negara (ASN)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Unit Kerja Penempatan:</span>
                    <span className="text-slate-900 font-semibold">
                      {pegawai?.unit_kerja || 'Dinas Kesehatan Kabupaten Lombok Barat'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Terhitung Mulai Tanggal (TMT):</span>
                    <strong className="text-blue-900 font-semibold">
                      {tmtBerlaku ? formatDateIndonesian(tmtBerlaku) : '01 Januari 2026'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* CATATAN PENGESAHAN ELEKTRONIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-3 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full border border-dashed border-slate-400 bg-slate-900 rounded flex flex-col items-center justify-center text-white p-1 text-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-[7px] font-mono tracking-tighter">SIMPEG QR</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-800">Verifikasi Dokumen Digital</p>
                    <p>Dokumen ini sah dan diterbitkan secara digital melalui Sistem Monitoring Pegawai Dinas Kesehatan PPKB (SIMPEG DIKES PPKB) Kab. Lombok Barat.</p>
                  </div>
                </div>

                <div className="text-right text-xs space-y-1">
                  <p className="text-slate-600">Ditetapkan di: Giri Menang, Gerung</p>
                  <p className="text-slate-600">
                    Pada Tanggal:{' '}
                    {createdAt
                      ? formatDateIndonesian(createdAt.slice(0, 10))
                      : formatDateIndonesian(new Date().toISOString().slice(0, 10))}
                  </p>
                  <p className="font-bold text-slate-900 pt-2 font-serif">
                    KEPALA DINAS KESEHATAN KAB. LOMBOK BARAT
                  </p>
                  <div className="py-2">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] rounded-full border border-emerald-300">
                      ✓ Ditandatangani Secara Elektronik (TTE)
                    </span>
                  </div>
                  <p className="font-bold text-slate-950 underline font-serif">
                    ARIF SURYAWIRAWAN, S.Si., Apt., MPH
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    NIP. 19780512 200501 1 008
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">
              Arsip Digital Resmi SIMPEG DIKES PPKB Kab. Lombok Barat
            </span>
            <span className="sm:hidden text-[11px]">Arsip Digital Terverifikasi</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#004B87] hover:bg-[#003663] text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
