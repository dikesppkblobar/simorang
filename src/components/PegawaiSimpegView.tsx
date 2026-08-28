import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  FileText,
  X,
  AlertCircle,
  FileUp,
  UserCheck,
  MessageCircle,
  Award,
  Users,
  Phone,
  Calendar,
  Building2,
  CreditCard,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Briefcase,
  GraduationCap,
  Heart,
  Check,
} from 'lucide-react';
import { Pegawai, RiwayatSK, KeluargaKP4, StatusKepegawaian, SumberPembiayaan, JenisJabatan, StatusHubungan, AppFeatureConfig, DEFAULT_FEATURE_CONFIG } from '../types';
import { dbStore } from '../services/dbStore';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PegawaiAddEditModal } from './PegawaiAddEditModal';
import {
  validateNIP,
  validateNIK,
  parseDate,
  formatDate,
  formatDateIndonesian,
  getPangkatNameByGolongan,
  getProyeksiKenaikanPangkat,
  PANGKAT_GOLONGAN_MAP,
} from '../services/dateCalculator';

interface AnakFormItem {
  id: string;
  nama_keluarga: string;
  status_hubungan: 'Anak';
  tanggal_lahir: string;
  status_tanggungan: boolean;
  nama_sekolah_pt: string;
  no_surat_kuliah: string;
}

interface PegawaiSimpegViewProps {
  pegawaiList: Pegawai[];
  unitsList?: import('../types').UnitKerjaItem[];
  featureConfig?: AppFeatureConfig;
  onAddPegawai: (pegawaiData: any) => Promise<boolean>;
  onUpdatePegawai: (nip: string, data: any) => Promise<boolean>;
  onSoftDeletePegawai: (nip: string) => void;
  onRestorePegawai: (nip: string) => void;
  onFetchDetail: (
    nip: string
  ) => Promise<{ pegawai: Pegawai; riwayat_sk: RiwayatSK[]; keluarga_kp4: KeluargaKP4[] } | null>;
  onOpenUploadSkModal: (nip: string, defaultJenisSk?: 'KGB' | 'Pangkat') => void;
  onAddKeluarga?: (data: any) => Promise<boolean>;
  onUpdateKeluarga?: (id: string, updates: Partial<KeluargaKP4>) => Promise<boolean>;
  onDeleteKeluarga?: (id: string) => Promise<boolean>;
  onUpdateTanggungan?: (id: string, status: boolean, suratUrl?: string) => Promise<boolean>;
}

const PROFESI_SDMK_OPTIONS = [
  'Dokter / Dokter Spesialis',
  'Perawat',
  'Bidan',
  'Apoteker / Tenaga Kefarmasian',
  'Sanitarian / Kesling',
  'Nutrisionis / Dietisien',
  'Pranata Laboratorium Kesehatan',
  'Administrator Kesehatan',
  'Radiografer',
  'Penata Anestesi',
  'Perekam Medis',
  'Epidemiolog Kesehatan',
  'Tenaga Teknis Umum / Administrasi',
];

const DEFAULT_LOBAR_UNITS = [
  'Dinas Kesehatan Kab. Lombok Barat',
  'Puskesmas Gerung',
  'Puskesmas Narmada',
  'Puskesmas Meninting',
  'Puskesmas Labuapi',
  'Puskesmas Gunungsari',
  'Puskesmas Sekotong',
  'Puskesmas Kediri',
  'Puskesmas Lingsar',
  'Puskesmas Suranadi',
  'Puskesmas Penimbung',
  'Puskesmas Lembar',
  'Puskesmas Eyat Mayang',
  'Puskesmas Jembatan Kembar',
  'Puskesmas Kuripan',
  'Puskesmas Sigerongan',
  'Puskesmas Pelangan',
  'Puskesmas Sedau',
  'Puskesmas Banyumulek',
  'Puskesmas Parampuan',
  'RSUD Tripat Gerung',
  'RSUD Awet Muda Narmada',
  'Labkesda Lombok Barat',
  'Balai Penyuluhan KB Kec. Gerung',
  'Balai Penyuluhan KB Kec. Narmada',
  'Balai Penyuluhan KB Kec. Gunungsari',
];

const GOLONGAN_PNS_OPTIONS = [
  'I/a', 'I/b', 'I/c', 'I/d',
  'II/a', 'II/b', 'II/c', 'II/d',
  'III/a', 'III/b', 'III/c', 'III/d',
  'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e',
];

const GOLONGAN_PPPK_OPTIONS = [
  'Golongan I', 'Golongan II', 'Golongan III', 'Golongan IV', 'Golongan V',
  'Golongan VI', 'Golongan VII', 'Golongan VIII', 'Golongan IX', 'Golongan X',
  'Golongan XI', 'Golongan XII', 'Golongan XIII', 'Golongan XIV', 'Golongan XV',
  'Golongan XVI', 'Golongan XVII',
];

