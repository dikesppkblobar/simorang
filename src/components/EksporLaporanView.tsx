import React, { useState, useMemo } from 'react';
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
  Award,
  Briefcase,
  Search,
  Filter,
  Check,
  Building2,
  Sparkles,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Pegawai, RiwayatSK, KeluargaKP4 } from '../types';
import {
  buildComprehensivePegawaiReport,
  EmployeeExportRow,
} from '../services/reportExportService';
import { formatDateIndonesian } from '../services/dateCalculator';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('Semua Unit');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [activePreviewTab, setActivePreviewTab] = useState<'semua' | 'pangkat' | 'jafung' | 'kgb' | 'kp4'>('semua');

  const getTodayFormatted = () => new Date().toISOString().slice(0, 10);

  // Extract unique units for filter
  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    pegawaiList.forEach((p) => {
      if (p.unit_kerja) set.add(p.unit_kerja);
    });
    return ['Semua Unit', ...Array.from(set).sort()];
  }, [pegawaiList]);

  // Compute Full Dataset with KP4, Pangkat Sebelumnya/Selanjutnya, Jafung Sebelumnya/Selanjutnya, Masa Kerja, KGB Sebelumnya/Selanjutnya
  const fullExportData: EmployeeExportRow[] = useMemo(() => {
    return buildComprehensivePegawaiReport(pegawaiList, skList, keluargaList);
  }, [pegawaiList, skList, keluargaList]);

  // Filtered dataset for preview
  const filteredData = useMemo(() => {
    return fullExportData.filter((item) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.includes(searchTerm) ||
        item.jabatanSpesifik.toLowerCase().includes(searchTerm.toLowerCase());

      const matchUnit = selectedUnit === 'Semua Unit' || item.unitKerja === selectedUnit;
      const matchStatus = selectedStatus === 'Semua Status' || item.statusKepegawaian === selectedStatus;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [fullExportData, searchTerm, selectedUnit, selectedStatus]);

  // 1. Export Comprehensive Master SIMPEG with All Fields to XLSX
  const exportComprehensiveToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const rows = filteredData.map((p, idx) => ({
          'No': idx + 1,
          'NIP / NI PPPK': p.nip,
          'NIK': p.nik,
          'Nama Lengkap': p.namaLengkap,
          'Unit Kerja': p.unitKerja,
          'Status Kepegawaian': p.statusKepegawaian,
          'Jenis Jabatan': p.jenisJabatan,
          'Jabatan Spesifik': p.jabatanSpesifik,

          // Pangkat Columns
          'Golongan Saat Ini': p.golonganSekarang,
          'Nama Pangkat Saat Ini': p.namaPangkatSekarang,
          'TMT Pangkat Terakhir': p.tmtPangkatSekarang,
          'Pangkat Sebelumnya': p.pangkatSebelumnya,
          'TMT Pangkat Sebelumnya': p.tmtPangkatSebelumnya,
          'Proyeksi Pangkat Selanjutnya': p.proyeksiPangkatSelanjutnya,
          'TMT Proyeksi Pangkat Selanjutnya': p.tmtProyeksiPangkatSelanjutnya,

          // Jafung Columns
          'Jenjang Jafung Saat Ini': p.jenjangJafungSekarang,
          'Jenjang Jafung Sebelumnya': p.jenjangJafungSebelumnya,
          'Proyeksi Jenjang Selanjutnya': p.proyeksiJenjangJafungSelanjutnya,
          'Total Angka Kredit Kumulatif': p.angkaKreditKumulatif,
          'Status UKOM / UKKJ': p.statusUkom,

          // Masa Kerja
          'Masa Kerja Golongan (MKG)': p.masaKerjaGolongan,
          'MKG (Tahun)': p.masaKerjaTahun,
          'MKG (Bulan)': p.masaKerjaBulan,
          'TMT CPNS / Awal Pengangkatan': p.tmtCpnsPengangkatan,

          // KGB Columns
          'TMT KGB Sebelumnya': p.tmtKgbSebelumnya,
          'TMT KGB Terakhir': p.tmtKgbTerakhir,
          'TMT KGB Selanjutnya (Jatuh Tempo)': p.tmtKgbSelanjutnya,
          'Status Jatuh Tempo KGB': p.statusJatuhTempoKgb,

          // KP4 Tunjangan Keluarga Columns
          'Status Tunjangan KP4': p.statusTunjanganKp4,
          'Jumlah Tanggungan': p.jumlahTanggunganKp4,
          'Jumlah Pasangan': p.jumlahPasanganKp4,
          'Jumlah Anak': p.jumlahAnakKp4,
          'Rincian Anggota Keluarga KP4': p.daftarNamaTanggunganKp4,

          // Pendidikan & Kontak
          'Pendidikan Terakhir': p.pendidikanTerakhir,
          'Nama Universitas / Institusi PT': p.namaUniversitas,
          'Program Studi': p.programStudi,
          'No. WhatsApp': p.noWhatsapp,
          'Legalitas STR & SIP': p.legalitasStrSip,
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Lengkap SIMORANG');

        // Professional Column Widths
        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 22 }, // NIP
          { wch: 20 }, // NIK
          { wch: 30 }, // Nama
          { wch: 32 }, // Unit
          { wch: 18 }, // Status
          { wch: 16 }, // Jenis Jabatan
          { wch: 28 }, // Jabatan Spesifik

          // Pangkat
          { wch: 16 }, // Gol Saat Ini
          { wch: 22 }, // Nama Pangkat
          { wch: 18 }, // TMT Pangkat
          { wch: 24 }, // Pangkat Sblm
          { wch: 20 }, // TMT Pangkat Sblm
          { wch: 28 }, // Pangkat Sljt
          { wch: 22 }, // TMT Pangkat Sljt

          // Jafung
          { wch: 22 }, // Jafung Sekarang
          { wch: 22 }, // Jafung Sblm
          { wch: 26 }, // Jafung Sljt
          { wch: 16 }, // AK Kumulatif
          { wch: 18 }, // Status UKOM

          // Masa Kerja
          { wch: 22 }, // MKG Format
          { wch: 12 }, // MKG Thn
          { wch: 12 }, // MKG Bln
          { wch: 20 }, // TMT CPNS

          // KGB
          { wch: 20 }, // KGB Sblm
          { wch: 20 }, // KGB Terakhir
          { wch: 24 }, // KGB Sljt
          { wch: 24 }, // Status KGB

          // KP4
          { wch: 22 }, // Status KP4
          { wch: 14 }, // Total Tanggungan
          { wch: 14 }, // Pasangan
          { wch: 12 }, // Anak
          { wch: 45 }, // Rincian Nama

          // Lainnya
          { wch: 24 }, // Pendidikan
          { wch: 30 }, // Univ
          { wch: 24 }, // Prodi
          { wch: 18 }, // WA
          { wch: 32 }, // STR SIP
        ];

        XLSX.writeFile(workbook, `Laporan_Komprehensif_SIMORANG_DINKES_PPKB_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting Comprehensive XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 2. Export Special Pangkat & KGB Projection Sheet
  const exportPangkatKgbToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const rows = filteredData.map((p, idx) => ({
          'No': idx + 1,
          'NIP': p.nip,
          'Nama Lengkap': p.namaLengkap,
          'Unit Kerja': p.unitKerja,
          'Status ASN': p.statusKepegawaian,
          'Pendidikan Terakhir': p.pendidikanTerakhir,
          'Masa Kerja Golongan (MKG)': p.masaKerjaGolongan,

          // Pangkat
          'Pangkat/Gol Sebelumnya': p.pangkatSebelumnya,
          'TMT Pangkat Sebelumnya': p.tmtPangkatSebelumnya,
          'Pangkat/Gol Sekarang': `${p.namaPangkatSekarang} (${p.golonganSekarang})`,
          'TMT Pangkat Sekarang': p.tmtPangkatSekarang,
          'Proyeksi Pangkat Selanjutnya': p.proyeksiPangkatSelanjutnya,
          'TMT Proyeksi Pangkat Selanjutnya': p.tmtProyeksiPangkatSelanjutnya,

          // KGB
          'TMT KGB Sebelumnya': p.tmtKgbSebelumnya,
          'TMT KGB Terakhir': p.tmtKgbTerakhir,
          'TMT KGB Selanjutnya (Jatuh Tempo)': p.tmtKgbSelanjutnya,
          'Status Usulan KGB': p.statusJatuhTempoKgb,
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Pangkat & KGB');

        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 22 }, // NIP
          { wch: 30 }, // Nama
          { wch: 32 }, // Unit
          { wch: 18 }, // Status
          { wch: 22 }, // MKG
          { wch: 26 }, // Pangkat Sblm
          { wch: 20 }, // TMT Pangkat Sblm
          { wch: 26 }, // Pangkat Skrg
          { wch: 20 }, // TMT Pangkat Skrg
          { wch: 28 }, // Pangkat Sljt
          { wch: 22 }, // TMT Pangkat Sljt
          { wch: 20 }, // KGB Sblm
          { wch: 20 }, // KGB Skrg
          { wch: 24 }, // KGB Sljt
          { wch: 24 }, // Status KGB
        ];

        XLSX.writeFile(workbook, `Rekap_Pangkat_KGB_MasaKerja_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting Pangkat & KGB XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 3. Export Special Jafung (Functional Health Roles) Sheet
  const exportJafungToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const jafungRows = filteredData
          .filter((p) => p.jenisJabatan === 'Fungsional')
          .map((p, idx) => ({
            'No': idx + 1,
            'NIP': p.nip,
            'Nama Pejabat Fungsional': p.namaLengkap,
            'Unit Kerja': p.unitKerja,
            'Jabatan Fungsional Spesifik': p.jabatanSpesifik,
            'Pendidikan Terakhir': p.pendidikanTerakhir,
            'Jenjang Jafung Sebelumnya': p.jenjangJafungSebelumnya,
            'Jenjang Jafung Sekarang': p.jenjangJafungSekarang,
            'Proyeksi Jenjang Selanjutnya': p.proyeksiJenjangJafungSelanjutnya,
            'Total Angka Kredit (PAK Integrasi)': p.angkaKreditKumulatif,
            'Status Kelulusan UKKJ / UKOM': p.statusUkom,
            'Pangkat / Golongan': `${p.namaPangkatSekarang} (${p.golonganSekarang})`,
            'Masa Kerja Golongan': p.masaKerjaGolongan,
            'Legalitas STR / SIP': p.legalitasStrSip,
          }));

        const worksheet = XLSX.utils.json_to_sheet(jafungRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Jafung Kesehatan');

        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 22 }, // NIP
          { wch: 30 }, // Nama
          { wch: 32 }, // Unit
          { wch: 28 }, // Jabatan
          { wch: 24 }, // Jenjang Sblm
          { wch: 24 }, // Jenjang Skrg
          { wch: 28 }, // Jenjang Sljt
          { wch: 18 }, // AK
          { wch: 20 }, // UKOM
          { wch: 24 }, // Pangkat
          { wch: 20 }, // MKG
          { wch: 32 }, // STR SIP
        ];

        XLSX.writeFile(workbook, `Rekap_Jabatan_Fungsional_Kesehatan_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting Jafung XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 4. Export KP4 Family Allowances Sheet
  const exportKp4ToXLSX = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const kp4Rows = keluargaList.map((k, idx) => {
          const peg = pegawaiList.find((p) => p.nip === k.nip_pegawai);
          return {
            'No': idx + 1,
            'ID Tanggungan': k.id,
            'NIP Pegawai': k.nip_pegawai,
            'Nama Pegawai': peg?.nama_lengkap || '-',
            'Unit Kerja Pegawai': peg?.unit_kerja || '-',
            'Nama Anggota Keluarga': k.nama_keluarga,
            'Status Hubungan': k.status_hubungan,
            'Tanggal Lahir': k.tanggal_lahir ? formatDateIndonesian(k.tanggal_lahir) : '-',
            'Pekerjaan / Aktivitas': k.pekerjaan || '-',
            'Status Tanggungan KP4': k.status_tanggungan ? 'DITANGGUNG (AKTIF)' : 'TIDAK DITANGGUNG (NON-AKTIF)',
            'Nama Sekolah / Perguruan Tinggi': k.nama_sekolah_pt || '-',
            'Nomor Surat Ket. Kuliah': k.no_surat_kuliah || '-',
            'Semester Perkuliahan': k.semester_kuliah || '-',
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(kp4Rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Rinci KP4');

        worksheet['!cols'] = [
          { wch: 5 },  // No
          { wch: 14 }, // ID
          { wch: 22 }, // NIP
          { wch: 30 }, // Nama Pegawai
          { wch: 32 }, // Unit
          { wch: 30 }, // Nama Keluarga
          { wch: 16 }, // Hubungan
          { wch: 18 }, // Tanggal Lahir
          { wch: 20 }, // Pekerjaan
          { wch: 24 }, // Status
          { wch: 30 }, // Sekolah
          { wch: 24 }, // No Surat
          { wch: 16 }, // Semester
        ];

        XLSX.writeFile(workbook, `Rekap_Tunjangan_Keluarga_KP4_SIMORANG_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting KP4 XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  // 5. Export Master Combined Multi-Sheet Workbook
  const exportAllInOneWorkbook = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Master Komprehensif (Pegawai + Pangkat + Jafung + Masa Kerja + KGB + KP4)
        const sheet1Data = filteredData.map((p, idx) => ({
          'No': idx + 1,
          'NIP': p.nip,
          'Nama Lengkap': p.namaLengkap,
          'Unit Kerja': p.unitKerja,
          'Status ASN': p.statusKepegawaian,
          'Jenis Jabatan': p.jenisJabatan,
          'Jabatan Spesifik': p.jabatanSpesifik,
          'Pendidikan Terakhir': p.pendidikanTerakhir,
          'Pangkat Sebelumnya': p.pangkatSebelumnya,
          'Pangkat Sekarang': `${p.namaPangkatSekarang} (${p.golonganSekarang})`,
          'TMT Pangkat': p.tmtPangkatSekarang,
          'Proyeksi Pangkat Selanjutnya': p.proyeksiPangkatSelanjutnya,
          'Jenjang Jafung Sebelumnya': p.jenjangJafungSebelumnya,
          'Jenjang Jafung Sekarang': p.jenjangJafungSekarang,
          'Jenjang Jafung Selanjutnya': p.proyeksiJenjangJafungSelanjutnya,
          'Masa Kerja Golongan (MKG)': p.masaKerjaGolongan,
          'TMT KGB Sebelumnya': p.tmtKgbSebelumnya,
          'TMT KGB Terakhir': p.tmtKgbTerakhir,
          'TMT KGB Selanjutnya': p.tmtKgbSelanjutnya,
          'Status Tunjangan KP4': p.statusTunjanganKp4,
          'Rincian Tanggungan KP4': p.daftarNamaTanggunganKp4,
        }));
        const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
        XLSX.utils.book_append_sheet(workbook, ws1, '1. Master Komprehensif');

        // Sheet 2: Riwayat SK Digital
        const sheet2Data = skList.map((s, idx) => {
          const peg = pegawaiList.find((p) => p.nip === s.nip_pegawai);
          return {
            'No': idx + 1,
            'ID SK': s.id,
            'NIP Pegawai': s.nip_pegawai,
            'Nama Pegawai': peg?.nama_lengkap || '-',
            'Jenis SK': s.jenis_sk,
            'Nomor SK': s.nomor_sk,
            'TMT Berlaku': s.tmt_berlaku ? formatDateIndonesian(s.tmt_berlaku) : '-',
            'Tanggal Input': s.created_at || '-',
            'Keterangan': s.keterangan || '-',
          };
        });
        const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
        XLSX.utils.book_append_sheet(workbook, ws2, '2. Riwayat SK Digital');

        // Sheet 3: KP4 Rinci
        const sheet3Data = keluargaList.map((k, idx) => {
          const peg = pegawaiList.find((p) => p.nip === k.nip_pegawai);
          return {
            'No': idx + 1,
            'NIP Pegawai': k.nip_pegawai,
            'Nama Pegawai': peg?.nama_lengkap || '-',
            'Nama Anggota Keluarga': k.nama_keluarga,
            'Status Hubungan': k.status_hubungan,
            'Tanggal Lahir': k.tanggal_lahir ? formatDateIndonesian(k.tanggal_lahir) : '-',
            'Status Tanggungan': k.status_tanggungan ? 'DITANGGUNG' : 'NON-AKTIF',
            'Institusi Pendidikan': k.nama_sekolah_pt || '-',
            'Nomor Surat Kuliah': k.no_surat_kuliah || '-',
          };
        });
        const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
        XLSX.utils.book_append_sheet(workbook, ws3, '3. Data Tanggungan KP4');

        XLSX.writeFile(workbook, `Paket_Lengkap_Laporan_SIMORANG_DINKES_PPKB_${getTodayFormatted()}.xlsx`);
      } catch (err) {
        console.error('Error exporting All-in-One XLSX:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header Banner Bersih, Profesional & Terstandarisasi */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-700 shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-xl font-heading font-extrabold text-[#004B87]">
                Ekspor Laporan Kepegawaian (.XLSX)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-heading font-bold uppercase tracking-wider border border-emerald-200">
                Lengkap & Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Unduh rekapitulasi data SIMORANG DINKES-PPKB lengkap mencakup <strong>KP4 Keluarga</strong>, <strong>Pangkat (Sebelumnya & Selanjutnya)</strong>, <strong>Jafung (Sebelumnya & Selanjutnya)</strong>, <strong>Masa Kerja (MKG)</strong>, dan <strong>KGB (Sebelumnya & Selanjutnya)</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-export-all-in-one"
          onClick={exportAllInOneWorkbook}
          disabled={isExporting}
          className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2 bg-[#004B87] hover:bg-[#003866] text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Layers className="w-4 h-4 text-cyan-300" />
          <span>{isExporting ? 'Sedang Memproses Excel...' : 'Ekspor Paket Lengkap (3 Sheet)'}</span>
        </button>
      </div>

      {/* 4 Cards Ekspor Modul Terintegrasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Master Komprehensif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-heading font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {filteredData.length} Pegawai
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm mb-1">
              Rekap Komprehensif SIMORANG
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Mencakup semua kolom: Pangkat, Jafung, Masa Kerja (MKG), KGB, KP4, dan NIP/NIK.
            </p>
          </div>

          <button
            type="button"
            id="btn-export-comprehensive"
            onClick={exportComprehensiveToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Master (.XLSX)</span>
          </button>
        </div>

        {/* Card 2: Pangkat & KGB */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[#004B87]">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-heading font-bold text-[#004B87] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Pangkat & KGB
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm mb-1">
              Rekap Pangkat & KGB (Siklus)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Pangkat Sebelumnya & Selanjutnya, TMT, Masa Kerja Golongan (MKG), serta KGB Berkala.
            </p>
          </div>

          <button
            type="button"
            id="btn-export-pangkat-kgb"
            onClick={exportPangkatKgbToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-[#004B87] hover:bg-[#003866] text-white font-heading font-bold text-xs py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Pangkat & KGB</span>
          </button>
        </div>

        {/* Card 3: Jabatan Fungsional Kesehatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-heading font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {filteredData.filter((p) => p.jenisJabatan === 'Fungsional').length} Jafung
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm mb-1">
              Rekap Jafung & PAK Integrasi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Jenjang Jafung Sebelumnya & Selanjutnya, Angka Kredit Kumulatif, dan Kelulusan UKOM/UKKJ.
            </p>
          </div>

          <button
            type="button"
            id="btn-export-jafung"
            onClick={exportJafungToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-xs py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Jafung (.XLSX)</span>
          </button>
        </div>

        {/* Card 4: Tunjangan Keluarga KP4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-700">
                <Baby className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-heading font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {keluargaList.length} Tanggungan
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm mb-1">
              Rekap Tunjangan Keluarga (KP4)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Daftar pasangan & anak, verifikasi surat kuliah (21-25 thn), dan status tunjangan aktif.
            </p>
          </div>

          <button
            type="button"
            id="btn-export-kp4"
            onClick={exportKp4ToXLSX}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-heading font-bold text-xs py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor KP4 (.XLSX)</span>
          </button>
        </div>
      </div>

      {/* Filter & Live Preview Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-5 md:p-6">
        {/* Top Controls & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#004B87]" />
              <span>Pratinjau Data Laporan Siap Unduh</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              ({filteredData.length} baris data cocok)
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari NIP / Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#004B87] outline-none"
              />
            </div>

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-1.5 px-3 focus:bg-white focus:ring-2 focus:ring-[#004B87] outline-none max-w-[200px] truncate"
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-1.5 px-3 focus:bg-white focus:ring-2 focus:ring-[#004B87] outline-none"
            >
              <option value="Semua Status">Semua Status ASN</option>
              <option value="PNS">PNS</option>
              <option value="PPPK Penuh Waktu">PPPK Penuh Waktu</option>
              <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
              <option value="Non-ASN">Non-ASN</option>
            </select>
          </div>
        </div>

        {/* View Focus Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {[
            { id: 'semua', label: 'Ringkasan Utama' },
            { id: 'pangkat', label: 'Pangkat Sebelumnya & Selanjutnya' },
            { id: 'jafung', label: 'Jafung Sebelumnya & Selanjutnya' },
            { id: 'kgb', label: 'KGB & Masa Kerja (MKG)' },
            { id: 'kp4', label: 'Tunjangan KP4 Keluarga' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePreviewTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePreviewTab === tab.id
                  ? 'bg-[#004B87] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Table Preview */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse font-body">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-heading font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 min-w-[200px]">Pegawai & NIP</th>
                <th className="p-3 min-w-[180px]">Unit Kerja</th>

                {/* Specific Columns based on active tab */}
                {activePreviewTab === 'semua' && (
                  <>
                    <th className="p-3 min-w-[160px]">Pangkat Saat Ini</th>
                    <th className="p-3 min-w-[180px]">Proyeksi Pangkat</th>
                    <th className="p-3 min-w-[140px]">Masa Kerja (MKG)</th>
                    <th className="p-3 min-w-[160px]">Jatuh Tempo KGB</th>
                    <th className="p-3 min-w-[150px]">Tanggungan KP4</th>
                  </>
                )}

                {activePreviewTab === 'pangkat' && (
                  <>
                    <th className="p-3 min-w-[170px]">Pangkat Sebelumnya</th>
                    <th className="p-3 min-w-[170px]">Pangkat Sekarang</th>
                    <th className="p-3 min-w-[180px]">Pangkat Selanjutnya</th>
                    <th className="p-3 min-w-[150px]">Masa Kerja Golongan</th>
                  </>
                )}

                {activePreviewTab === 'jafung' && (
                  <>
                    <th className="p-3 min-w-[160px]">Jabatan Spesifik</th>
                    <th className="p-3 min-w-[160px]">Jenjang Sebelumnya</th>
                    <th className="p-3 min-w-[160px]">Jenjang Sekarang</th>
                    <th className="p-3 min-w-[180px]">Jenjang Selanjutnya</th>
                    <th className="p-3 min-w-[120px]">AK Kumulatif</th>
                    <th className="p-3 min-w-[130px]">Status UKOM</th>
                  </>
                )}

                {activePreviewTab === 'kgb' && (
                  <>
                    <th className="p-3 min-w-[150px]">Masa Kerja (MKG)</th>
                    <th className="p-3 min-w-[160px]">TMT KGB Sebelumnya</th>
                    <th className="p-3 min-w-[160px]">TMT KGB Terakhir</th>
                    <th className="p-3 min-w-[180px]">Jatuh Tempo KGB Selanjutnya</th>
                    <th className="p-3 min-w-[150px]">Status Alert KGB</th>
                  </>
                )}

                {activePreviewTab === 'kp4' && (
                  <>
                    <th className="p-3 min-w-[160px]">Status KP4</th>
                    <th className="p-3 min-w-[120px] text-center">Pasangan</th>
                    <th className="p-3 min-w-[120px] text-center">Anak</th>
                    <th className="p-3 min-w-[280px]">Daftar Nama Tanggungan</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data pegawai yang sesuai dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredData.slice(0, 15).map((row, idx) => (
                  <tr key={row.nip} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-heading font-bold text-slate-900">{row.namaLengkap}</div>
                      <div className="text-[11px] font-mono text-slate-500">{row.nip}</div>
                      <div className="text-[10.5px] text-slate-600 font-medium">{row.jabatanSpesifik}</div>
                      {row.pendidikanTerakhir && row.pendidikanTerakhir !== '-' && (
                        <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                          🎓 {row.pendidikanTerakhir}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      <div>{row.unitKerja}</div>
                      <span className="inline-block mt-0.5 text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {row.statusKepegawaian}
                      </span>
                    </td>

                    {/* Content for TAB: SEMUA */}
                    {activePreviewTab === 'semua' && (
                      <>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{row.namaPangkatSekarang}</div>
                          <div className="text-[10.5px] text-[#004B87] font-bold">Gol. {row.golonganSekarang}</div>
                          <div className="text-[10px] text-slate-500">TMT: {row.tmtPangkatSekarang}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-indigo-900">{row.proyeksiPangkatSelanjutnya}</div>
                          <div className="text-[10px] text-slate-500">Target TMT: {row.tmtProyeksiPangkatSelanjutnya}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                            {row.masaKerjaGolongan}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{row.tmtKgbSelanjutnya}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{row.statusJatuhTempoKgb}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                            row.jumlahTanggunganKp4 > 0
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row.jumlahTanggunganKp4} Tanggungan
                          </span>
                        </td>
                      </>
                    )}

                    {/* Content for TAB: PANGKAT */}
                    {activePreviewTab === 'pangkat' && (
                      <>
                        <td className="p-3 text-slate-600">
                          <div className="font-medium">{row.pangkatSebelumnya}</div>
                          <div className="text-[10px] text-slate-400">TMT: {row.tmtPangkatSebelumnya}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{row.namaPangkatSekarang} ({row.golonganSekarang})</div>
                          <div className="text-[10px] text-[#004B87] font-semibold">TMT: {row.tmtPangkatSekarang}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-indigo-900">{row.proyeksiPangkatSelanjutnya}</div>
                          <div className="text-[10px] text-slate-500">Estimasi TMT: {row.tmtProyeksiPangkatSelanjutnya}</div>
                        </td>
                        <td className="p-3 font-semibold text-emerald-800">
                          {row.masaKerjaGolongan}
                        </td>
                      </>
                    )}

                    {/* Content for TAB: JAFUNG */}
                    {activePreviewTab === 'jafung' && (
                      <>
                        <td className="p-3 font-medium text-slate-800">{row.jabatanSpesifik}</td>
                        <td className="p-3 text-slate-600">{row.jenjangJafungSebelumnya}</td>
                        <td className="p-3 font-bold text-slate-900 bg-blue-50/50 rounded">{row.jenjangJafungSekarang}</td>
                        <td className="p-3 font-bold text-indigo-900">{row.proyeksiJenjangJafungSelanjutnya}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{row.angkaKreditKumulatif}</td>
                        <td className="p-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                            row.statusUkom.includes('Lulus')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row.statusUkom}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Content for TAB: KGB */}
                    {activePreviewTab === 'kgb' && (
                      <>
                        <td className="p-3 font-bold text-emerald-800">{row.masaKerjaGolongan}</td>
                        <td className="p-3 text-slate-600">{row.tmtKgbSebelumnya}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.tmtKgbTerakhir}</td>
                        <td className="p-3 font-bold text-[#004B87]">{row.tmtKgbSelanjutnya}</td>
                        <td className="p-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                            row.statusJatuhTempoKgb.includes('Jatuh Tempo')
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : row.statusJatuhTempoKgb.includes('Mendekati')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.statusJatuhTempoKgb}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Content for TAB: KP4 */}
                    {activePreviewTab === 'kp4' && (
                      <>
                        <td className="p-3">
                          <span className="font-semibold text-purple-900 text-[11px] block">
                            {row.statusTunjanganKp4}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Total: {row.jumlahTanggunganKp4} Jiwa
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">{row.jumlahPasanganKp4}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{row.jumlahAnakKp4}</td>
                        <td className="p-3 text-[11px] text-slate-600 truncate max-w-xs" title={row.daftarNamaTanggunganKp4}>
                          {row.daftarNamaTanggunganKp4}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 15 && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Menampilkan 15 dari {filteredData.length} baris data pada pratinjau. Unduh file Excel (.XLSX) untuk mendapatkan seluruh baris data.
          </div>
        )}
      </div>
    </div>
  );
};
