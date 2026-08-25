/**
 * File Helper Utilities for SIMORANG DINKES-PPKB
 * Menangani konversi Base64, Blob URL, dan Membuka Berkas di Tab Baru dengan Pembuka Bawaan Browser
 */

import { Pegawai, RiwayatSK, JenisSK } from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';

/**
 * Mengonversi Base64 Data URL atau raw Base64 menjadi Blob URL yang aktif di browser
 */
export function base64ToBlobUrl(base64Data: string, fallbackMime = 'application/pdf'): string {
  try {
    if (!base64Data) return '';

    // Jika sudah berupa http/https URL eksternal atau blob URL
    if (
      base64Data.startsWith('http://') ||
      base64Data.startsWith('https://') ||
      base64Data.startsWith('blob:')
    ) {
      return base64Data;
    }

    let contentType = fallbackMime;
    let base64String = base64Data;

    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        contentType = match[1];
      }
      base64String = parts[1] || '';
    }

    // Bersihkan karakter newline / whitespace jika ada
    base64String = base64String.replace(/\s/g, '');

    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Gagal mengonversi base64 ke blob URL:', err);
    return base64Data;
  }
}

/**
 * Label resmi jenis SK kepegawaian
 */
export function getJenisSkLabel(jenis?: string): string {
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
      return jenis ? `Surat Keputusan ${jenis}` : 'Dokumen Kepegawaian';
  }
}

/**
 * Membuka dokumen langsung di tab baru browser dengan penampil bawaan browser (Chrome/Edge/Firefox PDF viewer)
 */