export const PegawaiSimpegView: React.FC<PegawaiSimpegViewProps> = ({
  pegawaiList,
  unitsList = [],
  featureConfig = DEFAULT_FEATURE_CONFIG,
  onAddPegawai,
  onUpdatePegawai,
  onSoftDeletePegawai,
  onRestorePegawai,
  onFetchDetail,
  onOpenUploadSkModal,
  onAddKeluarga,
  onUpdateKeluarga,
  onDeleteKeluarga,
  onUpdateTanggungan,
}) => {
  // Master Unit Kerja yang tersinkron penuh dengan Manajemen User & Unit Kerja
  const synchronizedUnitOptions = React.useMemo(() => {
    const list = unitsList && unitsList.length > 0 ? unitsList : dbStore.getAllUnits();
    if (list && list.length > 0) {
      const activeUnits = list
        .filter((u) => u.status === 'Aktif' || (!u.status || (u.status !== 'Nonaktif' && u.status !== 'Non-Aktif')))
        .map((u) => u.nama_unit);
      return activeUnits.length > 0 ? activeUnits : list.map((u) => u.nama_unit);
    }
    return DEFAULT_LOBAR_UNITS;
  }, [unitsList]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterJabatan, setFilterJabatan] = useState('Semua');
  const [showDeleted, setShowDeleted] = useState(false);
  const [pegawaiToDelete, setPegawaiToDelete] = useState<Pegawai | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Detail Modal State (4 Tabs: Ringkasan, Pangkat, KP4 Tanggungan, Aksi Cepat)
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<{
    pegawai: Pegawai;
    riwayat_sk: RiwayatSK[];
    keluarga_kp4: KeluargaKP4[];
  } | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'ringkasan' | 'pangkat' | 'kp4' | 'aksi'
  >('ringkasan');

  // KP4 Detail Management In-Modal States
  const [isDetailKp4ModalOpen, setIsDetailKp4ModalOpen] = useState(false);
  const [editingKp4Item, setEditingKp4Item] = useState<KeluargaKP4 | null>(null);
  const [kp4ItemToDelete, setKp4ItemToDelete] = useState<KeluargaKP4 | null>(null);
  const [detailKp4Form, setDetailKp4Form] = useState<{
    nama_keluarga: string;
    status_hubungan: StatusHubungan;
    tanggal_lahir: string;
    status_tanggungan: boolean;
    pekerjaan?: string;
    nama_sekolah_pt?: string;
    no_surat_kuliah?: string;
  }>({
    nama_keluarga: '',
    status_hubungan: 'Anak',
    tanggal_lahir: '2010-01-01',
    status_tanggungan: true,
    pekerjaan: '',
    nama_sekolah_pt: '',
    no_surat_kuliah: '',
  });

  // Add/Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'identitas' | 'akademik' | 'golongan' | 'keluarga' | null>('identitas');

  // KP4 Tanggungan state in Add Pegawai Form
  const [statusPerkawinan, setStatusPerkawinan] = useState<'Menikah' | 'Belum Menikah' | 'Duda' | 'Janda'>('Menikah');
  const [namaPasangan, setNamaPasangan] = useState('');
  const [tglLahirPasangan, setTglLahirPasangan] = useState('1990-01-01');
  const [tanggunganPasangan, setTanggunganPasangan] = useState(true);
  const [daftarAnak, setDaftarAnak] = useState<AnakFormItem[]>([]);

  const [formData, setFormData] = useState<any>({
    status_kepegawaian: 'PNS' as StatusKepegawaian,
    nik: '',
    nip: '',
    ni_pppk: '',
    nama_lengkap: '',
    gelar_depan: '',
    gelar_belakang: '',
    tempat_lahir: 'Lombok Barat',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    profesi_sdmk: 'Perawat',
    jenis_jabatan: 'Fungsional',
    jabatan_spesifik: '',
    unit_kerja: synchronizedUnitOptions[0] || 'Dinas Kesehatan Kab. Lombok Barat',
    status_ukom: false,
    tmt_cpns: '',
    pendidikan_terakhir: '',
    status_izin_belajar: false,
    no_whatsapp: '',
    sisa_cuti_tahunan: 12,

    // Fields Pemantauan ASN & Studi
    jenjang_jabatan: 'Ahli Pertama',
    ak_konversi_skp: 12.5,
    total_ak_kumulatif: 37.5,
    predikat_skp_terakhir: 'Baik',
    status_ukkj: 'Belum UKKJ',
    no_sertifikat_ukkj: '',
    tgl_lulus_ukkj: '',
    status_ujian_dinas: 'Bukan Pelaksana',
    no_stlud: '',
    status_pencantuman_gelar: 'Terverifikasi BKN',
    nama_universitas_pt: '',
    program_studi: '',
    progres_semester: '',
    akreditasi_pt: 'A / Unggul',

    // PNS
    golongan_pangkat: 'III/a',
    nama_pangkat: 'Penata Muda',
    tmt_golongan: '',
    tmt_pangkat_terakhir: '',
    tmt_kgb_terakhir: '',
    no_sk_kgb: '',
    tgl_sk_kgb: '',
    masa_kerja_tahun: 0,
    masa_kerja_bulan: 0,
    no_sk_pangkat: '',
    tgl_sk_pangkat: '',
    jenis_mutasi: 'Kenaikan Pangkat Reguler',
    no_pertek_bkn: '',
    tgl_pertek_bkn: '',
    nama_jabatan_pns: '',
    tmt_jabatan_pns: '',
    tmt_jafung: '',
    no_sk_jabatan_pns: '',
    tgl_sk_jabatan_pns: '',

    // PPPK
    no_perjanjian_kerja: '',
    tgl_perjanjian_kerja: '',
    tmt_perjanjian_mulai: '',
    tmt_perjanjian_selesai: '',
    golongan_pppk: 'Golongan IX',
    no_sk_pppk: '',
    satker: 'Dinas Kesehatan Lombok Barat',

    // Non-ASN
    no_sk_kontrak: '',
    masa_kerja_non_asn: '1 Tahun',
    sumber_pembiayaan: 'BLUD' as SumberPembiayaan,
  });

  const [nikValidationResult, setNikValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  const [nipValidationResult, setNipValidationResult] = useState<{
    isValid: boolean;
    error?: string;
    parsedInfo?: any;
  } | null>(null);

  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return { years: 0, months: 0 };
    const birth = new Date(birthDateStr);
    const now = new Date();
    if (isNaN(birth.getTime())) return { years: 0, months: 0 };
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    if (now.getDate() < birth.getDate() && months > 0) {
      months--;
    }
    return { years: Math.max(0, years), months: Math.max(0, months) };
  };

  const handleNikChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const res = validateNIK(clean);
    setNikValidationResult(res);

    setFormData((prev: any) => {
      const updated = { ...prev, nik: clean };
      if (prev.status_kepegawaian === 'Non-ASN') {
        updated.nip = clean; // NIP auto-matches NIK for Non-ASN
      }
      return updated;
    });
  };

  const handleNipChange = (val: string) => {
    const clean = val.trim();
    const result = validateNIP(clean);
    setNipValidationResult(result);

    if (result.isValid && result.parsedInfo) {
      setFormData((prev: any) => ({
        ...prev,
        nip: clean,
        tanggal_lahir: result.parsedInfo.birthDate,
        jenis_kelamin: result.parsedInfo.gender,
        tmt_cpns: prev.tmt_cpns || result.parsedInfo.cpnsDate,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, nip: clean }));
    }
  };

  const handleGolonganPnsChange = (gol: string) => {
    const name = getPangkatNameByGolongan(gol);
    setFormData((prev: any) => ({
      ...prev,
      golongan_pangkat: gol,
      nama_pangkat: name,
    }));
  };

  const handleStatusKepegawaianChange = (status: StatusKepegawaian) => {
    setFormData((prev: any) => {
      const updated = { ...prev, status_kepegawaian: status };
      if (status === 'Non-ASN') {
        updated.nip = prev.nik; // NIP matches NIK
        updated.jenjang_jabatan = 'Pelaksana';
        updated.ak_konversi_skp = 0;
        updated.total_ak_kumulatif = 0;
        updated.status_ukkj = 'Bukan Jafung';
        updated.status_ujian_dinas = 'Bukan Pelaksana';
        updated.status_pencantuman_gelar = 'Bukan Tugas Belajar';
      } else if (status === 'PPPK Paruh Waktu') {
        updated.total_ak_kumulatif = 0;
        updated.status_ukkj = 'Bukan Jafung';
        updated.status_ujian_dinas = 'Bukan Pelaksana';
        updated.status_pencantuman_gelar = 'Bukan Tugas Belajar';
      } else if (status === 'PPPK Penuh Waktu') {
        updated.status_ujian_dinas = 'Bukan Pelaksana';
      }
      return updated;
    });
  };

  const handleOpenDetail = async (nip: string) => {
    const detail = await onFetchDetail(nip);
    if (detail) {
      setSelectedPegawaiDetail(detail);
      setActiveDetailTab('ringkasan');
    }
  };

  const refreshSelectedDetail = async () => {
    if (selectedPegawaiDetail) {
      const updated = await onFetchDetail(selectedPegawaiDetail.pegawai.nip);
      if (updated) {
        setSelectedPegawaiDetail(updated);
      }
    }
  };

  const handleOpenEdit = (pegawai: Pegawai) => {
    setActiveFormTab('identitas');
    setFormData({
      status_kepegawaian: pegawai.status_kepegawaian || 'PNS',
      nik: pegawai.nik || '',
      nip: pegawai.nip,
      ni_pppk: pegawai.ni_pppk || '',
      nama_lengkap: pegawai.nama_lengkap,
      gelar_depan: pegawai.gelar_depan || '',
      gelar_belakang: pegawai.gelar_belakang || '',
      tempat_lahir: pegawai.tempat_lahir,
      tanggal_lahir: pegawai.tanggal_lahir,
      jenis_kelamin: pegawai.jenis_kelamin,
      profesi_sdmk: pegawai.profesi_sdmk || 'Perawat',
      jenis_jabatan: pegawai.jenis_jabatan,
      jabatan_spesifik: pegawai.jabatan_spesifik,
      unit_kerja: pegawai.unit_kerja,
      status_ukom: pegawai.status_ukom,
      tmt_cpns: pegawai.tmt_cpns,
      pendidikan_terakhir: pegawai.pendidikan_terakhir,
      status_izin_belajar: !!pegawai.status_izin_belajar,
      no_whatsapp: pegawai.no_whatsapp || '',
      sisa_cuti_tahunan: pegawai.sisa_cuti_tahunan || 12,

      // Fields Pemantauan ASN & Studi
      jenjang_jabatan: pegawai.jenjang_jabatan || 'Ahli Pertama',
      ak_konversi_skp: pegawai.ak_konversi_skp ?? 12.5,
      total_ak_kumulatif: pegawai.total_ak_kumulatif ?? 37.5,
      predikat_skp_terakhir: pegawai.predikat_skp_terakhir || 'Baik',
      status_ukkj: pegawai.status_ukkj || 'Belum UKKJ',
      no_sertifikat_ukkj: pegawai.no_sertifikat_ukkj || '',
      tgl_lulus_ukkj: pegawai.tgl_lulus_ukkj || '',
      status_ujian_dinas: pegawai.status_ujian_dinas || 'Bukan Pelaksana',
      no_stlud: pegawai.no_stlud || '',
      status_pencantuman_gelar: pegawai.status_pencantuman_gelar || 'Terverifikasi BKN',
      nama_universitas_pt: pegawai.nama_universitas_pt || '',
      program_studi: pegawai.program_studi || '',
      progres_semester: pegawai.progres_semester || '',
      akreditasi_pt: pegawai.akreditasi_pt || 'A / Unggul',

      // PNS
      golongan_pangkat: pegawai.golongan_pangkat || 'III/a',
      nama_pangkat: pegawai.nama_pangkat || getPangkatNameByGolongan(pegawai.golongan_pangkat || 'III/a'),
      tmt_golongan: pegawai.tmt_golongan || '',
      tmt_pangkat_terakhir: pegawai.tmt_pangkat_terakhir || pegawai.tmt_golongan || '',
      tmt_kgb_terakhir: pegawai.tmt_kgb_terakhir || '',
      no_sk_kgb: pegawai.no_sk_kgb || '',
      tgl_sk_kgb: (pegawai as any).tgl_sk_kgb || '',
      masa_kerja_tahun: pegawai.masa_kerja_tahun || 0,
      masa_kerja_bulan: pegawai.masa_kerja_bulan || 0,
      no_sk_pangkat: pegawai.no_sk_pangkat || '',
      tgl_sk_pangkat: pegawai.tgl_sk_pangkat || '',
      jenis_mutasi: pegawai.jenis_mutasi || 'Kenaikan Pangkat Reguler',
      no_pertek_bkn: pegawai.no_pertek_bkn || '',
      tgl_pertek_bkn: pegawai.tgl_pertek_bkn || '',
      nama_jabatan_pns: pegawai.nama_jabatan_pns || pegawai.jabatan_spesifik || '',
      tmt_jabatan_pns: pegawai.tmt_jabatan_pns || (pegawai as any).tmt_jafung || '',
      tmt_jafung: (pegawai as any).tmt_jafung || pegawai.tmt_jabatan_pns || '',
      no_sk_jabatan_pns: pegawai.no_sk_jabatan_pns || '',
      tgl_sk_jabatan_pns: (pegawai as any).tgl_sk_jabatan_pns || '',

      // PPPK
      no_perjanjian_kerja: pegawai.no_perjanjian_kerja || '',
      tgl_perjanjian_kerja: pegawai.tgl_perjanjian_kerja || '',
      tmt_perjanjian_mulai: pegawai.tmt_perjanjian_mulai || '',
      tmt_perjanjian_selesai: pegawai.tmt_perjanjian_selesai || '',
      golongan_pppk: pegawai.golongan_pppk || 'Golongan IX',
      no_sk_pppk: pegawai.no_sk_pppk || '',
      satker: pegawai.satker || pegawai.unit_kerja,

      // Non-ASN
      no_sk_kontrak: pegawai.no_sk_kontrak || '',
      masa_kerja_non_asn: pegawai.masa_kerja_non_asn || '',
      sumber_pembiayaan: pegawai.sumber_pembiayaan || 'BLUD',
    });

    setNikValidationResult(validateNIK(pegawai.nik || ''));
    if (pegawai.status_kepegawaian === 'PNS' || pegawai.status_kepegawaian?.startsWith('PPPK')) {
      setNipValidationResult(validateNIP(pegawai.nip));
    }
    setIsEditModalOpen(true);
  };

  const handleAddChildRow = () => {
    setDaftarAnak((prev) => [
      ...prev,
      {
        id: 'child-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        nama_keluarga: '',
        status_hubungan: 'Anak',
        tanggal_lahir: '2012-01-01',
        status_tanggungan: true,
        nama_sekolah_pt: '',
        no_surat_kuliah: '',
      },
    ]);
  };

  const handleRemoveChildRow = (id: string) => {
    setDaftarAnak((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateChildRow = (id: string, field: keyof AnakFormItem, value: any) => {
    setDaftarAnak((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikValidationResult?.isValid) {
      alert('NIK wajib 16 digit angka murni yang valid.');
      return;
    }

    if (formData.status_kepegawaian !== 'Non-ASN' && !nipValidationResult?.isValid) {
      alert('NIP/NI PPPK wajib 18 digit murni yang valid.');
      return;
    }

    const payload = {
      ...formData,
      nip: formData.status_kepegawaian === 'Non-ASN' ? formData.nik : formData.nip,
    };

    const success = await onAddPegawai(payload);
    if (success) {
      // 1. Simpan Pasangan KP4 jika Menikah & Nama diisi
      if (statusPerkawinan === 'Menikah' && namaPasangan.trim() && onAddKeluarga) {
        const hubunganPasangan: StatusHubungan = formData.jenis_kelamin === 'L' ? 'Istri' : 'Suami';
        try {
          await onAddKeluarga({
            nip_pegawai: payload.nip,
            nama_keluarga: namaPasangan.trim(),
            status_hubungan: hubunganPasangan,
            tanggal_lahir: tglLahirPasangan || '1990-01-01',
            status_tanggungan: tanggunganPasangan,
            pekerjaan: 'Swasta / Ibu Rumah Tangga',
          });
        } catch (err) {
          console.error('Gagal menambah pasangan KP4:', err);
        }
      }

      // 2. Simpan setiap Anak Tanggungan KP4 yang diinput
      if (daftarAnak.length > 0 && onAddKeluarga) {
        for (const anak of daftarAnak) {
          if (anak.nama_keluarga.trim()) {
            try {
              await onAddKeluarga({
                nip_pegawai: payload.nip,
                nama_keluarga: anak.nama_keluarga.trim(),
                status_hubungan: 'Anak',
                tanggal_lahir: anak.tanggal_lahir || '2012-01-01',
                status_tanggungan: anak.status_tanggungan,
                nama_sekolah_pt: anak.nama_sekolah_pt || undefined,
                no_surat_kuliah: anak.no_surat_kuliah || undefined,
              });
            } catch (err) {
              console.error('Gagal menambah anak KP4:', err);
            }
          }
        }
      }

      setIsAddModalOpen(false);
      setNikValidationResult(null);
      setNipValidationResult(null);
      // Reset KP4 form fields
      setStatusPerkawinan('Menikah');
      setNamaPasangan('');
      setTglLahirPasangan('1990-01-01');
      setTanggunganPasangan(true);
      setDaftarAnak([]);
    }
  };

  // Handlers for Detail Modal KP4 actions
  const handleOpenAddKp4InDetail = () => {
    setEditingKp4Item(null);
    setDetailKp4Form({
      nama_keluarga: '',
      status_hubungan: 'Anak',
      tanggal_lahir: '2012-01-01',
      status_tanggungan: true,
      pekerjaan: '',
      nama_sekolah_pt: '',
      no_surat_kuliah: '',
    });
    setIsDetailKp4ModalOpen(true);
  };

  const handleOpenEditKp4InDetail = (item: KeluargaKP4) => {
    setEditingKp4Item(item);
    setDetailKp4Form({
      nama_keluarga: item.nama_keluarga,
      status_hubungan: item.status_hubungan,
      tanggal_lahir: item.tanggal_lahir,
      status_tanggungan: item.status_tanggungan,
      pekerjaan: item.pekerjaan || '',
      nama_sekolah_pt: item.nama_sekolah_pt || '',
      no_surat_kuliah: item.no_surat_kuliah || '',
    });
    setIsDetailKp4ModalOpen(true);
  };

  const handleSaveKp4InDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawaiDetail) return;
    if (!detailKp4Form.nama_keluarga.trim()) {
      alert('Nama anggota keluarga wajib diisi.');
      return;
    }

    if (editingKp4Item) {
      if (onUpdateKeluarga) {
        await onUpdateKeluarga(editingKp4Item.id, detailKp4Form);
        await refreshSelectedDetail();
      }
    } else {
      if (onAddKeluarga) {
        await onAddKeluarga({
          nip_pegawai: selectedPegawaiDetail.pegawai.nip,
          ...detailKp4Form,
        });
        await refreshSelectedDetail();
      }
    }
    setIsDetailKp4ModalOpen(false);
    setEditingKp4Item(null);
  };

  const handleToggleTanggunganInDetail = async (item: KeluargaKP4) => {
    if (!selectedPegawaiDetail) return;
    const newStatus = !item.status_tanggungan;
    if (onUpdateTanggungan) {
      await onUpdateTanggungan(item.id, newStatus);
      await refreshSelectedDetail();
    } else if (onUpdateKeluarga) {
      await onUpdateKeluarga(item.id, { status_tanggungan: newStatus });
      await refreshSelectedDetail();
    }
  };

  const handleConfirmDeleteKp4 = async () => {
    if (kp4ItemToDelete && onDeleteKeluarga) {
      await onDeleteKeluarga(kp4ItemToDelete.id);
      setKp4ItemToDelete(null);
      await refreshSelectedDetail();
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdatePegawai(formData.nip, formData);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  // Filtered List
  const filteredPegawai = pegawaiList.filter((p) => {
    if (!showDeleted && p.is_deleted) return false;
    if (showDeleted && !p.is_deleted) return false;

    if (filterStatus !== 'Semua' && p.status_kepegawaian !== filterStatus) return false;
    if (filterJabatan !== 'Semua' && p.jenis_jabatan !== filterJabatan) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        p.nip.includes(q) ||
        (p.nik && p.nik.includes(q)) ||
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.unit_kerja.toLowerCase().includes(q) ||
        p.jabatan_spesifik.toLowerCase().includes(q) ||
        (p.profesi_sdmk && p.profesi_sdmk.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedPegawai = filteredPegawai.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status?: StatusKepegawaian) => {
    switch (status) {
      case 'PNS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PPPK Penuh Waktu':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PPPK Paruh Waktu':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Non-ASN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari NIK, NIP, Nama, Unit Kerja, Jabatan, atau Profesi SDMK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-[#334155] px-3 py-2 rounded-lg outline-none font-medium"
            >
              <option value="Semua">Semua Status Kepegawaian</option>
              <option value="PNS">PNS</option>
              <option value="PPPK Penuh Waktu">PPPK Penuh Waktu</option>
              <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
              <option value="Non-ASN">Non-ASN (PKWT)</option>
            </select>

            <select
              value={filterJabatan}
              onChange={(e) => {
                setFilterJabatan(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-[#334155] px-3 py-2 rounded-lg outline-none font-medium"
            >
              <option value="Semua">Semua Jabatan</option>
              <option value="Fungsional">Fungsional</option>
              <option value="Pelaksana">Pelaksana</option>
              <option value="Struktural">Struktural</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowDeleted(!showDeleted);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              showDeleted
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-100 text-[#334155] border-slate-200 hover:bg-slate-200'
            }`}
          >
            {showDeleted ? 'Sembunyikan Non-Aktif' : 'Tampilkan Non-Aktif'}
          </button>

          <button
            onClick={() => {
              const defaultUnit = synchronizedUnitOptions[0] || 'Dinas Kesehatan Kab. Lombok Barat';
              setActiveFormTab('identitas');
              setFormData({
                status_kepegawaian: 'PNS',
                nik: '',
                nip: '',
                ni_pppk: '',
                nama_lengkap: '',
                gelar_depan: '',
                gelar_belakang: '',
                tempat_lahir: 'Lombok Barat',
                tanggal_lahir: '',
                jenis_kelamin: 'L',
                profesi_sdmk: 'Perawat',
                jenis_jabatan: 'Fungsional',
                jabatan_spesifik: '',
                unit_kerja: defaultUnit,
                status_ukom: false,
                tmt_cpns: '',
                pendidikan_terakhir: '',
                nama_universitas_pt: '',
                program_studi: '',
                progres_semester: '',
                akreditasi_pt: 'A / Unggul',
                status_izin_belajar: false,
                no_whatsapp: '',
                sisa_cuti_tahunan: 12,

                // Atribut Pemantauan ASN
                jenjang_jabatan: 'Ahli Pertama',
                ak_konversi_skp: 12.5,
                total_ak_kumulatif: 37.5,
                predikat_skp_terakhir: 'Baik',
                status_ukkj: 'Belum UKKJ',
                no_sertifikat_ukkj: '',
                tgl_lulus_ukkj: '',
                status_ujian_dinas: 'Bukan Pelaksana',
                no_stlud: '',
                status_pencantuman_gelar: 'Terverifikasi BKN',

                golongan_pangkat: 'III/a',
                nama_pangkat: 'Penata Muda',
                tmt_golongan: '',
                tmt_pangkat_terakhir: '',
                tmt_kgb_terakhir: '',
                no_sk_kgb: '',
                tgl_sk_kgb: '',
                masa_kerja_tahun: 0,
                masa_kerja_bulan: 0,
                no_sk_pangkat: '',
                tgl_sk_pangkat: '',
                jenis_mutasi: 'Kenaikan Pangkat Reguler',
                no_pertek_bkn: '',
                tgl_pertek_bkn: '',
                nama_jabatan_pns: '',
                tmt_jabatan_pns: '',
                tmt_jafung: '',
                no_sk_jabatan_pns: '',
                tgl_sk_jabatan_pns: '',

                no_perjanjian_kerja: '',
                tgl_perjanjian_kerja: '',
                tmt_perjanjian_mulai: '',
                tmt_perjanjian_selesai: '',
                golongan_pppk: 'Golongan IX',
                no_sk_pppk: '',
                satker: defaultUnit,

                no_sk_kontrak: '',
                masa_kerja_non_asn: '1 Tahun',
                sumber_pembiayaan: 'BLUD',
              });
              setNikValidationResult(null);
              setNipValidationResult(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary text-xs shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pegawai Baru</span>
          </button>
        </div>
      </div>

      {/* Main Pegawai Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-heading font-bold text-[#1E293B] uppercase tracking-wider">
            DATA PEGAWAI SIMORANG DINKES-PPKB ({filteredPegawai.length} DATA PEGAWAI)
          </span>
        </div>

        {filteredPegawai.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <p className="font-heading font-semibold text-sm text-[#1E293B]">
              Tidak ada data pegawai yang sesuai dengan kriteria pencarian.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Laptop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-body">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-heading font-bold text-[11px]">
                    <th className="p-3 text-center w-10">NO</th>
                    <th className="p-3">NAMA PEGAWAI / IDENTITAS</th>
                    <th className="p-3">GOLONGAN STATUS</th>
                    <th className="p-3">GENDER</th>
                    <th className="p-3">JABATAN RUMPUN</th>
                    <th className="p-3">UNIT PENEMPATAN</th>
                    <th className="p-3">TMT GOLONGAN / PANGKAT</th>
                    <th className="p-3">TMT JABATAN (JAFUNG)</th>
                    <th className="p-3">TMT GAJI BERKALA (KGB)</th>
                    <th className="p-3">SISA CUTI TAHUNAN</th>
                    <th className="p-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPegawai.map((p, index) => {
                    const globalIndex = startIndex + index + 1;

                    // TMT Golongan / Pangkat Calculation (Lama & Baru: +4 Tahun)
                    const basePangkatDateStr = p.tmt_pangkat_terakhir || p.tmt_golongan || p.tmt_cpns || p.tmt_perjanjian_mulai;
                    let tmtPangkatDisplay = <span className="text-slate-400">-</span>;
                    if (p.status_kepegawaian !== 'Non-ASN' && basePangkatDateStr) {
                      const dLama = parseDate(basePangkatDateStr);
                      if (!isNaN(dLama.getTime())) {
                        const dBaru = new Date(dLama);
                        dBaru.setFullYear(dBaru.getFullYear() + 4);
                        tmtPangkatDisplay = (
                          <div className="space-y-0.5 text-[11px] leading-tight">
                            <div>
                              <span className="text-slate-400 font-normal">Lama: </span>
                              <span className="font-medium text-slate-800">{formatDateIndonesian(basePangkatDateStr)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-normal">Baru: </span>
                              <span className="font-semibold text-blue-700">{formatDateIndonesian(formatDate(dBaru))}</span>
                            </div>
                          </div>
                        );
                      }
                    }

                    // TMT KGB Calculation (Lama & Baru: +2 Tahun)
                    const baseKgbDateStr = p.tmt_kgb_terakhir || p.tmt_golongan || p.tmt_pangkat_terakhir || p.tmt_perjanjian_mulai || p.tmt_cpns;
                    let tmtKgbDisplay = <span className="text-slate-400">-</span>;
                    if (p.status_kepegawaian !== 'Non-ASN' && baseKgbDateStr) {
                      const dLama = parseDate(baseKgbDateStr);
                      if (!isNaN(dLama.getTime())) {
                        const dBaru = new Date(dLama);
                        dBaru.setFullYear(dBaru.getFullYear() + 2);
                        tmtKgbDisplay = (
                          <div className="space-y-0.5 text-[11px] leading-tight">
                            <div>
                              <span className="text-slate-400 font-normal">Lama: </span>
                              <span className="font-medium text-slate-800">{formatDateIndonesian(baseKgbDateStr)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-normal">Baru: </span>
                              <span className="font-semibold text-emerald-700">{formatDateIndonesian(formatDate(dBaru))}</span>
                            </div>
                          </div>
                        );
                      }
                    }

                    // TMT Jabatan (Jafung)
                    let tmtJabatanDisplay = <span className="text-slate-400">-</span>;
                    const tmtJabatanVal = (p as any).tmt_jafung || p.tmt_jabatan_pns || p.tmt_golongan || p.tmt_cpns;
                    if (tmtJabatanVal && (p.jenis_jabatan === 'Fungsional' || p.tmt_jabatan_pns || (p as any).tmt_jafung)) {
                      tmtJabatanDisplay = (
                        <span className="font-medium text-slate-800 text-[11px]">
                          {formatDateIndonesian(tmtJabatanVal)}
                        </span>
                      );
                    }

                    // Golongan Text
                    const golonganText =
                      p.status_kepegawaian === 'PNS'
                        ? p.golongan_pangkat || '-'
                        : p.status_kepegawaian?.startsWith('PPPK')
                        ? p.golongan_pppk || 'PPPK'
                        : 'PKWT';

                    return (
                      <tr key={p.nip} className="hover:bg-slate-50/60 transition-colors">
                        {/* 1. NO */}
                        <td className="p-3 text-center font-bold text-slate-500">{globalIndex}</td>

                        {/* 2. NAMA PEGAWAI / IDENTITAS */}
                        <td className="p-3">
                          <button
                            onClick={() => handleOpenDetail(p.nip)}
                            className="font-bold text-[#1E293B] hover:text-blue-600 hover:underline text-left block"
                          >
                            {p.gelar_depan ? `${p.gelar_depan} ` : ''}
                            {p.nama_lengkap}
                            {p.gelar_belakang ? `, ${p.gelar_belakang}` : ''}
                          </button>
                          <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                            {p.status_kepegawaian === 'Non-ASN' ? `NIK ${p.nik}` : `NIP ${p.nip}`}
                          </div>
                        </td>

                        {/* 3. GOLONGAN STATUS */}
                        <td className="p-3">
                          <div className="font-bold text-[#1E293B]">{golonganText}</div>
                          <div className="text-[11px] font-semibold text-blue-700">
                            {p.status_kepegawaian || 'PNS'}
                          </div>
                        </td>

                        {/* 4. GENDER */}
                        <td className="p-3 font-medium text-slate-700">
                          {p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </td>

                        {/* 5. JABATAN RUMPUN & PENDIDIKAN */}
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">
                            {p.profesi_sdmk || p.jabatan_spesifik || 'Staf Umum'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                            <span>{p.jenis_jabatan === 'Struktural' ? 'Struktural/Staf' : p.jenis_jabatan}</span>
                            {p.pendidikan_terakhir && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-indigo-700 font-bold bg-indigo-50/90 px-1.5 py-0.2 rounded border border-indigo-100/80 text-[10.5px]">
                                  {p.pendidikan_terakhir}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* 6. UNIT PENEMPATAN */}
                        <td className="p-3 font-medium text-slate-800">{p.unit_kerja}</td>

                        {/* 7. TMT GOLONGAN / PANGKAT */}
                        <td className="p-3">{tmtPangkatDisplay}</td>

                        {/* 8. TMT JABATAN (JAFUNG) */}
                        <td className="p-3">{tmtJabatanDisplay}</td>

                        {/* 9. TMT GAJI BERKALA (KGB) */}
                        <td className="p-3">{tmtKgbDisplay}</td>

                        {/* 10. SISA CUTI TAHUNAN */}
                        <td className="p-3 font-bold text-slate-800">
                          {p.sisa_cuti_tahunan ?? 12} Hari
                        </td>

                        {/* 11. AKSI */}
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenDetail(p.nip)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!p.is_deleted ? (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-lg transition-colors"
                                title="Edit Data Pegawai"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setPegawaiToDelete(p)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                                title="Soft Delete / Nonaktifkan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onRestorePegawai(p.nip)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                              title="Aktifkan Kembali"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Card List View (Visible below lg breakpoint) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {paginatedPegawai.map((p, index) => {
                const globalIndex = startIndex + index + 1;
                const basePangkatDateStr = p.tmt_pangkat_terakhir || p.tmt_golongan || p.tmt_cpns || p.tmt_perjanjian_mulai;
                let nextPangkatStr = '-';
                if (p.status_kepegawaian !== 'Non-ASN' && basePangkatDateStr) {
                  const d = parseDate(basePangkatDateStr);
                  if (!isNaN(d.getTime())) {
                    const dBaru = new Date(d);
                    dBaru.setFullYear(dBaru.getFullYear() + 4);
                    nextPangkatStr = formatDateIndonesian(formatDate(dBaru));
                  }
                }

                const baseKgbDateStr = p.tmt_kgb_terakhir || p.tmt_golongan || p.tmt_pangkat_terakhir || p.tmt_perjanjian_mulai || p.tmt_cpns;
                let nextKgbStr = '-';
                if (p.status_kepegawaian !== 'Non-ASN' && baseKgbDateStr) {
                  const d = parseDate(baseKgbDateStr);
                  if (!isNaN(d.getTime())) {
                    const dBaru = new Date(d);
                    dBaru.setFullYear(dBaru.getFullYear() + 2);
                    nextKgbStr = formatDateIndonesian(formatDate(dBaru));
                  }
                }

                const statusBadgeBg =
                  p.status_kepegawaian === 'PNS'
                    ? 'bg-blue-100 text-blue-800'
                    : p.status_kepegawaian?.startsWith('PPPK')
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-800';

                return (
                  <div key={p.nip} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
                    {/* Header: Number, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {globalIndex}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(p.nip)}
                            className="font-heading font-bold text-sm text-[#1E293B] hover:text-[#004B87] text-left leading-tight"
                          >
                            {p.gelar_depan ? `${p.gelar_depan} ` : ''}
                            {p.nama_lengkap}
                            {p.gelar_belakang ? `, ${p.gelar_belakang}` : ''}
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {p.status_kepegawaian === 'Non-ASN' ? `NIK: ${p.nik}` : `NIP: ${p.nip}`}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${statusBadgeBg}`}>
                        {p.status_kepegawaian || 'PNS'}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Jabatan / Profesi</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {p.profesi_sdmk || p.jabatan_spesifik || 'Staf'}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.jenis_jabatan}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Unit Penempatan</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {p.unit_kerja}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">TMT Pangkat Baru (+4 Thn)</span>
                        <span className="font-semibold text-blue-700 text-[11px]">{nextPangkatStr}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">TMT KGB Baru (+2 Thn)</span>
                        <span className="font-semibold text-emerald-700 text-[11px]">{nextKgbStr}</span>
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs text-slate-600 font-medium">
                        Sisa Cuti: <strong className="text-emerald-700 font-bold">{p.sisa_cuti_tahunan ?? 12} Hari</strong>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(p.nip)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        {!p.is_deleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPegawaiToDelete(p)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRestorePegawai(p.nip)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Aktifkan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {filteredPegawai.length > 0 && (
          <div className="px-5 py-3 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-600">
              <span>
                Menampilkan <span className="font-bold text-slate-800">{startIndex + 1}</span> -{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(startIndex + itemsPerPage, filteredPegawai.length)}
                </span>{' '}
                dari <span className="font-bold text-slate-800">{filteredPegawai.length}</span> Data Pegawai
              </span>
              <div className="flex items-center space-x-1 pl-3 border-l border-slate-300">
                <span className="text-[11px] font-medium text-slate-500">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded text-xs font-bold px-1.5 py-0.5 outline-none"
                >
                  <option value={5}>5 Baris</option>
                  <option value={10}>10 Baris</option>
                  <option value={20}>20 Baris</option>
                  <option value={50}>50 Baris</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    validCurrentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / PROFILE DRAWER (5 TABS) */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center font-bold text-lg text-white border-2 border-blue-400">
                  {selectedPegawaiDetail.pegawai.nama_lengkap.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-800 text-blue-200 font-bold px-2 py-0.5 rounded uppercase">
                      {selectedPegawaiDetail.pegawai.status_kepegawaian || 'PNS'}
                    </span>
                    <span className="text-xs text-blue-200">
                      {selectedPegawaiDetail.pegawai.profesi_sdmk}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedPegawaiDetail.pegawai.gelar_depan
                      ? `${selectedPegawaiDetail.pegawai.gelar_depan} `
                      : ''}
                    {selectedPegawaiDetail.pegawai.nama_lengkap}
                    {selectedPegawaiDetail.pegawai.gelar_belakang
                      ? `, ${selectedPegawaiDetail.pegawai.gelar_belakang}`
                      : ''}
                  </h3>
                  <p className="text-xs text-blue-200 font-mono">
                    NIP: {selectedPegawaiDetail.pegawai.nip} | NIK:{' '}
                    {selectedPegawaiDetail.pegawai.nik || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="p-2 hover:bg-blue-800 rounded-lg text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Tabs Navigation Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center space-x-1 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveDetailTab('ringkasan')}
                className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 transition-all ${
                  activeDetailTab === 'ringkasan'
                    ? 'border-blue-600 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1. Ringkasan Profil</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('pangkat')}
                className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 transition-all ${
                  activeDetailTab === 'pangkat'
                    ? 'border-blue-600 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>2. Pangkat & Jabatan</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('kp4')}
                className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 transition-all ${
                  activeDetailTab === 'kp4'
                    ? 'border-blue-600 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>3. Model DK & KP4 ({selectedPegawaiDetail.keluarga_kp4.length})</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('aksi')}
                className={`py-3 px-4 border-b-2 flex items-center space-x-1.5 transition-all ${
                  activeDetailTab === 'aksi'
                    ? 'border-blue-600 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>4. Aksi Cepat</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* TAB 1: RINGKASAN PROFIL */}
              {activeDetailTab === 'ringkasan' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[#64748B] text-[11px] block">NIK Wajib (16 Digit):</span>
                      <span className="font-bold font-mono text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.nik || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">
                        {selectedPegawaiDetail.pegawai.status_kepegawaian === 'PNS'
                          ? 'NIP PNS (18 Digit):'
                          : selectedPegawaiDetail.pegawai.status_kepegawaian?.startsWith('PPPK')
                          ? 'NI PPPK (18 Digit):'
                          : 'NIP / ID Non-ASN:'}
                      </span>
                      <span className="font-bold font-mono text-blue-900">
                        {selectedPegawaiDetail.pegawai.nip || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Nama Lengkap & Gelar:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.gelar_depan
                          ? `${selectedPegawaiDetail.pegawai.gelar_depan} `
                          : ''}
                        {selectedPegawaiDetail.pegawai.nama_lengkap}
                        {selectedPegawaiDetail.pegawai.gelar_belakang
                          ? `, ${selectedPegawaiDetail.pegawai.gelar_belakang}`
                          : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Status Kepegawaian:</span>
                      <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                        {selectedPegawaiDetail.pegawai.status_kepegawaian || 'PNS'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Nomor WhatsApp:</span>
                      {selectedPegawaiDetail.pegawai.no_whatsapp ? (
                        <a
                          href={`https://wa.me/62${selectedPegawaiDetail.pegawai.no_whatsapp.replace(
                            /^0/,
                            ''
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{selectedPegawaiDetail.pegawai.no_whatsapp}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Belum diisi</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Tempat, Tanggal Lahir:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.tempat_lahir},{' '}
                        {formatDateIndonesian(selectedPegawaiDetail.pegawai.tanggal_lahir)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Jenis Kelamin:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.jenis_kelamin === 'L'
                          ? 'Laki-Laki (Pria)'
                          : 'Perempuan (Wanita)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Unit Kerja / Penempatan:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.unit_kerja}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Rumpun Profesi SDMK:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.profesi_sdmk ||
                          selectedPegawaiDetail.pegawai.jabatan_spesifik}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Jenis Jabatan:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.jenis_jabatan}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Jabatan Spesifik:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.jabatan_spesifik}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">TMT CPNS / Pengangkatan:</span>
                      <span className="font-bold text-[#1E293B]">
                        {formatDateIndonesian(selectedPegawaiDetail.pegawai.tmt_cpns)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Pendidikan Terakhir:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.pendidikan_terakhir || '-'}
                      </span>
                      {(selectedPegawaiDetail.pegawai.nama_universitas_pt || selectedPegawaiDetail.pegawai.program_studi) && (
                        <span className="text-[10.5px] text-emerald-800 font-medium block mt-0.5">
                          {selectedPegawaiDetail.pegawai.program_studi ? `${selectedPegawaiDetail.pegawai.program_studi} - ` : ''}
                          {selectedPegawaiDetail.pegawai.nama_universitas_pt}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Sisa Cuti Tahunan:</span>
                      <span className="font-bold text-blue-700">
                        {selectedPegawaiDetail.pegawai.sisa_cuti_tahunan ?? 12} Hari
                      </span>
                    </div>

                    {selectedPegawaiDetail.pegawai.jenis_jabatan === 'Fungsional' ? (
                      <div>
                        <span className="text-[#64748B] text-[11px] block">Status UKOM / UKKJ:</span>
                        <span
                          className={`font-bold ${
                            selectedPegawaiDetail.pegawai.status_ukkj === 'Lulus UKKJ' || selectedPegawaiDetail.pegawai.status_ukom
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {selectedPegawaiDetail.pegawai.status_ukkj || (selectedPegawaiDetail.pegawai.status_ukom ? 'Lulus UKKJ' : 'Belum UKKJ')}
                        </span>
                      </div>
                    ) : selectedPegawaiDetail.pegawai.jenis_jabatan === 'Pelaksana' ? (
                      <div>
                        <span className="text-[#64748B] text-[11px] block">Status Ujian Dinas (STLUD):</span>
                        <span
                          className={`font-bold ${
                            selectedPegawaiDetail.pegawai.status_ujian_dinas === 'Lulus STLUD'
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {selectedPegawaiDetail.pegawai.status_ujian_dinas || 'Bukan Pelaksana'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[#64748B] text-[11px] block">Jenjang Manajerial:</span>
                        <span className="font-bold text-slate-800">
                          {selectedPegawaiDetail.pegawai.jenjang_jabatan || 'Eselon III.a'}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-[#64748B] text-[11px] block">Izin / Tugas Belajar & Gelar:</span>
                      <span className="font-bold text-[#1E293B]">
                        {selectedPegawaiDetail.pegawai.status_pencantuman_gelar || (selectedPegawaiDetail.pegawai.status_izin_belajar ? 'Proses Izin Belajar' : 'Tidak Ada')}
                      </span>
                    </div>
                  </div>

                  {/* Highlight Block: Pemantauan Karir ASN (PermenPANRB 1/2023) - Hanya Ditampilkan untuk Jabatan Fungsional */}
                  {selectedPegawaiDetail.pegawai.jenis_jabatan === 'Fungsional' &&
                    selectedPegawaiDetail.pegawai.status_kepegawaian !== 'Non-ASN' && (
                      <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-indigo-900 text-xs flex items-center space-x-2">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>Atribut Pemantauan ASN (Jabatan Fungsional & PAK Integrasi)</span>
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-900">
                            PermenPANRB 1/2023
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                            <span className="text-slate-500 text-[10px] block font-semibold">Jenjang Jafung</span>
                            <span className="font-extrabold text-indigo-900">
                              {selectedPegawaiDetail.pegawai.jenjang_jabatan || 'Ahli Pertama'}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                            <span className="text-slate-500 text-[10px] block font-semibold">AK Konversi SKP</span>
                            <span className="font-mono font-bold text-slate-800">
                              {Number.isNaN(Number(selectedPegawaiDetail.pegawai.ak_konversi_skp))
                                ? 0
                                : (selectedPegawaiDetail.pegawai.ak_konversi_skp ?? 0)}{' '}
                              Point
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                            <span className="text-slate-500 text-[10px] block font-semibold">Total AK Kumulatif</span>
                            <span className="font-mono font-bold text-indigo-700">
                              {Number.isNaN(Number(selectedPegawaiDetail.pegawai.total_ak_kumulatif))
                                ? 0
                                : (selectedPegawaiDetail.pegawai.total_ak_kumulatif ?? 0)}{' '}
                              Point
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                            <span className="text-slate-500 text-[10px] block font-semibold">Status UKKJ (Ukom)</span>
                            <span className="font-bold text-slate-800">
                              {selectedPegawaiDetail.pegawai.status_ukkj ||
                                (selectedPegawaiDetail.pegawai.status_ukom ? 'Lulus UKKJ' : 'Belum UKKJ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* TAB 2: PANGKAT & JABATAN */}
              {activeDetailTab === 'pangkat' && (
                <div className="space-y-4">
                  {selectedPegawaiDetail.pegawai.status_kepegawaian === 'PNS' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                        <div>
                          <span className="text-[#64748B] text-[11px] block">Golongan Ruang:</span>
                          <span className="font-bold text-blue-900 text-sm">
                            {selectedPegawaiDetail.pegawai.golongan_pangkat || 'III/a'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nama Pangkat:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.nama_pangkat ||
                              getPangkatNameByGolongan(
                                selectedPegawaiDetail.pegawai.golongan_pangkat || 'III/a'
                              )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Golongan:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_golongan ||
                                selectedPegawaiDetail.pegawai.tmt_cpns
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Masa Kerja Golongan:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.masa_kerja_tahun || 0} Tahun{' '}
                            {selectedPegawaiDetail.pegawai.masa_kerja_bulan || 0} Bulan
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nomor & Tgl SK Pangkat:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_sk_pangkat || '-'}{' '}
                            {selectedPegawaiDetail.pegawai.tgl_sk_pangkat
                              ? `(${formatDateIndonesian(selectedPegawaiDetail.pegawai.tgl_sk_pangkat)})`
                              : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Jenis Mutasi:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.jenis_mutasi || 'Kenaikan Pangkat Reguler'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Pertek BKN:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_pertek_bkn || '-'}{' '}
                            {selectedPegawaiDetail.pegawai.tgl_pertek_bkn
                              ? `(${formatDateIndonesian(selectedPegawaiDetail.pegawai.tgl_pertek_bkn)})`
                              : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nama Jabatan PNS:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.nama_jabatan_pns ||
                              selectedPegawaiDetail.pegawai.jabatan_spesifik}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Jabatan PNS:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_jabatan_pns ||
                                selectedPegawaiDetail.pegawai.tmt_golongan ||
                                selectedPegawaiDetail.pegawai.tmt_cpns
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">No. SK Jabatan PNS:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_sk_jabatan_pns || '-'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Gaji Berkala (KGB) Terakhir:</span>
                          <span className="font-bold text-emerald-800">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_kgb_terakhir ||
                                selectedPegawaiDetail.pegawai.tmt_golongan ||
                                selectedPegawaiDetail.pegawai.tmt_cpns
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nomor & Tgl SK KGB:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_sk_kgb || '-'}{' '}
                            {selectedPegawaiDetail.pegawai.tgl_sk_kgb
                              ? `(${formatDateIndonesian(selectedPegawaiDetail.pegawai.tgl_sk_kgb)})`
                              : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT CPNS / Pengangkatan:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(selectedPegawaiDetail.pegawai.tmt_cpns)}
                          </span>
                        </div>
                      </div>

                      {/* Rekomendasi Naik Pangkat & KGB */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start space-x-3">
                          <Award className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-amber-900 text-xs">
                              Proyeksi Kenaikan Pangkat (+4 Tahun)
                            </h4>
                            <p className="text-amber-800 text-xs mt-0.5 font-medium">
                              {getProyeksiKenaikanPangkat(
                                selectedPegawaiDetail.pegawai.golongan_pangkat,
                                selectedPegawaiDetail.pegawai.tmt_pangkat_terakhir ||
                                  selectedPegawaiDetail.pegawai.tmt_golongan ||
                                  selectedPegawaiDetail.pegawai.tmt_cpns
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-emerald-900 text-xs">
                              Proyeksi Kenaikan Gaji Berkala / KGB (+2 Tahun)
                            </h4>
                            <p className="text-emerald-800 text-xs mt-0.5 font-medium">
                              {(() => {
                                const baseDateStr =
                                  selectedPegawaiDetail.pegawai.tmt_kgb_terakhir ||
                                  selectedPegawaiDetail.pegawai.tmt_golongan ||
                                  selectedPegawaiDetail.pegawai.tmt_cpns;
                                if (!baseDateStr) return 'TMT belum diset';
                                const dLama = parseDate(baseDateStr);
                                if (isNaN(dLama.getTime())) return 'Format tanggal tidak valid';
                                const dBaru = new Date(dLama);
                                dBaru.setFullYear(dBaru.getFullYear() + 2);
                                return `KGB Baru: ${formatDateIndonesian(formatDate(dBaru))} (KGB Lama: ${formatDateIndonesian(baseDateStr)})`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPegawaiDetail.pegawai.status_kepegawaian?.startsWith('PPPK') && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                        <div>
                          <span className="text-[#64748B] text-[11px] block">NI PPPK (18 Digit):</span>
                          <span className="font-bold font-mono text-emerald-900">
                            {selectedPegawaiDetail.pegawai.ni_pppk ||
                              selectedPegawaiDetail.pegawai.nip}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Golongan PPPK:</span>
                          <span className="font-bold text-emerald-900">
                            {selectedPegawaiDetail.pegawai.golongan_pppk || 'Golongan IX'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nomor Perjanjian Kerja:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_perjanjian_kerja || '-'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Tgl Perjanjian Kerja:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tgl_perjanjian_kerja || ''
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Perjanjian Mulai:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_perjanjian_mulai || ''
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Perjanjian Selesai:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_perjanjian_selesai || ''
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nomor SK PPPK:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_sk_pppk || '-'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Satker Pengangkat:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.satker ||
                              selectedPegawaiDetail.pegawai.unit_kerja}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Gaji Berkala (KGB) Terakhir:</span>
                          <span className="font-bold text-emerald-800">
                            {formatDateIndonesian(
                              selectedPegawaiDetail.pegawai.tmt_kgb_terakhir ||
                                selectedPegawaiDetail.pegawai.tmt_perjanjian_mulai ||
                                selectedPegawaiDetail.pegawai.tmt_cpns
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">Nomor & Tgl SK KGB:</span>
                          <span className="font-bold text-[#1E293B]">
                            {selectedPegawaiDetail.pegawai.no_sk_kgb || '-'}{' '}
                            {selectedPegawaiDetail.pegawai.tgl_sk_kgb
                              ? `(${formatDateIndonesian(selectedPegawaiDetail.pegawai.tgl_sk_kgb)})`
                              : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#64748B] text-[11px] block">TMT Pengangkat / Awal:</span>
                          <span className="font-bold text-[#1E293B]">
                            {formatDateIndonesian(selectedPegawaiDetail.pegawai.tmt_cpns)}
                          </span>
                        </div>
                      </div>

                      {/* Proyeksi KGB PPPK */}
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-emerald-900 text-xs">
                            Proyeksi Kenaikan Gaji Berkala / KGB PPPK (+2 Tahun)
                          </h4>
                          <p className="text-emerald-800 text-xs mt-0.5 font-medium">
                            {(() => {
                              const baseDateStr =
                                selectedPegawaiDetail.pegawai.tmt_kgb_terakhir ||
                                selectedPegawaiDetail.pegawai.tmt_perjanjian_mulai ||
                                selectedPegawaiDetail.pegawai.tmt_cpns;
                              if (!baseDateStr) return 'TMT Perjanjian belum diset';
                              const dLama = parseDate(baseDateStr);
                              if (isNaN(dLama.getTime())) return 'Format tanggal tidak valid';
                              const dBaru = new Date(dLama);
                              dBaru.setFullYear(dBaru.getFullYear() + 2);
                              return `KGB Baru: ${formatDateIndonesian(formatDate(dBaru))} (KGB Lama: ${formatDateIndonesian(baseDateStr)})`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPegawaiDetail.pegawai.status_kepegawaian === 'Non-ASN' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                      <div>
                        <span className="text-[#64748B] text-[11px] block">No. SK Kontrak Kerja:</span>
                        <span className="font-bold text-purple-900">
                          {selectedPegawaiDetail.pegawai.no_sk_kontrak || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#64748B] text-[11px] block">Sumber Pembiayaan:</span>
                        <span className="font-bold text-purple-900">
                          {selectedPegawaiDetail.pegawai.sumber_pembiayaan || 'BLUD'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#64748B] text-[11px] block">Masa Kerja Non-ASN:</span>
                        <span className="font-bold text-[#1E293B]">
                          {selectedPegawaiDetail.pegawai.masa_kerja_non_asn || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#64748B] text-[11px] block">TMT Awal Kerja / Kontrak:</span>
                        <span className="font-bold text-[#1E293B]">
                          {formatDateIndonesian(selectedPegawaiDetail.pegawai.tmt_cpns)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DOKUMEN & MODEL DK (KP4 - TANGGUNGAN KELUARGA) */}
              {activeDetailTab === 'kp4' && (
                <div className="space-y-4">
                  {/* KP4 Statistics Summary */}
                  {(() => {
                    const totalAnggota = selectedPegawaiDetail.keluarga_kp4.length;
                    const pasangancount = selectedPegawaiDetail.keluarga_kp4.filter(
                      (k) => k.status_hubungan === 'Suami' || k.status_hubungan === 'Istri'
                    ).length;
                    const anakAktif = selectedPegawaiDetail.keluarga_kp4.filter(
                      (k) => k.status_hubungan === 'Anak' && k.status_tanggungan
                    ).length;
                    const anakKritis = selectedPegawaiDetail.keluarga_kp4.filter((k) => {
                      if (k.status_hubungan !== 'Anak') return false;
                      const age = calculateAge(k.tanggal_lahir).years;
                      return age >= 21 && age <= 25;
                    }).length;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <span className="text-[11px] text-blue-700 font-semibold block">Total Anggota</span>
                          <span className="text-lg font-bold text-blue-900">{totalAnggota} Jiwa</span>
                        </div>
                        <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl">
                          <span className="text-[11px] text-pink-700 font-semibold block">Pasangan Terdaftar</span>
                          <span className="text-lg font-bold text-pink-900">{pasangancount} Orang</span>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="text-[11px] text-emerald-700 font-semibold block">Anak Tunjangan Aktif</span>
                          <span className="text-lg font-bold text-emerald-900">{anakAktif} Anak</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <span className="text-[11px] text-amber-700 font-semibold block">Usia Kritis (21-25 th)</span>
                          <span className="text-lg font-bold text-amber-900">{anakKritis} Anak</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-bold text-[#1E293B] text-xs flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-[#2563EB]" />
                        <span>Daftar Anggota Keluarga Tanggungan KP4 ({selectedPegawaiDetail.keluarga_kp4.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Perekaman Model DK untuk dasar pembayaran tunjangan suami/istri dan anak pada gaji bulanan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddKp4InDetail}
                      className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Anggota KP4</span>
                    </button>
                  </div>

                  {selectedPegawaiDetail.keluarga_kp4.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-xl text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-slate-600 font-medium">Belum ada anggota keluarga terdaftar dalam model DK/KP4 pegawai ini.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddKp4InDetail}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        + Klik di sini untuk menambahkan data tanggungan keluarga
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPegawaiDetail.keluarga_kp4.map((k) => {
                        const age = calculateAge(k.tanggal_lahir);
                        const isAnak = k.status_hubungan === 'Anak';
                        const isKritis = isAnak && age.years >= 21 && age.years <= 25;
                        const isOverAge = isAnak && age.years > 25;

                        return (
                          <div
                            key={k.id}
                            className={`p-4 rounded-xl border transition-all ${
                              k.status_tanggungan
                                ? 'bg-white border-slate-200 shadow-sm'
                                : 'bg-slate-50/80 border-slate-200 opacity-80'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="font-bold text-sm text-[#1E293B]">{k.nama_keluarga}</span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      k.status_hubungan === 'Suami' || k.status_hubungan === 'Istri'
                                        ? 'bg-pink-100 text-pink-800 border-pink-200'
                                        : 'bg-blue-100 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {k.status_hubungan}
                                  </span>

                                  {k.status_tanggungan ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                      Tunjangan Aktif
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                      Non-Aktif Tunjangan
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span>
                                    <strong>Tgl Lahir:</strong> {formatDateIndonesian(k.tanggal_lahir)}
                                  </span>
                                  <span>
                                    <strong>Usia:</strong> {age.years} Tahun {age.months} Bulan
                                  </span>
                                  {k.pekerjaan && (
                                    <span>
                                      <strong>Pekerjaan:</strong> {k.pekerjaan}
                                    </span>
                                  )}
                                </div>

                                {k.nama_sekolah_pt && (
                                  <div className="text-[11px] text-indigo-900 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center space-x-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>
                                      <strong>Sekolah / Perguruan Tinggi:</strong> {k.nama_sekolah_pt}{' '}
                                      {k.no_surat_kuliah ? `(No Surat: ${k.no_surat_kuliah})` : ''}
                                    </span>
                                  </div>
                                )}

                                {/* Critical Age Notification for Children */}
                                {isKritis && (
                                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center space-x-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>
                                      Anak usia kritis 21-25 tahun ({age.years} thn). Hak tunjangan gaji wajib diperkuat dengan Surat Keterangan Kuliah aktif.
                                    </span>
                                  </div>
                                )}

                                {isOverAge && (
                                  <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 text-[11px] font-semibold flex items-center space-x-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <span>
                                      Usia telah melampaui batas maksimal tunjangan KP4 (&gt;25 tahun). Tunjangan otomatis berakhir.
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTanggunganInDetail(k)}
                                  title={k.status_tanggungan ? 'Non-aktifkan Tunjangan' : 'Aktifkan Tunjangan'}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                                    k.status_tanggungan
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  {k.status_tanggungan ? 'Aktif' : 'Non-Aktif'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditKp4InDetail(k)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                                  title="Edit Data Anggota Keluarga"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setKp4ItemToDelete(k)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                                  title="Hapus Dari Model DK/KP4"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AKSI CEPAT */}
              {activeDetailTab === 'aksi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedPegawaiDetail(null);
                      handleOpenEdit(selectedPegawaiDetail.pegawai);
                    }}
                    className="p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors flex items-center space-x-3"
                  >
                    <Edit className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold text-blue-900">Edit Profil & Biodata</div>
                      <div className="text-[11px] text-blue-700">
                        Perbarui NIK, Pangkat, Unit Kerja, atau WhatsApp
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const p = selectedPegawaiDetail.pegawai;
                      setSelectedPegawaiDetail(null);
                      onOpenUploadSkModal(p.nip, 'KGB');
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-center space-x-3"
                  >
                    <FileUp className="w-5 h-5 text-slate-700 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1E293B]">Unggah SK Baru (KGB/Pangkat)</div>
                      <div className="text-[11px] text-slate-600">
                        Tambahkan riwayat SK digital ke arsip
                      </div>
                    </div>
                  </button>

                  {selectedPegawaiDetail.pegawai.no_whatsapp && (
                    <a
                      href={`https://wa.me/62${selectedPegawaiDetail.pegawai.no_whatsapp.replace(
                        /^0/,
                        ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors flex items-center space-x-3"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-emerald-900">Kirim Pesan WhatsApp Direct</div>
                        <div className="text-[11px] text-emerald-700">
                          Hubungi pegawai secara langsung
                        </div>
                      </div>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (selectedPegawaiDetail) {
                        setPegawaiToDelete(selectedPegawaiDetail.pegawai);
                      }
                    }}
                    className="p-3.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left transition-colors flex items-center space-x-3 cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold text-red-900">Non-Aktifkan Pegawai</div>
                      <div className="text-[11px] text-red-700">Lakukan Soft-Delete data pegawai</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL (4-TAB NAVIGATION & STRUCTURED GRID) */}
      <PegawaiAddEditModal
        isOpen={isAddModalOpen || isEditModalOpen}
        isAddModalOpen={isAddModalOpen}
        isEditModalOpen={isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        formData={formData}
        setFormData={setFormData}
        activeFormTab={activeFormTab}
        setActiveFormTab={setActiveFormTab}
        nikValidationResult={nikValidationResult}
        handleNikChange={handleNikChange}
        nipValidationResult={nipValidationResult}
        handleNipChange={handleNipChange}
        handleStatusKepegawaianChange={handleStatusKepegawaianChange}
        handleGolonganPnsChange={handleGolonganPnsChange}
        synchronizedUnitOptions={synchronizedUnitOptions}
        featureConfig={featureConfig}
        handleSubmitAdd={handleSubmitAdd}
        handleSubmitEdit={handleSubmitEdit}
        statusPerkawinan={statusPerkawinan}
        setStatusPerkawinan={setStatusPerkawinan}
        namaPasangan={namaPasangan}
        setNamaPasangan={setNamaPasangan}
        tglLahirPasangan={tglLahirPasangan}
        setTglLahirPasangan={setTglLahirPasangan}
        tanggunganPasangan={tanggunganPasangan}
        setTanggunganPasangan={setTanggunganPasangan}
        daftarAnak={daftarAnak}
        handleAddChildRow={handleAddChildRow}
        handleRemoveChildRow={handleRemoveChildRow}
        handleUpdateChildRow={handleUpdateChildRow}
      />

      {/* DETAIL VIEW KP4 MODAL: ADD / EDIT ANGGOTA KELUARGA */}
      {isDetailKp4ModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingKp4Item ? 'Edit Anggota Tanggungan KP4' : 'Tambah Anggota Tanggungan KP4'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailKp4ModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKp4InDetail} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap Anggota Keluarga:*
                </label>
                <input
                  type="text"
                  required
                  value={detailKp4Form.nama_keluarga}
                  onChange={(e) =>
                    setDetailKp4Form({ ...detailKp4Form, nama_keluarga: e.target.value })
                  }
                  placeholder="Contoh: Siti Aisyah"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Hubungan:*</label>
                  <select
                    value={detailKp4Form.status_hubungan}
                    onChange={(e) =>
                      setDetailKp4Form({
                        ...detailKp4Form,
                        status_hubungan: e.target.value as 'Istri' | 'Suami' | 'Anak',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-blue-900 text-xs"
                  >
                    <option value="Istri">Istri</option>
                    <option value="Suami">Suami</option>
                    <option value="Anak">Anak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Lahir:*</label>
                  <input
                    type="date"
                    required
                    value={detailKp4Form.tanggal_lahir}
                    onChange={(e) =>
                      setDetailKp4Form({ ...detailKp4Form, tanggal_lahir: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pekerjaan (Opsional):
                </label>
                <input
                  type="text"
                  value={detailKp4Form.pekerjaan || ''}
                  onChange={(e) =>
                    setDetailKp4Form({ ...detailKp4Form, pekerjaan: e.target.value })
                  }
                  placeholder="Contoh: Pelajar / Ibu Rumah Tangga / PNS"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                />
              </div>

              {detailKp4Form.status_hubungan === 'Anak' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                  <span className="font-bold text-blue-900 block text-[11px]">
                    Data Pendidikan Tinggi / Kuliah (Bagi Usia 21-25 Tahun):
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nama Sekolah / Universitas:
                    </label>
                    <input
                      type="text"
                      value={detailKp4Form.nama_sekolah_pt || ''}
                      onChange={(e) =>
                        setDetailKp4Form({ ...detailKp4Form, nama_sekolah_pt: e.target.value })
                      }
                      placeholder="Contoh: Universitas Mataram"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nomor Surat Keterangan Kuliah Aktif:
                    </label>
                    <input
                      type="text"
                      value={detailKp4Form.no_surat_kuliah || ''}
                      onChange={(e) =>
                        setDetailKp4Form({ ...detailKp4Form, no_surat_kuliah: e.target.value })
                      }
                      placeholder="Contoh: 142/UN18/KM/2026"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailKp4Form.status_tanggungan}
                    onChange={(e) =>
                      setDetailKp4Form({ ...detailKp4Form, status_tanggungan: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-emerald-950 text-xs">
                    Aktifkan Hak Tunjangan Keluarga Gaji (KP4)
                  </span>
                </label>
                <p className="text-[10px] text-emerald-800 mt-1 pl-6">
                  Jika dicentang, anggota keluarga ini akan masuk dalam penghitungan model DK dan pembayaran tunjangan pada SP2D Gaji.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDetailKp4ModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingKp4Item ? 'Simpan Perubahan' : 'Tambahkan ke KP4'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE KP4 ITEM MODAL */}
      <ConfirmDeleteModal
        isOpen={!!kp4ItemToDelete}
        title="Konfirmasi Hapus Anggota KP4"
        itemName={kp4ItemToDelete ? `${kp4ItemToDelete.nama_keluarga} (${kp4ItemToDelete.status_hubungan})` : ''}
        message="Apakah Anda yakin ingin menghapus anggota keluarga ini dari daftar tanggungan Model DK/KP4?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onClose={() => setKp4ItemToDelete(null)}
        onConfirm={handleConfirmDeleteKp4}
      />

      {/* CONFIRM DELETE PEGAWAI MODAL */}
      <ConfirmDeleteModal
        isOpen={!!pegawaiToDelete}
        title="Konfirmasi Non-Aktifkan Pegawai"
        itemName={pegawaiToDelete ? `${pegawaiToDelete.nama_lengkap} (NIP/ID: ${pegawaiToDelete.nip || pegawaiToDelete.ni_pppk || '-'})` : ''}
        message="Apakah Anda yakin ingin menonaktifkan data pegawai ini dari SIMPEG?"
        confirmLabel="Ya, Non-Aktifkan"
        cancelLabel="Batal"
        onClose={() => setPegawaiToDelete(null)}
        onConfirm={() => {
          if (pegawaiToDelete) {
            onSoftDeletePegawai(pegawaiToDelete.nip);
            if (selectedPegawaiDetail?.pegawai.nip === pegawaiToDelete.nip) {
              setSelectedPegawaiDetail(null);
            }
            setPegawaiToDelete(null);
          }
        }}
      />
    </div>
  );
};
