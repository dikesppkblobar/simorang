import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  Users,
  Clock,
  Baby,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Pegawai, RiwayatSK, KeluargaKP4 } from '../types';

interface EksporLaporanViewProps {
  pegawaiList: Pegawai[];
  skList: RiwayatSK[];
  keluargaList: KeluargaKP4[];
}

export const EksporLaporanView: React.FC<EksporLaporanViewProps> = ({
  pegawaiList,
  skList,
  keluargaList,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const getTodayFormatted = () => new Date().toISOString().slice(0, 10);

  // 1. Export Master Pegawai to XLSX
  const exportPegawaiToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const data = pegawaiList.map((p, idx) => ({
          'No': idx + 1,
          'NIP/NI PPPK': p.nip || p.ni_pppk || '-',
          'Nama Lengkap': p.nama_lengkap,
          'Unit Kerja': p.unit_kerja,
          'Status Kepegawaian': p.status_kepegawaian,
          'Jenis Jabatan': p.jenis_jabatan,
          'Jabatan Spesifik': p.jabatan_spesifik,
          'Golongan / Ruang': p.golongan || '-',
          'TMT CPNS': p.tmt_cpns || '-',
          'TMT PNS/PPPK': p.tmt_pns_pppk || '-',
          'Status UKOM': p.status_ukom ? 'LULUS (Memenuhi)' : 'BELUM UKOM',
          'Pendidikan Terakhir': p.pendidikan_terakhir || '-',
          'MKG (Tahun)': p.mkg_tahun ?? 0,
          'MKG (Bulan)': p.mkg_bulan ?? 0,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Pegawai');

        // Auto column width
        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 22 }, // NIP
          { wch: 30 }, // Nama
          { wch: 35 }, // Unit
          { wch: 18 }, // Status
          { wch: 18 }, // Jenis Jabatan
          { wch: 28 }, // Jabatan Spesifik
          { wch: 15 }, // Golongan
          { wch: 14 }, // TMT CPNS
          { wch: 14 }, // TMT PNS
          { wch: 18 }, // Status UKOM
          { wch: 22 }, // Pendidikan
          { wch: 12 }, // MKG Thn
          { wch: 12 }, // MKG Bln
        ];

        XLSX.writeFile(workbook, `Rekap_Master_Pegawai_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting Pegawai XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 2. Export Riwayat SK to XLSX
  const exportSkToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const data = skList.map((s, idx) => ({
          'No': idx + 1,
          'ID SK': s.id,
          'NIP Pegawai': s.nip_pegawai,
          'Jenis SK': s.jenis_sk,
          'Nomor SK': s.nomor_sk,
          'TMT Berlaku': s.tmt_berlaku,
          'Tanggal Penerbitan': s.created_at || '-',
          'Keterangan / Deskripsi': s.keterangan || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat SK');

        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 12 }, // ID
          { wch: 22 }, // NIP
          { wch: 20 }, // Jenis
          { wch: 28 }, // Nomor
          { wch: 14 }, // TMT
          { wch: 18 }, // Tanggal
          { wch: 35 }, // Keterangan
        ];

        XLSX.writeFile(workbook, `Riwayat_SK_Kepegawaian_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting SK XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 3. Export KP4 to XLSX
  const exportKp4ToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const data = keluargaList.map((k, idx) => ({
          'No': idx + 1,
          'ID Tanggungan': k.id,
          'NIP Pegawai': k.nip_pegawai,
          'Nama Anggota Keluarga': k.nama_keluarga,
          'Status Hubungan': k.status_hubungan,
          'Tanggal Lahir': k.tanggal_lahir,
          'Pekerjaan / Status': k.pekerjaan || '-',
          'Status Tunjangan': k.status_tanggungan ? 'AKTIF' : 'NON-AKTIF',
          'Nama Sekolah / Perguruan Tinggi': k.nama_sekolah_pt || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'KP4 Tunjangan');

        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 14 }, // ID
          { wch: 22 }, // NIP
          { wch: 30 }, // Nama Keluarga
          { wch: 18 }, // Hubungan
          { wch: 14 }, // Tanggal Lahir
          { wch: 20 }, // Pekerjaan
          { wch: 18 }, // Status
          { wch: 30 }, // Sekolah
        ];

        XLSX.writeFile(workbook, `KP4_Tunjangan_Keluarga_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting KP4 XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 4. Export Combined All-In-One Workbook
  const exportAllToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Master Pegawai
        const dataPegawai = pegawaiList.map((p, idx) => ({
          'No': idx + 1,
          'NIP/NI PPPK': p.nip || p.ni_pppk || '-',
          'Nama Lengkap': p.nama_lengkap,
          'Unit Kerja': p.unit_kerja,
          'Status Kepegawaian': p.status_kepegawaian,
          'Jenis Jabatan': p.jenis_jabatan,
          'Jabatan Spesifik': p.jabatan_spesifik,
          'Golongan': p.golongan || '-',
          'TMT CPNS': p.tmt_cpns || '-',
          'Status UKOM': p.status_ukom ? 'LULUS' : 'BELUM UKOM',
          'Pendidikan Terakhir': p.pendidikan_terakhir || '-',
        }));
        const wsPegawai = XLSX.utils.json_to_sheet(dataPegawai);
        XLSX.utils.book_append_sheet(workbook, wsPegawai, 'Master Pegawai');

        // Sheet 2: Riwayat SK
        const dataSK = skList.map((s, idx) => ({
          'No': idx + 1,
          'NIP Pegawai': s.nip_pegawai,
          'Jenis SK': s.jenis_sk,
          'Nomor SK': s.nomor_sk,
          'TMT Berlaku': s.tmt_berlaku,
          'Keterangan': s.keterangan || '-',
        }));
        const wsSK = XLSX.utils.json_to_sheet(dataSK);
        XLSX.utils.book_append_sheet(workbook, wsSK, 'Riwayat SK');

        // Sheet 3: KP4 Tunjangan
        const dataKP4 = keluargaList.map((k, idx) => ({
          'No': idx + 1,
          'NIP Pegawai': k.nip_pegawai,
          'Nama Anggota Keluarga': k.nama_keluarga,
          'Status Hubungan': k.status_hubungi || k.status_hubungan,
          'Tanggal Lahir': k.tanggal_lahir,
          'Status Tunjangan': k.status_tanggungan ? 'AKTIF' : 'NON-AKTIF',
          'Sekolah / PT': k.nama_sekolah_pt || '-',
        }));
        const wsKP4 = XLSX.utils.json_to_sheet(dataKP4);
        XLSX.utils.book_append_sheet(workbook, wsKP4, 'Tunjangan KP4');

        XLSX.writeFile(workbook, `Laporan_Lengkap_SIMORANG_DINKES_PPKB_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting Combined XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ekspor Laporan Spreadsheet (.XLSX)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unduh rekapitulasi data SIMORANG DINKES-PPKB ke format file Microsoft Excel (.XLSX) resmi untuk keperluan pelaporan BKN, BKPSDM, dan Audit BPK.
          </p>
        </div>

        <button
          onClick={exportAllToXLSX}
          disabled={isExporting}
          className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span>{isExporting ? 'Memproses Excel...' : 'Ekspor Paket Lengkap 3 Sheet (.XLSX)'}</span>
        </button>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Data Pegawai */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-colors">
          <div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Rekap Master Data Pegawai</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Mencakup NIP, Nama Lengkap, Jabatan, Unit Kerja, TMT CPNS, Status UKOM, Masa Kerja, dan Pendidikan.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold mb-6">
              Total Data: {pegawaiList.length} Pegawai
            </div>
          </div>

          <button
            onClick={exportPegawaiToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Master Pegawai (.XLSX)</span>
          </button>
        </div>

        {/* Card 2: Riwayat SK */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Laporan Riwayat SK Digital</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Rekap seluruh SK KGB, Kenaikan Pangkat, Mutasi, dan Izin Belajar terdaftar di sistem.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold mb-6">
              Total Data: {skList.length} SK Terdaftar
            </div>
          </div>

          <button
            onClick={exportSkToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Riwayat SK (.XLSX)</span>
          </button>
        </div>

        {/* Card 3: KP4 Tunjangan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-purple-400 transition-colors">
          <div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 w-fit mb-4">
              <Baby className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Laporan Tunjangan KP4</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Rekap seluruh tanggungan keluarga, anak usia kuliah, dan status tunjangan aktif/non-aktif.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold mb-6">
              Total Data: {keluargaList.length} Tanggungan KP4
            </div>
          </div>

          <button
            onClick={exportKp4ToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Tunjangan KP4 (.XLSX)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