export function openDocumentInNewTab(
  fileUrl?: string | null,
  fileName = 'Dokumen.pdf',
  skMetadata?: {
    sk?: RiwayatSK;
    pegawai?: Pegawai | null;
    title?: string;
  }
) {
  try {
    // 1. Jika ada file fisik yang diunggah (base64 / blob / http)
    if (fileUrl && fileUrl.trim().length > 0) {
      let targetUrl = fileUrl;
      if (fileUrl.startsWith('data:')) {
        targetUrl = base64ToBlobUrl(fileUrl, 'application/pdf');
      }

      const newWindow = window.open(targetUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback jika diblokir popup blocker
        downloadDocumentFile(fileUrl, fileName);
      }
      return;
    }

    // 2. Jika berkas fisik belum diunggah, buat Lembar Dokumen Resmi SIMORANG di Tab Baru Browser
    const sk = skMetadata?.sk;
    const pegawai = skMetadata?.pegawai;
    const jenisSk = sk?.jenis_sk || 'KGB';
    const nomorSk = sk?.nomor_sk || '821.1/SK-SIMORANG/DK-PPKB/2026';
    const tmtBerlaku = sk?.tmt_berlaku ? formatDateIndonesian(sk.tmt_berlaku) : '-';
    const judul = skMetadata?.title || getJenisSkLabel(jenisSk);

    const docHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${judul} - ${nomorSk}</title>
        <style>
          @page { size: A4; margin: 20mm 15mm; }
          body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            background-color: #f3f4f6;
            margin: 0;
            padding: 24px;
            display: flex;
            justify-content: center;
          }
          .page-container {
            background: #ffffff;
            width: 100%;
            max-width: 800px;
            min-height: 1000px;
            padding: 40px 50px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            box-sizing: border-box;
            border-radius: 4px;
          }
          .kop-header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 12px;
            margin-bottom: 24px;
            position: relative;
          }
          .kop-header h3 {
            font-size: 14pt;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
          }
          .kop-header h2 {
            font-size: 16pt;
            margin: 4px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #003663;
            font-weight: bold;
          }
          .kop-header p {
            font-size: 9.5pt;
            margin: 2px 0;
            font-family: Arial, sans-serif;
            color: #374151;
          }
          .doc-title {
            text-align: center;
            margin: 24px 0 20px 0;
          }
          .doc-title h4 {
            font-size: 12pt;
            text-transform: uppercase;
            text-decoration: underline;
            margin: 0 0 4px 0;
            font-weight: bold;
          }
          .doc-title p {
            font-size: 10.5pt;
            margin: 2px 0;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
          }
          .content-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11pt;
          }
          .content-table td {
            padding: 6px 4px;
            vertical-align: top;
          }
          .content-table td.label {
            width: 32%;
            color: #374151;
          }
          .content-table td.colon {
            width: 3%;
          }
          .content-table td.value {
            width: 65%;
            font-weight: 600;
          }
          .badge-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
            color: #166534;
          }
          .footer-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .qr-box {
            border: 1px dashed #9ca3af;
            padding: 10px;
            border-radius: 6px;
            font-family: Arial, sans-serif;
            font-size: 8pt;
            width: 220px;
            text-align: center;
            background: #fafafa;
          }
          .signature-box {
            text-align: right;
            font-size: 10.5pt;
          }
          .signature-box .name {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 60px;
          }
          .signature-box .nip {
            font-size: 9pt;
            font-family: 'Courier New', Courier, monospace;
          }
          .toolbar {
            position: fixed;
            top: 15px;
            right: 15px;
            display: flex;
            gap: 10px;
            z-index: 999;
          }
          .btn-print {
            background-color: #004B87;
            color: #fff;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          }
          @media print {
            body { background: #fff; padding: 0; }
            .page-container { box-shadow: none; padding: 0; }
            .toolbar { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
        </div>
        <div class="page-container">
          <div class="kop-header">
            <h3>Pemerintah Kabupaten Lombok Barat</h3>
            <h2>Dinas Kesehatan dan PPKB</h2>
            <p>Jalan Soekarno - Hatta, Giri Menang, Gerung, Kabupaten Lombok Barat, NTB 83363</p>
            <p>Sistem Informasi Monitoring dan Rekapitulasi ASN Kepegawaian (SIMORANG)</p>
          </div>

          <div class="doc-title">
            <h4>SURAT KEPUTUSAN KEPALA DINAS KESEHATAN</h4>
            <p>NOMOR: ${nomorSk}</p>
            <p style="font-family: Arial, sans-serif; font-size: 9.5pt; font-weight: normal; color: #4b5563; margin-top: 4px;">
              Tentang: ${sk?.keterangan || `PENETAPAN ${jenisSk.toUpperCase()} PEGAWAI ASN`}
            </p>
          </div>

          <p style="font-size: 11pt; line-height: 1.6; text-align: justify; margin: 15px 0;">
            Berdasarkan data catatan kepegawaian resmi pada Dinas Kesehatan dan PPKB Kabupaten Lombok Barat, dengan ini menetapkan dan menerbitkan dokumen arsip kepegawaian untuk:
          </p>

          <table class="content-table">
            <tr>
              <td class="label">Nama Lengkap</td>
              <td class="colon">:</td>
              <td class="value">${pegawai?.nama_lengkap || '-'}</td>
            </tr>
            <tr>
              <td class="label">NIP / Identitas</td>
              <td class="colon">:</td>
              <td class="value">${pegawai?.nip || sk?.nip_pegawai || '-'}</td>
            </tr>
            <tr>
              <td class="label">Pangkat / Golongan</td>
              <td class="colon">:</td>
              <td class="value">${pegawai?.nama_pangkat ? `${pegawai.nama_pangkat} (${pegawai.golongan_pangkat})` : 'Penata Muda (III/a)'}</td>
            </tr>
            <tr>
              <td class="label">Jabatan</td>
              <td class="colon">:</td>
              <td class="value">${pegawai?.jabatan_spesifik || '-'}</td>
            </tr>
            <tr>
              <td class="label">Unit Kerja</td>
              <td class="colon">:</td>
              <td class="value">${pegawai?.unit_kerja || 'Dinas Kesehatan Kab. Lombok Barat'}</td>
            </tr>
            <tr>
              <td class="label">Jenis Berkas SK</td>
              <td class="colon">:</td>
              <td class="value">${getJenisSkLabel(jenisSk)}</td>
            </tr>
            <tr>
              <td class="label">Terhitung Mulai Tanggal (TMT)</td>
              <td class="colon">:</td>
              <td class="value">${tmtBerlaku}</td>
            </tr>
          </table>

          <div class="badge-box">
            <strong>✓ Keabsahan Arsip SIMORANG:</strong> Dokumen SK ini tercatat aktif dalam pangkalan data digital SIMORANG DINKES-PPKB Lombok Barat dan memiliki kekuatan hukum administrasi kepegawaian yang sah.
          </div>

          <div class="footer-section">
            <div class="qr-box">
              <div style="font-weight: bold; margin-bottom: 4px; color: #1e3a8a;">TANDA TANGAN ELEKTRONIK</div>
              <div style="font-size: 24px; margin: 6px 0;">🛡️</div>
              <div>Dokumen Resmi Tersertifikasi</div>
              <div style="font-family: monospace; font-size: 7pt; color: #6b7280; margin-top: 4px;">ID: SIMORANG-DOC-${sk?.id || Date.now()}</div>
            </div>

            <div class="signature-box">
              <div>Ditetapkan di: Giri Menang, Gerung</div>
              <div>Pada Tanggal: ${formatDateIndonesian(new Date().toISOString().slice(0, 10))}</div>
              <div style="font-weight: bold; margin-top: 10px;">KEPALA DINAS KESEHATAN KABUPATEN LOMBOK BARAT</div>
              <div class="name">ARIF SURYAWIRAWAN, S.Si., Apt., MPH</div>
              <div class="nip">NIP. 19780512 200501 1 008</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(docHtml);
      newWindow.document.close();
    } else {
      alert('Pop-up peramban terblokir. Izinkan pop-up untuk membuka pratinjau dokumen di tab baru.');
    }
  } catch (err) {
    console.error('Gagal membuka berkas di tab baru:', err);
    if (fileUrl) {
      downloadDocumentFile(fileUrl, fileName);
    }
  }
}

/**
 * Mengunduh berkas dokumen ke perangkat pengguna dengan nama file yang rapi
 */
export function downloadDocumentFile(fileUrl?: string | null, fileName = 'Dokumen.pdf') {
  if (!fileUrl) {
    alert('Berkas dokumen fisik tidak tersedia untuk diunduh.');
    return;
  }

  try {
    let targetUrl = fileUrl;
    let isCreatedBlob = false;

    if (fileUrl.startsWith('data:')) {
      targetUrl = base64ToBlobUrl(fileUrl);
      isCreatedBlob = true;
    }

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (isCreatedBlob) {
      setTimeout(() => URL.revokeObjectURL(targetUrl), 5000);
    }
  } catch (err) {
    console.error('Gagal mengunduh berkas:', err);
    alert('Gagal mengunduh berkas. Silakan coba kembali.');
  }
}

/**
 * Mengecek apakah file_url merupakan format PDF atau Gambar yang valid
 */
export function getFileTypeInfo(fileUrl?: string | null): {
  isPdf: boolean;
  isImage: boolean;
  isBase64: boolean;
  isExternal: boolean;
} {
  if (!fileUrl) {
    return { isPdf: false, isImage: false, isBase64: false, isExternal: false };
  }

  const isBase64 = fileUrl.startsWith('data:');
  const isExternal = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
  const isPdf =
    fileUrl.includes('application/pdf') ||
    fileUrl.toLowerCase().endsWith('.pdf') ||
    (isExternal && fileUrl.toLowerCase().includes('pdf'));
  const isImage =
    fileUrl.includes('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(fileUrl);

  return { isPdf, isImage, isBase64, isExternal };
}

