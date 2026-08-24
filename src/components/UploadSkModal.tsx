import React, { useState } from 'react';
import { X, FileUp, CheckCircle2, History, FileText, Upload, Check } from 'lucide-react';
import { Pegawai, JenisSK } from '../types';

interface UploadSkModalProps {
  pegawaiList: Pegawai[];
  defaultNip?: string;
  defaultJenisSk?: JenisSK;
  onClose: () => void;
  onSubmitSk: (data: {
    nip_pegawai: string;
    jenis_sk: JenisSK;
    nomor_sk: string;
    tmt_berlaku: string;
    file_url?: string;
    keterangan?: string;
  }) => Promise<boolean>;
}

export const UploadSkModal: React.FC<UploadSkModalProps> = ({
  pegawaiList,
  defaultNip,
  defaultJenisSk = 'KGB',
  onClose,
  onSubmitSk,
}) => {
  const [nip, setNip] = useState(defaultNip || pegawaiList[0]?.nip || '');
  const [jenisSk, setJenisSk] = useState<JenisSK>(defaultJenisSk);
  const [nomorSk, setNomorSk] = useState('');
  const [tmtBerlaku, setTmtBerlaku] = useState(new Date().toISOString().slice(0, 10));
  const [fileUrl, setFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPegawai = pegawaiList.find((p) => p.nip === nip) || pegawaiList.find((p) => p.nip === defaultNip);

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Mohon unggah file format PDF resmi (.pdf)');
        return;
      }
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !nomorSk || !tmtBerlaku) return;

    setIsSubmitting(true);
    const success = await onSubmitSk({
      nip_pegawai: nip,
      jenis_sk: jenisSk,
      nomor_sk: nomorSk,
      tmt_berlaku: tmtBerlaku,
      file_url: fileUrl,
      keterangan: keterangan || `Berkas SK ${jenisSk} Nomor ${nomorSk}`,
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <FileUp className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Unggah Berkas / SK Kepegawaian</h3>
              <p className="text-[11px] text-slate-500">Berkas akan tersimpan langsung ke Arsip Digital pegawai</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-blue-900">
          <History className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Ketentuan Arsip Digital:</span> Berkas PDF yang diunggah akan tersimpan otomatis sebagai 
            <span className="font-bold text-blue-700"> Versi Terbaru (Aktif)</span> dan masuk dalam riwayat arsip kepegawaian.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* PEGAWAI SELECTION / DISPLAY */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Pegawai ASN:*</label>
            {defaultNip ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                    Pegawai Dikunci Dari Pemantauan
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedPegawai?.nama_lengkap || `NIP: ${defaultNip}`}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    NIP: {defaultNip} {selectedPegawai?.unit_kerja ? `• ${selectedPegawai.unit_kerja}` : ''}
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  TERKUNCI
                </span>
              </div>
            ) : (
              <select
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                required
              >
                {pegawaiList.map((p) => (
                  <option key={p.nip} value={p.nip}>
                    {p.nama_lengkap} (NIP: {p.nip}) - {p.unit_kerja}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Berkas / SK:*</label>
              <select
                value={jenisSk}
                onChange={(e: any) => setJenisSk(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              >
                <option value="KGB">SK KGB (Gaji Berkala)</option>
                <option value="Pangkat">SK Kenaikan Pangkat</option>
                <option value="Jafung_PAK">SK Jabatan Fungsional / PAK</option>
                <option value="UKOM">Sertifikat Uji Kompetensi (UKKJ)</option>
                <option value="STLUD">STLUD Ujian Dinas Pelaksana</option>
                <option value="Izin Belajar">SK Izin / Tugas Belajar</option>
                <option value="Pencantuman_Gelar">SK / Surat Pencantuman Gelar</option>
                <option value="Mutasi">SK Mutasi Kepegawaian</option>
                <option value="KP4">Berkas Tunjangan KP4</option>
                <option value="Pensiun">SK Pensiun / DPCP</option>
                <option value="Lainnya">Dokumen Kepegawaian Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">TMT / Tanggal Berkas:*</label>
              <input
                type="date"
                required
                value={tmtBerlaku}
                onChange={(e) => setTmtBerlaku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Berkas / SK Resmi:*</label>
            <input
              type="text"
              required
              value={nomorSk}
              onChange={(e) => setNomorSk(e.target.value)}
              placeholder="Contoh: 821/102/DK-PPKB/2026"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold text-slate-800"
            />
          </div>

          {/* PDF FILE UPLOAD SECTION */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Unggah File Dokumen PDF (Arsip Digital):*</label>
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-4 transition-colors text-center relative cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {fileName ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200 shadow-sm text-left">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-xs truncate">{fileName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{fileSize} • Terverifikasi PDF</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1 shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Terunggah</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    Klik atau Drag & Drop File PDF Berkas Ke Sini
                  </div>
                  <p className="text-[10px] text-slate-500">Mendukung dokumen .pdf maks 10MB (Otomatis Tersimpan Ke Arsip Digital)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Keterangan / Perihal Dokumen:</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: SK Mutasi Internal / SK Pencantuman Gelar Terkini"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Ke Arsip Digital</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
