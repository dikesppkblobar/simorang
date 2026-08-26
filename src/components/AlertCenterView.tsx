import React, { useState } from 'react';
import {
  Clock,
  Award,
  AlertTriangle,
  Baby,
  CheckCircle,
  FileUp,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  FileCheck,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Plus,
  Check,
  Edit3,
  User,
  Sparkles,
  Building2,
  Layers,
  FileText,
  BadgeCheck,
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sidebar,
  Send,
  Bell,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  AlertKGBItem,
  AlertPangkatItem,
  AlertPensiunItem,
  AlertKP4AnakItem,
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  UserAccount,
  AppFeatureConfig,
  DEFAULT_FEATURE_CONFIG,
} from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';

interface AlertCenterViewProps {
  currentUser?: UserAccount;
  pegawaiList?: Pegawai[];
  skList?: RiwayatSK[];
  keluargaList?: KeluargaKP4[];
  kgbAlerts: AlertKGBItem[];
  pangkatAlerts: AlertPangkatItem[];
  pensiunAlerts: AlertPensiunItem[];
  kp4Alerts: AlertKP4AnakItem[];
  featureConfig?: AppFeatureConfig;
  onOpenUploadSkModal: (nip: string, defaultJenisSk: 'KGB' | 'Pangkat' | 'Mutasi' | 'Izin Belajar') => void;
  onUpdateKp4Tanggungan: (id: string, statusTanggungan: boolean) => void;
  onUpdatePegawai?: (nip: string, data: Partial<Pegawai>) => Promise<boolean> | boolean;
  onAddKeluarga?: (data: any) => Promise<boolean> | boolean;
  onUpdateKeluarga?: (id: string, updates: Partial<KeluargaKP4>) => Promise<boolean> | boolean;
  onDeleteKeluarga?: (id: string) => Promise<boolean> | boolean;
  defaultSubTab?: 'pangkat' | 'jafung' | 'ukom' | 'ujian_dinas' | 'kgb' | 'cuti' | 'pensiun' | 'izin_belajar' | 'pencantuman_gelar' | 'mutasi' | 'kp4';
  onSubTabChange?: (subTab: 'pangkat' | 'jafung' | 'ukom' | 'ujian_dinas' | 'kgb' | 'cuti' | 'pensiun' | 'izin_belajar' | 'pencantuman_gelar' | 'mutasi' | 'kp4') => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  currentUser,
  pegawaiList = [],
  skList = [],
  keluargaList = [],
  kgbAlerts,
  pangkatAlerts,
  pensiunAlerts,
  kp4Alerts,
  featureConfig = DEFAULT_FEATURE_CONFIG,
  onOpenUploadSkModal,
  onUpdateKp4Tanggungan,
  onUpdatePegawai,
  onAddKeluarga,
  onUpdateKeluarga,
  onDeleteKeluarga,
  defaultSubTab = 'pangkat',
  onSubTabChange,
}) => {
  const isSuperAdmin = currentUser?.role === 'Admin Dinkes';
  type SubTabType =
    | 'pangkat'
    | 'jafung'
    | 'kgb'
    | 'ukom'
    | 'ujian_dinas'
    | 'izin_belajar'
    | 'pencantuman_gelar'
    | 'mutasi'
    | 'kp4'
    | 'cuti'
    | 'pensiun';

  type ModalType =
    | 'pak_jafung'
    | 'ukom'
    | 'ujian_dinas'
    | 'cuti'
    | 'izin_belajar'
    | 'gelar'
    | 'pangkat'
    | 'kgb'
    | 'mutasi';

  const [activeSubTab, setActiveSubTab] = useState<SubTabType>(defaultSubTab);

  const [searchTerm, setSearchTerm] = useState('');

  // Notification Modal State for Admin Unit Kerja & Admin Dinkes
  const [notificationModalData, setNotificationModalData] = useState<{
    pegawai: Pegawai;
    jenisPemantauan: string;
    subjek: string;
    pesan: string;
    penerima: string;
  } | null>(null);

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleOpenSendNotification = (
    pegawai: Pegawai,
    jenisPemantauan: string,
    contextNote?: string
  ) => {
    const pengirimUnit = currentUser?.unit_kerja || pegawai.unit_kerja || 'Unit Kerja';
    const subjek = `PEMBERITAHUAN PEMANTAUAN: ${jenisPemantauan.toUpperCase()} - ${pegawai.nama_lengkap}`;
    const defaultPesan = `Yth. Sdr/i ${pegawai.nama_lengkap} (NIP: ${pegawai.nip})
Unit Kerja: ${pegawai.unit_kerja}

Perihal: Pemberitahuan & Imbauan Pemutakhiran Berkas SDMK [${jenisPemantauan}]

Berdasarkan hasil pemantauan sistem kepegawaian SIMPEG Dikes Lombok Barat, diberitahukan bahwa status pemantauan ${jenisPemantauan} Anda memerlukan perhatian / pemutakhiran berkas pendukung.

Catatan Pemantauan: ${contextNote || 'Mohon segera menyiapkan & mengunggah/menyerahkan kelengkapan berkas fisik maupun digital kepada Pengelola Kepegawaian Unit Kerja untuk diteruskan ke Dinas Kesehatan.'}

Terima kasih atas perhatian dan kerja samanya.
--
Dikirim oleh Pengelola Kepegawaian Unit: ${pengirimUnit} (${currentUser?.nama_lengkap || 'Admin Unit Kerja'})`;

    setNotificationModalData({
      pegawai,
      jenisPemantauan,
      subjek,
      pesan: defaultPesan,
      penerima: `Sdr/i ${pegawai.nama_lengkap} & Pengelola Kepegawaian Dinkes`,
    });
  };

  const handleSendNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationModalData) return;

    setNotificationToast(
      `Pemberitahuan pemantauan (${notificationModalData.jenisPemantauan}) untuk Sdr/i ${notificationModalData.pegawai.nama_lengkap} berhasil dikirimkan ke Pegawai & Pengelola Dinkes!`
    );
    setNotificationModalData(null);

    setTimeout(() => {
      setNotificationToast(null);
    }, 5000);
  };

  // Modals state for quick action in monitoring center
  const [selectedPegawaiModal, setSelectedPegawaiModal] = useState<Pegawai | null>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);

  // Form states inside modals
  const [modalFormData, setModalFormData] = useState<any>({});

  const activePegawai = pegawaiList.filter((p) => !p.is_deleted);

  // Filtered employees for active search term
  const filteredPegawai = activePegawai.filter(
    (p) =>
      p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.includes(searchTerm) ||
      p.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan_spesifik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPangkatAlerts = pangkatAlerts.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.includes(searchTerm) ||
      item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKgbAlerts = kgbAlerts.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.includes(searchTerm) ||
      item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPensiunAlerts = pensiunAlerts.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.includes(searchTerm)
  );

  const filteredKp4Alerts = kp4Alerts.filter(
    (item) =>
      item.nama_anak.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip_pegawai.includes(searchTerm)
  );

  // Helper counters (Khusus PNS untuk Pemantauan Pangkat, JF, UKOM, Ujian Dinas)
  const jafungPnsCount = activePegawai.filter(
    (p) => p.jenis_jabatan === 'Fungsional' && p.status_kepegawaian === 'PNS'
  ).length;
  const pelaksanaPnsCount = activePegawai.filter(
    (p) =>
      p.jenis_jabatan === 'Pelaksana' &&
      p.status_kepegawaian === 'PNS' &&
      p.status_ujian_dinas !== 'Tidak ada' &&
      p.status_ujian_dinas !== 'Bukan Pelaksana'
  ).length;
  const izinBelajarCount = activePegawai.filter((p) => Boolean(p.status_izin_belajar)).length;

  const isPegawaiPencantumanGelar = (p: Pegawai) =>
    Boolean(
      p.status_pencantuman_gelar &&
        p.status_pencantuman_gelar !== 'Tidak ada' &&
        p.status_pencantuman_gelar !== 'Bukan Tugas Belajar' &&
        (p.status_pencantuman_gelar.toLowerCase().includes('verval') ||
          p.status_pencantuman_gelar.toLowerCase().includes('terverifikasi') ||
          p.gelar_depan ||
          p.gelar_belakang)
    );

  const pencantumanGelarCount = activePegawai.filter(isPegawaiPencantumanGelar).length;

  const isPegawaiMutasi = (p: Pegawai) => {
    const hasSkMutasi = skList.some((sk) => sk.nip === p.nip && sk.jenis_sk === 'Mutasi');
    const hasJenisMutasi =
      p.jenis_mutasi &&
      p.jenis_mutasi !== 'Tidak ada' &&
      p.jenis_mutasi !== 'Tidak Ada' &&
      p.jenis_mutasi !== '-' &&
      p.jenis_mutasi !== 'Kenaikan Pangkat Reguler' &&
      (p.jenis_mutasi.toLowerCase().includes('mutasi') ||
        p.jenis_mutasi.toLowerCase().includes('rotasi') ||
        p.jenis_mutasi.toLowerCase().includes('pindah'));
    return Boolean(hasSkMutasi || hasJenisMutasi);
  };

  const mutasiCount = activePegawai.filter(isPegawaiMutasi).length;

  // Configuration for monitoring cards grid in requested order:
  // Kenaikan Pangkat, Jafung, KGB, UKOM, Ujian Dinas, Izin Belajar, Pencantuman Gelar, Mutasi, KP4, Cuti, Pensiun (paling kanan)
  const allMonitoringCards: {
    id: SubTabType;
    title: string;
    count: number | string;
    countLabel: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    description: string;
    regNote: string;
  }[] = [
    {
      id: 'pangkat',
      title: 'Kenaikan Pangkat (PNS)',
      count: pangkatAlerts.length,
      countLabel: 'PNS Usulan',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      icon: Award,
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      description: 'Siklus Kenaikan Pangkat 4 Tahun (Khusus PNS)',
      regNote: '6 Periode BKN Per Tahun',
    },
    {
      id: 'jafung',
      title: 'Jabatan Fungsional (PNS)',
      count: jafungPnsCount,
      countLabel: 'PNS',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-900',
      icon: Briefcase,
      iconBg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      description: 'Konversi SKP & PAK Integrasi (Khusus PNS)',
      regNote: 'PermenPANRB 1/2023 & Per BKN 3/2023',
    },
    {
      id: 'kgb',
      title: 'KGB Gaji Berkala',
      count: kgbAlerts.length,
      countLabel: 'Diproses',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      icon: Clock,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      description: 'Kenaikan Gaji Berkala 2 Tahunan',
      regNote: 'Notifikasi Otomatis H-3 Bulan',
    },
    {
      id: 'ukom',
      title: 'Uji Kompetensi / UKKJ (PNS)',
      count: jafungPnsCount,
      countLabel: 'PNS',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-900',
      icon: BadgeCheck,
      iconBg: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      description: 'UKKJ Teknis, Manajerial & Soskul (Khusus PNS)',
      regNote: 'Syarat Kenaikan Jenjang Jafung PNS',
    },
    {
      id: 'ujian_dinas',
      title: 'Ujian Dinas Pelaksana (PNS)',
      count: pelaksanaPnsCount,
      countLabel: 'PNS',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-900',
      icon: FileText,
      iconBg: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      description: 'Tingkat I (II/d) & II (III/d) (Khusus PNS)',
      regNote: 'Penyetaraan & STLUD BKN',
    },
    {
      id: 'izin_belajar',
      title: 'Izin & Tugas Belajar',
      count: izinBelajarCount,
      countLabel: 'Aktif',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
      icon: BookOpen,
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      description: 'Pengembangan Bangkom ASN',
      regNote: 'SE MenPANRB No. 28/2021',
    },
    {
      id: 'pencantuman_gelar',
      title: 'Pencantuman Gelar',
      count: pencantumanGelarCount,
      countLabel: 'Usulan',
      badgeBg: 'bg-violet-100',
      badgeText: 'text-violet-900',
      icon: GraduationCap,
      iconBg: 'bg-violet-50 border-violet-200',
      iconColor: 'text-violet-600',
      description: 'Gelar D-3, S-1, S-2, S-3 Pasca Lulus',
      regNote: 'Pengesahan Gelar Per BKN',
    },
    {
      id: 'mutasi',
      title: 'Mutasi Kepegawaian',
      count: mutasiCount,
      countLabel: 'Proses',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-900',
      icon: Layers,
      iconBg: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      description: 'Rotasi Penempatan & Jabatan',
      regNote: 'Penyegaran / Kebutuhan Satker',
    },
    {
      id: 'kp4',
      title: 'Tunjangan KP4 Anak',
      count: kp4Alerts.length,
      countLabel: 'Tanggungan',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-900',
      icon: Baby,
      iconBg: 'bg-pink-50 border-pink-200',
      iconColor: 'text-pink-600',
      description: 'Evaluasi Usia Anak 21-25 Thn',
      regNote: 'Verifikasi Surat Ket. Kuliah',
    },
    {
      id: 'cuti',
      title: 'Hak & Sisa Cuti Tahunan',
      count: activePegawai.length,
      countLabel: 'Pegawai',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-900',
      icon: Calendar,
      iconBg: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      description: 'Saldo Cuti 12 Hari Kerja',
      regNote: 'Peraturan BKN No. 24/2017',
    },
    {
      id: 'pensiun',
      title: 'BUP & Akhir Masa Kontrak',
      count: pensiunAlerts.length,
      countLabel: 'Pegawai',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 border-rose-200',
      iconColor: 'text-rose-600',
      description: 'BUP PNS (58/60/65 Thn) & Habis Kontrak PPPK / Non-ASN',
      regNote: 'Pengurusan DPCP & Evaluasi Kontrak',
    },
  ];

  const monitoringCards = allMonitoringCards.filter((card) => {
    if (card.id === 'pangkat' && !featureConfig.sub_pangkat) return false;
    if (card.id === 'jafung' && !featureConfig.sub_jafung) return false;
    if (card.id === 'kgb' && !featureConfig.sub_kgb) return false;
    if (card.id === 'ukom' && !featureConfig.sub_ukom) return false;
    if (card.id === 'ujian_dinas' && !featureConfig.sub_ujian_dinas) return false;
    if (card.id === 'izin_belajar' && !featureConfig.sub_izin_belajar) return false;
    if (card.id === 'pencantuman_gelar' && !featureConfig.sub_pencantuman_gelar) return false;
    if (card.id === 'mutasi' && !featureConfig.sub_mutasi) return false;
    if (card.id === 'kp4' && !featureConfig.sub_kp4) return false;
    if (card.id === 'cuti' && !featureConfig.sub_cuti) return false;
    if (card.id === 'pensiun' && !featureConfig.sub_pensiun) return false;
    return true;
  });

  React.useEffect(() => {
    if (defaultSubTab && monitoringCards.some((c) => c.id === defaultSubTab)) {
      setActiveSubTab(defaultSubTab);
    } else if (monitoringCards.length > 0 && !monitoringCards.some((c) => c.id === activeSubTab)) {
      setActiveSubTab(monitoringCards[0].id);
    }
  }, [defaultSubTab, featureConfig]);

  const handleSelectSubTab = (tab: SubTabType) => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const [isAddKp4ModalOpen, setIsAddKp4ModalOpen] = useState(false);
  const [kp4FormData, setKp4FormData] = useState({
    nip_pegawai: pegawaiList[0]?.nip || '',
    nama_keluarga: '',
    status_hubungan: 'Anak' as 'Suami' | 'Istri' | 'Anak',
    tanggal_lahir: '2008-01-01',
    status_tanggungan: true,
    nama_sekolah_pt: 'Universitas Mataram',
    no_surat_kuliah: '',
    tgl_surat_kuliah: new Date().toISOString().slice(0, 10),
    semester_kuliah: 'Semester 4',
    surat_ket_kuliah_url: null,
  });

  const handleOpenActionModal = (
    pegawai: Pegawai,
    type: ModalType
  ) => {
    setSelectedPegawaiModal(pegawai);
    setModalType(type);
    setModalFormData({
      predikat_skp: 'Sangat Baik',
      angka_kredit_konversi: pegawai.ak_konversi_skp ?? (pegawai.status_kepegawaian === 'Non-ASN' ? 0 : 12.5),
      total_ak_kumulatif: pegawai.total_ak_kumulatif ?? (pegawai.status_kepegawaian === 'PNS' || pegawai.status_kepegawaian === 'PPPK Penuh Waktu' ? 37.5 : 0),
      jenjang_jabatan: pegawai.jenjang_jabatan || 'Ahli Pertama',
      status_ukom: pegawai.status_ukkj || (pegawai.status_ukom ? 'Lulus UKKJ' : 'Belum UKKJ'),
      status_ujian_dinas: pegawai.status_ujian_dinas || (pegawai.status_kepegawaian === 'PNS' ? 'Lulus STLUD' : 'Bukan Pelaksana'),
      status_pencantuman_gelar: pegawai.status_pencantuman_gelar || 'Terverifikasi BKN',
      sisa_cuti: pegawai.sisa_cuti_tahunan ?? 12,
      jumlah_hari_cuti: 1,
      jenis_cuti: 'Cuti Tahunan',
      gelar_depan: pegawai.gelar_depan || '',
      gelar_belakang: pegawai.gelar_belakang || '',
      instansi_pendidikan: pegawai.nama_universitas_pt || 'Universitas Mataram',
      program_studi: pegawai.program_studi || (pegawai.status_izin_belajar ? 'S-2 Magister Kesehatan Masyarakat' : 'S-1 Keperawatan / Kebidanan'),
      progres_semester: pegawai.progres_semester || (pegawai.status_izin_belajar ? 'Semester 4' : 'Pendidikan Selesai'),
      akreditasi_pt: pegawai.akreditasi_pt || 'Unggul (A)',
      tmt_kgb_terakhir: pegawai.tmt_kgb_terakhir || new Date().toISOString().split('T')[0],
      tmt_pangkat_terakhir: pegawai.tmt_pangkat_terakhir || new Date().toISOString().split('T')[0],
      golongan_pangkat: pegawai.golongan_pangkat || 'III/a',
      nama_pangkat: pegawai.nama_pangkat || 'Penata Muda',
      no_sk_pangkat: pegawai.no_sk_pangkat || '',
      unit_kerja: pegawai.unit_kerja || '',
      jenis_mutasi: pegawai.jenis_mutasi || 'Mutasi Out / Pindah Unit Kerja',
      masa_kerja_tahun: pegawai.masa_kerja_tahun || 0,
      masa_kerja_bulan: pegawai.masa_kerja_bulan || 0,
      status_izin_belajar: pegawai.status_izin_belajar || false,
    });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawaiModal) return;

    const status = selectedPegawaiModal.status_kepegawaian;
    const updatePayload: Partial<Pegawai> = {};

    if (modalType === 'pak_jafung') {
      if (status === 'PNS' || status === 'PPPK Penuh Waktu') {
        updatePayload.ak_konversi_skp = Number.isNaN(Number(modalFormData.angka_kredit_konversi)) ? 0 : Number(modalFormData.angka_kredit_konversi);
        updatePayload.total_ak_kumulatif = Number.isNaN(Number(modalFormData.total_ak_kumulatif)) ? 0 : Number(modalFormData.total_ak_kumulatif);
        updatePayload.jenjang_jabatan = modalFormData.jenjang_jabatan;
      } else if (status === 'PPPK Paruh Waktu') {
        updatePayload.ak_konversi_skp = Number.isNaN(Number(modalFormData.angka_kredit_konversi)) ? 0 : Number(modalFormData.angka_kredit_konversi);
        updatePayload.total_ak_kumulatif = 0;
      }
    } else if (modalType === 'ukom') {
      if (status === 'PNS' || status === 'PPPK Penuh Waktu') {
        updatePayload.status_ukkj = modalFormData.status_ukom;
        updatePayload.status_ukom = modalFormData.status_ukom === 'Lulus UKKJ';
      }
    } else if (modalType === 'ujian_dinas') {
      if (status === 'PNS') {
        updatePayload.status_ujian_dinas = modalFormData.status_ujian_dinas;
      }
    } else if (modalType === 'cuti') {
      const hari = Number.isNaN(Number(modalFormData.jumlah_hari_cuti)) ? 0 : Number(modalFormData.jumlah_hari_cuti);
      const sisaLama = Number.isNaN(Number(modalFormData.sisa_cuti)) ? 12 : Number(modalFormData.sisa_cuti);
      updatePayload.sisa_cuti_tahunan = Math.max(0, sisaLama - hari);
    } else if (modalType === 'gelar') {
      if (status === 'PNS' || status === 'PPPK Penuh Waktu') {
        updatePayload.status_pencantuman_gelar = modalFormData.status_pencantuman_gelar;
        updatePayload.gelar_depan = modalFormData.gelar_depan;
        updatePayload.gelar_belakang = modalFormData.gelar_belakang;
        updatePayload.nama_universitas_pt = modalFormData.instansi_pendidikan;
        updatePayload.akreditasi_pt = modalFormData.akreditasi_pt;
      }
    } else if (modalType === 'kgb') {
      updatePayload.tmt_kgb_terakhir = modalFormData.tmt_kgb_terakhir;
      updatePayload.masa_kerja_tahun = Number.isNaN(Number(modalFormData.masa_kerja_tahun)) ? 0 : Number(modalFormData.masa_kerja_tahun);
      updatePayload.masa_kerja_bulan = Number.isNaN(Number(modalFormData.masa_kerja_bulan)) ? 0 : Number(modalFormData.masa_kerja_bulan);
    } else if (modalType === 'pangkat') {
      updatePayload.tmt_pangkat_terakhir = modalFormData.tmt_pangkat_terakhir;
      updatePayload.tmt_golongan = modalFormData.tmt_pangkat_terakhir;
      updatePayload.golongan_pangkat = modalFormData.golongan_pangkat;
      updatePayload.nama_pangkat = modalFormData.nama_pangkat;
      if (modalFormData.no_sk_pangkat) {
        updatePayload.no_sk_pangkat = modalFormData.no_sk_pangkat;
      }
      updatePayload.tgl_sk_pangkat = modalFormData.tmt_pangkat_terakhir;
      updatePayload.updated_at = new Date().toISOString();
    } else if (modalType === 'mutasi') {
      updatePayload.unit_kerja = modalFormData.unit_kerja;
      updatePayload.jenis_mutasi = modalFormData.jenis_mutasi || 'Mutasi Out / Pindah Unit Kerja';
      updatePayload.is_deleted = true; // Mutasi out directly converts employee to non-aktif status!
    } else if (modalType === 'izin_belajar') {
      updatePayload.status_izin_belajar = Boolean(modalFormData.status_izin_belajar);
      updatePayload.nama_universitas_pt = modalFormData.instansi_pendidikan;
      updatePayload.program_studi = modalFormData.program_studi;
      updatePayload.progres_semester = modalFormData.progres_semester;
    }

    if (onUpdatePegawai) {
      await onUpdatePegawai(selectedPegawaiModal.nip, updatePayload);
    }

    alert(`Berhasil memperbarui data pemantauan untuk ${selectedPegawaiModal.nama_lengkap} dan disinkronkan langsung ke SIMPEG!`);
    setModalType(null);
    setSelectedPegawaiModal(null);
  };

  return (
    <div className="space-y-6 font-body text-[#1E293B]">
      {/* Alert Header Banner with Role Differentiation */}
      <div className="bg-[#004B87] text-white p-5 rounded-2xl border border-[#003663] shadow-md flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${isSuperAdmin ? 'bg-white/15 border border-white/25 text-white' : 'bg-[#82BE00]/30 border border-[#82BE00]/40 text-white'}`}>
            {isSuperAdmin ? <ShieldCheck className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base font-heading font-extrabold text-white">
                Pusat Pemantauan Kepegawaian & Alert Center SDMK
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wide border ${
                isSuperAdmin
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-[#82BE00] text-white border-[#6ea000]'
              }`}>
                {isSuperAdmin ? 'Super Admin Dinkes (Full Control Update)' : 'Admin Unit Kerja (Mode Pemberitahuan Pemantauan)'}
              </span>
            </div>
            {!isSuperAdmin && (
              <p className="text-xs text-blue-100 mt-1 max-w-3xl leading-relaxed">
                Sebagai Admin Unit Kerja ({currentUser?.unit_kerja || 'Unit'}), Anda dapat memantau indikator jatuh tempo dan mengirimkan Pemberitahuan/Imbauan Pemantauan resmi dari semua modul kepada pegawai & Dinkes.
              </p>
            )}
          </div>
        </div>

        {/* Global Search inside Monitoring Center */}
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="w-4 h-4 text-blue-200 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari NIP / Nama / Unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs focus:ring-2 focus:ring-[#82BE00] focus:bg-white/20 outline-none font-medium text-white placeholder:text-blue-200"
          />
        </div>
      </div>

      {/* Toast Notification for Sent Messages */}
      {notificationToast && (
        <div className="bg-[#004B87] text-white p-4 rounded-xl border border-[#003663] shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-[#82BE00] shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{notificationToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Module Header Bar */}
      {(() => {
        const currentModule = monitoringCards.find((c) => c.id === activeSubTab) || monitoringCards[0];
        const ModuleIcon = currentModule.icon;

        return (
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border ${currentModule.iconBg} ${currentModule.iconColor} shrink-0`}>
                <ModuleIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#004B87] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Pusat Pemantauan ASN › {currentModule.title}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {currentModule.regNote}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 mt-1">
                  {currentModule.description}
                </h3>
              </div>
            </div>

            {/* Mobile View: Quick Sub-Module Switcher */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 shrink-0">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold border ${currentModule.badgeBg} ${currentModule.badgeText} border-current/20`}>
                Total: {currentModule.count} {currentModule.countLabel}
              </span>

              {/* Mobile Quick Dropdown */}
              <div className="block sm:hidden relative flex-1 max-w-[200px]">
                <select
                  value={activeSubTab}
                  onChange={(e) => handleSelectSubTab(e.target.value as SubTabType)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 font-heading font-bold text-[11px] rounded-xl px-3 py-1.5 pr-8 focus:ring-2 focus:ring-[#004B87] outline-none shadow-xs"
                >
                  {monitoringCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.title} ({card.count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Content Section Container */}
      <div className="w-full space-y-4 pt-2">

      {/* SUB-TAB 1: KENAIKAN PANGKAT */}
      {activeSubTab === 'pangkat' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Pemantauan Kenaikan Pangkat / Golongan ASN (Siklus 4 Tahun)</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Berdasarkan Peraturan BKN Terbaru dengan 6 Periode Kenaikan Pangkat Per Tahun (Februari, April, Juni, Agustus, Oktober, Desember).
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              {pangkatAlerts.length} Usulan Pangkat Mendekati
            </span>
          </div>

          {filteredPangkatAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Semua pegawai berada dalam masa berlaku pangkat normal.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Pegawai</th>
                      <th className="p-3.5">Golongan & TMT Pangkat</th>
                      <th className="p-3.5">Periode BKN Terdekat</th>
                      <th className="p-3.5">Status Syarat UKOM</th>
                      <th className="p-3.5">Status Alert</th>
                      <th className="p-3.5 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPangkatAlerts.map((item) => (
                      <tr key={item.nip} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1E293B]">{item.nama_lengkap}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">NIP: {item.nip}</div>
                          <div className="text-[11px] text-slate-500">{item.unit_kerja}</div>
                        </td>
                        <td className="p-3.5 font-medium text-[#334155]">
                          <div className="font-bold text-blue-900">{formatDateIndonesian(item.tmt_pangkat_terakhir)}</div>
                          <div className="text-[11px] text-slate-500">Target Jatuh Tempo: {formatDateIndonesian(item.tanggal_jatuh_tempo)}</div>
                        </td>
                        <td className="p-3.5 font-bold text-indigo-900 bg-indigo-50/50 rounded-lg">
                          {item.periode_bkn_terdekat}
                        </td>
                        <td className="p-3.5">
                          {item.status_ukom ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Lulus UKOM
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Perlu UKOM / Syarat
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center bg-[#FEE2E2] text-[#991B1B] px-2.5 py-1 rounded-full text-[11px] font-semibold">
                            <span>Mendekati H-3 Bln</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isSuperAdmin ? (
                              <>
                                {activePegawai.find((p) => p.nip === item.nip) && (
                                  <button
                                    onClick={() => {
                                      const peg = activePegawai.find((p) => p.nip === item.nip);
                                      if (peg) handleOpenActionModal(peg, 'pangkat');
                                    }}
                                    className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Update</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onOpenUploadSkModal(item.nip, 'Pangkat')}
                                  className="inline-flex items-center space-x-1 bg-[#2563EB] hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition-colors"
                                >
                                  <FileUp className="w-3.5 h-3.5" />
                                  <span>SK Pangkat</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  const peg = activePegawai.find((p) => p.nip === item.nip);
                                  if (peg) handleOpenSendNotification(peg, 'Kenaikan Pangkat', `Mendekati periode kenaikan pangkat (${item.periode_bkn_terdekat}). Mohon siapkan kelengkapan usulan berkas.`);
                                }}
                                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Kirim Pemberitahuan</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {filteredPangkatAlerts.map((item) => (
                  <div key={item.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                          {item.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {item.nip}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{item.unit_kerja}</div>
                      </div>
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        H-3 Bln
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Periode BKN</span>
                        <span className="font-bold text-indigo-700">{item.periode_bkn_terdekat}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Status UKOM</span>
                        <span className={`text-[11px] font-bold ${item.status_ukom ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {item.status_ukom ? 'Lulus UKOM' : 'Perlu UKOM'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-semibold block">Jatuh Tempo Pangkat</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{formatDateIndonesian(item.tanggal_jatuh_tempo)}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-end gap-1.5">
                      {isSuperAdmin ? (
                        <>
                          {activePegawai.find((p) => p.nip === item.nip) && (
                            <button
                              onClick={() => {
                                const peg = activePegawai.find((p) => p.nip === item.nip);
                                if (peg) handleOpenActionModal(peg, 'pangkat');
                              }}
                              className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenUploadSkModal(item.nip, 'Pangkat')}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>SK Pangkat</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            const peg = activePegawai.find((p) => p.nip === item.nip);
                            if (peg) handleOpenSendNotification(peg, 'Kenaikan Pangkat', `Mendekati periode kenaikan pangkat (${item.periode_bkn_terdekat}). Mohon siapkan kelengkapan usulan berkas.`);
                          }}
                          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pemberitahuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: JABATAN FUNGSIONAL */}
      {activeSubTab === 'jafung' && (
        <div className="space-y-4">
          {/* Table of Functional Staff */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Daftar Pemantauan Jabatan Fungsional Kesehatan & SDMK PNS ({jafungPnsCount} Pegawai PNS)</span>
              </h4>
              <span className="text-xs text-slate-500 font-semibold">
                Rumpun Dokter, Perawat, Bidan, Apoteker, Sanitarian, & SDMK (Khusus PNS)
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Pejabat Fungsional</th>
                    <th className="p-3.5">Jenjang & Pangkat</th>
                    <th className="p-3.5">Predikat SKP & Konversi AK</th>
                    <th className="p-3.5">Total AK Kumulatif (PAK Integrasi)</th>
                    <th className="p-3.5">Proyeksi Kenaikan Jenjang</th>
                    <th className="p-3.5 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPegawai
                    .filter((p) => p.jenis_jabatan === 'Fungsional' && p.status_kepegawaian === 'PNS')
                    .map((pegawai) => {
                      const isMadya = pegawai.jabatan_spesifik.toLowerCase().includes('madya');
                      const isMuda = pegawai.jabatan_spesifik.toLowerCase().includes('muda');
                      const isPertama = pegawai.jabatan_spesifik.toLowerCase().includes('pertama');

                      const currentJenjang = pegawai.jenjang_jabatan || (isMadya ? 'Ahli Madya' : isMuda ? 'Ahli Muda' : isPertama ? 'Ahli Pertama' : 'Kategori Keterampilan');
                      const targetJenjang = currentJenjang === 'Ahli Madya' ? 'Ahli Utama' : currentJenjang === 'Ahli Muda' ? 'Ahli Madya' : currentJenjang === 'Ahli Pertama' ? 'Ahli Muda' : 'Alih Kategori / Penyelia';
                      const estAngkaKredit = pegawai.total_ak_kumulatif ?? (isMadya ? 187.5 : isMuda ? 125.0 : 87.5);
                      const targetAk = currentJenjang === 'Ahli Madya' ? 225 : currentJenjang === 'Ahli Muda' ? 150 : 100;
                      const akKonversi = pegawai.ak_konversi_skp ?? (pegawai.status_kepegawaian === 'Non-ASN' ? 0 : 12.5);

                      return (
                        <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                            <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                            <div className="text-[11px] text-blue-700 font-semibold">{pegawai.jabatan_spesifik}</div>
                            <div className="text-[10px] text-slate-500">{pegawai.unit_kerja}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                              {currentJenjang}
                            </span>
                            <div className="text-[11px] font-semibold text-blue-900 mt-1">
                              Pangkat: {pegawai.golongan_pangkat || 'III/a'} ({pegawai.nama_pangkat || 'Penata Muda'})
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              SKP Terkonversi
                            </span>
                            <div className="text-[11px] text-slate-700 font-semibold mt-1">
                              Konversi AK Tahun Ini: <strong className="text-emerald-700">+{akKonversi} AK</strong>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-extrabold text-blue-900 text-sm">{estAngkaKredit} AK</div>
                            <div className="text-[10px] text-slate-500">Batas Target: {targetAk} AK</div>
                            <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, (estAngkaKredit / targetAk) * 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-indigo-900">{targetJenjang}</div>
                            {estAngkaKredit >= targetAk ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 inline-block">
                                Siap UKKJ Kenaikan Jenjang
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 inline-block">
                                Kurang {Math.max(0, targetAk - estAngkaKredit)} AK
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {isSuperAdmin ? (
                              <button
                                onClick={() => handleOpenActionModal(pegawai, 'pak_jafung')}
                                className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>PAK & SKP Konversi</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSendNotification(pegawai, 'Jabatan Fungsional & PAK', `Pemberitahuan evaluasi Angka Kredit (AK) Konversi SKP & Jenjang ${pegawai.jenjang_jabatan || 'Jafung'}.`)}
                                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Kirim Pemberitahuan</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {filteredPegawai
                .filter((p) => p.jenis_jabatan === 'Fungsional' && p.status_kepegawaian === 'PNS')
                .map((pegawai) => {
                  const isMadya = pegawai.jabatan_spesifik.toLowerCase().includes('madya');
                  const isMuda = pegawai.jabatan_spesifik.toLowerCase().includes('muda');
                  const isPertama = pegawai.jabatan_spesifik.toLowerCase().includes('pertama');

                  const currentJenjang = pegawai.jenjang_jabatan || (isMadya ? 'Ahli Madya' : isMuda ? 'Ahli Muda' : isPertama ? 'Ahli Pertama' : 'Kategori Keterampilan');
                  const targetJenjang = currentJenjang === 'Ahli Madya' ? 'Ahli Utama' : currentJenjang === 'Ahli Muda' ? 'Ahli Madya' : currentJenjang === 'Ahli Pertama' ? 'Ahli Muda' : 'Alih Kategori / Penyelia';
                  const estAngkaKredit = pegawai.total_ak_kumulatif ?? (isMadya ? 187.5 : isMuda ? 125.0 : 87.5);
                  const targetAk = currentJenjang === 'Ahli Madya' ? 225 : currentJenjang === 'Ahli Muda' ? 150 : 100;
                  const akKonversi = pegawai.ak_konversi_skp ?? (pegawai.status_kepegawaian === 'Non-ASN' ? 0 : 12.5);

                  return (
                    <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                            {pegawai.nama_lengkap}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                          <div className="text-[11px] text-blue-700 font-semibold">{pegawai.jabatan_spesifik}</div>
                          <div className="text-[10px] text-slate-500">{pegawai.unit_kerja}</div>
                        </div>
                        <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] shrink-0">
                          {currentJenjang}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Angka Kredit Kumulatif:</span>
                          <span className="font-extrabold text-blue-900">{estAngkaKredit} / {targetAk} AK</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (estAngkaKredit / targetAk) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="text-slate-500">Target Promosi:</span>
                          <span className="font-bold text-indigo-700">{targetJenjang}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Konversi Tahun Ini:</span>
                          <span className="font-bold text-emerald-700">+{akKonversi} AK</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleOpenActionModal(pegawai, 'pak_jafung')}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>PAK & SKP Konversi</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSendNotification(pegawai, 'Jabatan Fungsional & PAK', `Pemberitahuan evaluasi Angka Kredit (AK) Konversi SKP & Jenjang ${pegawai.jenjang_jabatan || 'Jafung'}.`)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Pemberitahuan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: UJI KOMPETENSI FUNGSIONAL (UKKJ) */}
      {activeSubTab === 'ukom' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <BadgeCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Pemantauan Uji Kompetensi Kenaikan Jenjang Jabatan Fungsional PNS (UKKJ)</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Uji Kompetensi Teknikal, Manajerial, dan Sosial Kultural yang diselenggarakan BKN / Instansi Pembina Kesehatan untuk Kenaikan Jenjang PNS.
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pejabat Fungsional</th>
                  <th className="p-3.5">Jenjang Asal & Tujuan</th>
                  <th className="p-3.5">Syarat AK Kumulatif</th>
                  <th className="p-3.5">Status Kelulusan UKKJ</th>
                  <th className="p-3.5">Rekomendasi Instansi Pembina</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPegawai
                  .filter((p) => p.jenis_jabatan === 'Fungsional' && p.status_kepegawaian === 'PNS')
                  .map((pegawai) => {
                    const statusUkomText = pegawai.status_ukkj || (pegawai.status_ukom ? 'Lulus UKKJ' : 'Belum UKKJ');
                    return (
                      <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                          <div className="text-[11px] text-blue-700 font-medium">{pegawai.jabatan_spesifik}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">
                            {pegawai.jenjang_jabatan || pegawai.jabatan_spesifik}
                          </div>
                          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                            Tujuan: Promosi Jenjang Setingkat Lebih Tinggi
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-emerald-800">
                          Memenuhi PAK Kumulatif
                        </td>
                        <td className="p-3.5">
                          {statusUkomText.toLowerCase().includes('lulus') ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>{statusUkomText.toUpperCase()}</span>
                            </span>
                          ) : statusUkomText.toLowerCase().includes('proses') ? (
                            <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              {statusUkomText.toUpperCase()}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              {statusUkomText.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          Rekomendasi Dinkes / Kemenkes Verval
                        </td>
                        <td className="p-3.5 text-right">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleOpenActionModal(pegawai, 'ukom')}
                              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              <BadgeCheck className="w-3.5 h-3.5" />
                              <span>Update Hasil UKKJ</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSendNotification(pegawai, 'Uji Kompetensi / UKKJ', 'Pemberitahuan kelengkapan syarat rekomendasi UKKJ Kenaikan Jenjang Jabatan Fungsional.')}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredPegawai
              .filter((p) => p.jenis_jabatan === 'Fungsional' && p.status_kepegawaian === 'PNS')
              .map((pegawai) => {
                const statusUkomText = pegawai.status_ukkj || (pegawai.status_ukom ? 'Lulus UKKJ' : 'Belum UKKJ');
                return (
                  <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                          {pegawai.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                        <div className="text-[11px] text-blue-700 font-semibold">{pegawai.jabatan_spesifik}</div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        statusUkomText.toLowerCase().includes('lulus') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusUkomText.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                      <div className="text-slate-500 text-[11px]">
                        Jenjang: <strong className="text-slate-800">{pegawai.jenjang_jabatan || pegawai.jabatan_spesifik}</strong>
                      </div>
                      <div className="text-[11px] text-indigo-700 font-semibold">
                        Target: Promosi Kenaikan Jenjang
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        ✓ Memenuhi Syarat AK Kumulatif
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSuperAdmin ? (
                        <button
                          onClick={() => handleOpenActionModal(pegawai, 'ukom')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Update Hasil UKKJ</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSendNotification(pegawai, 'Uji Kompetensi / UKKJ', 'Pemberitahuan kelengkapan syarat rekomendasi UKKJ Kenaikan Jenjang Jabatan Fungsional.')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pemberitahuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: UJIAN DINAS BAGI PELAKSANA */}
      {activeSubTab === 'ujian_dinas' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Pemantauan Ujian Dinas Bagi Pegawai Jabatan Pelaksana PNS</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Ujian Dinas Tingkat I (Pengatur Gol. II/d ke III/a) & Tingkat II (Penata I Gol. III/d ke IV/a) bagi pelaksana PNS yang belum Penyesuaian Ijazah S-1.
              </p>
            </div>
            <span className="bg-blue-100 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              {pelaksanaPnsCount} Pegawai Pelaksana PNS
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai Pelaksana PNS</th>
                  <th className="p-3.5">Golongan Saat Ini</th>
                  <th className="p-3.5">Kategori Ujian Dinas</th>
                  <th className="p-3.5">Status Kepesertaan / STLUD</th>
                  <th className="p-3.5">Surat Tanda Lulus (STLUD)</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPegawai
                  .filter(
                    (p) =>
                      p.jenis_jabatan === 'Pelaksana' &&
                      p.status_kepegawaian === 'PNS' &&
                      p.status_ujian_dinas !== 'Tidak ada' &&
                      p.status_ujian_dinas !== 'Tidak Ada' &&
                      p.status_ujian_dinas !== 'Bukan Pelaksana'
                  )
                  .map((pegawai) => {
                    const isGol2d = pegawai.golongan_pangkat === 'II/d';
                    const isGol3d = pegawai.golongan_pangkat === 'III/d';
                    const kategori = isGol2d ? 'Ujian Dinas Tingkat I (II/d -> III/a)' : isGol3d ? 'Ujian Dinas Tingkat II (III/d -> IV/a)' : 'Ujian Penyesuaian Ijazah (UPI)';
                    const statusUd = pegawai.status_ujian_dinas || (pegawai.status_kepegawaian === 'PNS' ? 'Belum Ujian Dinas' : 'Bukan Pelaksana PNS');

                    return (
                      <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                          <div className="text-[11px] text-slate-600">{pegawai.unit_kerja}</div>
                        </td>
                        <td className="p-3.5 font-bold text-blue-900">
                          {pegawai.golongan_pangkat || 'II/c'} ({pegawai.nama_pangkat || 'Pengatur'})
                        </td>
                        <td className="p-3.5 font-semibold text-indigo-900 bg-indigo-50/50 rounded-lg">
                          {kategori}
                        </td>
                        <td className="p-3.5">
                          {statusUd.toLowerCase().includes('lulus') ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              {statusUd.toUpperCase()}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              {statusUd.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          {statusUd.toLowerCase().includes('lulus') ? 'STLUD/2025/BKN/09812' : '-'}
                        </td>
                        <td className="p-3.5 text-right">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleOpenActionModal(pegawai, 'ujian_dinas')}
                              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Input STLUD</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSendNotification(pegawai, 'Ujian Dinas Pelaksana', 'Pemberitahuan pemutakhiran sertifikat STLUD / pendaftaran Ujian Dinas Tingkat I & II.')}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredPegawai
              .filter(
                (p) =>
                  p.jenis_jabatan === 'Pelaksana' &&
                  p.status_kepegawaian === 'PNS' &&
                  p.status_ujian_dinas !== 'Tidak ada' &&
                  p.status_ujian_dinas !== 'Tidak Ada' &&
                  p.status_ujian_dinas !== 'Bukan Pelaksana'
              )
              .map((pegawai) => {
                const isGol2d = pegawai.golongan_pangkat === 'II/d';
                const isGol3d = pegawai.golongan_pangkat === 'III/d';
                const kategori = isGol2d ? 'Ujian Dinas Tk. I (II/d -> III/a)' : isGol3d ? 'Ujian Dinas Tk. II (III/d -> IV/a)' : 'Ujian Penyesuaian Ijazah';
                const statusUd = pegawai.status_ujian_dinas || (pegawai.status_kepegawaian === 'PNS' ? 'Belum Ujian Dinas' : 'Bukan Pelaksana PNS');

                return (
                  <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                          {pegawai.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{pegawai.unit_kerja}</div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        statusUd.toLowerCase().includes('lulus') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusUd.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                      <div className="text-slate-500 text-[11px]">
                        Golongan: <strong className="text-blue-900 font-bold">{pegawai.golongan_pangkat || 'II/c'}</strong> ({pegawai.nama_pangkat || 'Pengatur'})
                      </div>
                      <div className="text-[11px] text-indigo-800 font-semibold">
                        Kategori: {kategori}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        STLUD: {statusUd.toLowerCase().includes('lulus') ? 'STLUD/2025/BKN/09812' : '-'}
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSuperAdmin ? (
                        <button
                          onClick={() => handleOpenActionModal(pegawai, 'ujian_dinas')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Input STLUD</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSendNotification(pegawai, 'Ujian Dinas Pelaksana', 'Pemberitahuan pemutakhiran sertifikat STLUD / pendaftaran Ujian Dinas Tingkat I & II.')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pemberitahuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: KGB */}
      {activeSubTab === 'kgb' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Daftar Pegawai Jatuh Tempo KGB (Kenaikan Gaji Berkala)</span>
              </h3>
              <p className="text-xs text-[#64748B]">Siklus 2 Tahun (24 Bulan) | Terhitung H-3 Bulan</p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
              {kgbAlerts.length} Perlu Diproses
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai</th>
                  <th className="p-3.5">TMT KGB Terakhir</th>
                  <th className="p-3.5">Jatuh Tempo Berikutnya</th>
                  <th className="p-3.5">Status Alert</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kgbAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Semua pegawai aktif memiliki TMT KGB yang masih berlaku.
                    </td>
                  </tr>
                ) : (
                  kgbAlerts.map((item) => (
                    <tr key={item.nip} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#1E293B]">{item.nama_lengkap}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">NIP: {item.nip}</div>
                        <div className="text-[11px] text-slate-500">{item.unit_kerja}</div>
                      </td>
                      <td className="p-3.5 font-medium text-[#334155]">
                        {formatDateIndonesian(item.tmt_kgb_terakhir)}
                      </td>
                      <td className="p-3.5 font-bold text-blue-900">
                        {formatDateIndonesian(item.tanggal_jatuh_tempo)}
                      </td>
                      <td className="p-3.5">
                        {item.status_alert === 'Bahaya' ? (
                          <span className="inline-flex items-center space-x-1 bg-[#FEE2E2] text-[#991B1B] px-2.5 py-1 rounded-full text-[11px] font-semibold">
                            <span>Mendekati / Jatuh Tempo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded-full text-[11px] font-semibold">
                            <span>Peringatan ({item.sisa_bulan} bln)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isSuperAdmin ? (
                            <>
                              {activePegawai.find((p) => p.nip === item.nip) && (
                                <button
                                  onClick={() => {
                                    const peg = activePegawai.find((p) => p.nip === item.nip);
                                    if (peg) handleOpenActionModal(peg, 'kgb');
                                  }}
                                  className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Update</span>
                                </button>
                              )}
                              <button
                                onClick={() => onOpenUploadSkModal(item.nip, 'KGB')}
                                className="inline-flex items-center space-x-1 bg-[#2563EB] hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition-colors"
                              >
                                <FileUp className="w-3.5 h-3.5" />
                                <span>SK KGB</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                const peg = activePegawai.find((p) => p.nip === item.nip);
                                if (peg) handleOpenSendNotification(peg, 'KGB Gaji Berkala', `Jatuh tempo KGB berkala (${formatDateIndonesian(item.tanggal_jatuh_tempo)}). Mohon siapkan kelengkapan SK KGB.`);
                              }}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {kgbAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Semua pegawai aktif memiliki TMT KGB yang masih berlaku.
              </div>
            ) : (
              kgbAlerts.map((item) => (
                <div key={item.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {item.nama_lengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP: {item.nip}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{item.unit_kerja}</div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status_alert === 'Bahaya' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status_alert === 'Bahaya' ? 'Jatuh Tempo' : `${item.sisa_bulan} Bln Lagi`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">TMT KGB Lama</span>
                      <span className="font-medium text-slate-800 text-[11px]">{formatDateIndonesian(item.tmt_kgb_terakhir)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Jatuh Tempo KGB Baru</span>
                      <span className="font-bold text-emerald-700 text-[11px]">{formatDateIndonesian(item.tanggal_jatuh_tempo)}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-1.5">
                    {isSuperAdmin ? (
                      <>
                        {activePegawai.find((p) => p.nip === item.nip) && (
                          <button
                            onClick={() => {
                              const peg = activePegawai.find((p) => p.nip === item.nip);
                              if (peg) handleOpenActionModal(peg, 'kgb');
                            }}
                            className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenUploadSkModal(item.nip, 'KGB')}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>SK KGB</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          const peg = activePegawai.find((p) => p.nip === item.nip);
                          if (peg) handleOpenSendNotification(peg, 'KGB Gaji Berkala', `Jatuh tempo KGB berkala (${formatDateIndonesian(item.tanggal_jatuh_tempo)}). Mohon siapkan kelengkapan SK KGB.`);
                        }}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pemberitahuan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SISA CUTI TAHUNAN */}
      {activeSubTab === 'cuti' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Pemantauan Hak Cuti Tahunan & Sisa Cuti Pegawai ASN</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Sesuai Peraturan BKN No. 24 Tahun 2017 tentang Tata Cara Pemberian Cuti PNS (Hak 12 Hari Kerja Per Tahun).
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai</th>
                  <th className="p-3.5">Hak Cuti Tahunan</th>
                  <th className="p-3.5">Sisa Cuti Saat Ini</th>
                  <th className="p-3.5">Status Pengajuan Terakhir</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPegawai.map((pegawai) => {
                  const sisaCuti = pegawai.sisa_cuti_tahunan ?? 12;
                  const isLow = sisaCuti <= 3;
                  return (
                    <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                        <div className="text-[11px] text-slate-500">{pegawai.unit_kerja}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">12 Hari Kerja</td>
                      <td className="p-3.5">
                        <span
                          className={`font-extrabold px-3 py-1 rounded-full text-xs inline-block ${
                            isLow
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {sisaCuti} Hari Sisa
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        Cuti Tahunan (3 Hari) - Disetujui
                      </td>
                      <td className="p-3.5 text-right">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleOpenActionModal(pegawai, 'cuti')}
                            className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Input Pengajuan Cuti</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSendNotification(pegawai, 'Pengajuan Cuti Tahunan', `Sisa cuti tahunan saat ini: ${pegawai.sisa_cuti_tahunan ?? 12} Hari Kerja. Imbauan verifikasi pengajuan cuti.`)}
                            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Pemberitahuan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredPegawai.map((pegawai) => {
              const sisaCuti = pegawai.sisa_cuti_tahunan ?? 12;
              const isLow = sisaCuti <= 3;
              return (
                <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {pegawai.nama_lengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{pegawai.unit_kerja}</div>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                        isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sisaCuti} Hari Sisa
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Hak Tahunan: <strong>12 Hari</strong></span>
                    <span className="text-slate-700 font-medium">Status: Pengajuan Aktif</span>
                  </div>

                  <div className="pt-1">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => handleOpenActionModal(pegawai, 'cuti')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Input Pengajuan Cuti</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSendNotification(pegawai, 'Pengajuan Cuti Tahunan', `Sisa cuti tahunan saat ini: ${pegawai.sisa_cuti_tahunan ?? 12} Hari Kerja. Imbauan verifikasi pengajuan cuti.`)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pemberitahuan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PENSIUN BUP & HABIS MASA KONTRAK */}
      {activeSubTab === 'pensiun' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Pemantauan Batas Usia Pensiun (BUP) PNS & Habis Masa Kontrak (PPPK / Non-ASN)</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                BUP PNS (58/60/65 Thn), Akhir Kontrak Perjanjian Kerja PPPK (5 Thn) & Akhir Masa SK Non-ASN (1 Thn)
              </p>
            </div>
            <span className="bg-rose-100 text-rose-900 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              {filteredPensiunAlerts.length} Mendekati BUP / Habis Kontrak
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai & Identitas</th>
                  <th className="p-3.5">Status Kepegawaian & Jabatan</th>
                  <th className="p-3.5">Usia Saat Ini</th>
                  <th className="p-3.5">TMT Pensiun / Akhir Kontrak</th>
                  <th className="p-3.5">Status Progres & Rekomendasi</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPensiunAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      Tidak ada pegawai yang mendekati BUP atau habis masa kontrak dalam 18 bulan ke depan.
                    </td>
                  </tr>
                ) : (
                  filteredPensiunAlerts.map((item) => {
                    const statusKeg = item.status_kepegawaian || 'PNS';
                    const isPns = statusKeg === 'PNS';
                    const isPppk = statusKeg.includes('PPPK');

                    return (
                      <tr key={item.nip} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1E293B]">{item.nama_lengkap}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">
                            {isPns ? 'NIP: ' : isPppk ? 'NI PPPK: ' : 'NIK: '}{item.nip}
                          </div>
                          <div className="text-[10px] text-slate-500">{item.unit_kerja}</div>
                        </td>
                        <td className="p-3.5 font-medium text-[#334155]">
                          <div className="flex items-center space-x-1.5 mb-1">
                            {isPns ? (
                              <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                PNS
                              </span>
                            ) : isPppk ? (
                              <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                {statusKeg}
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Non-ASN (PKWT)
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-800">{item.jenis_jabatan}</div>
                          <div className="text-[11px] text-slate-500">
                            {isPns
                              ? `BUP: ${item.batas_usia_pensiun} Tahun`
                              : isPppk
                              ? 'Perjanjian Kerja 5 Tahun'
                              : 'SK Kontrak PKWT Tahunan'}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#334155]">{item.umur_saat_ini} Tahun</td>
                        <td className="p-3.5">
                          <div className="font-bold text-red-900 text-xs">
                            {formatDateIndonesian(item.tanggal_pensiun)}
                          </div>
                          <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                            Sisa: {item.sisa_bulan} Bulan Lagi
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isPns
                                ? 'bg-amber-100 text-amber-900'
                                : isPppk
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            <span>{item.status_alert}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {isSuperAdmin ? (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-block">
                              Proses BUP Dinkes
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                const peg = activePegawai.find((p) => p.nip === item.nip);
                                if (peg) handleOpenSendNotification(peg, 'Pensiun BUP / Masa Kontrak', `Jatuh tempo BUP/Kontrak pada ${formatDateIndonesian(item.tanggal_pensiun)}. Imbauan pengurusan berkas pensiun/kontrak.`);
                              }}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredPensiunAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Tidak ada pegawai yang mendekati BUP atau habis masa kontrak dalam 18 bulan ke depan.
              </div>
            ) : (
              filteredPensiunAlerts.map((item) => {
                const statusKeg = item.status_kepegawaian || 'PNS';
                const isPns = statusKeg === 'PNS';
                const isPppk = statusKeg.includes('PPPK');

                return (
                  <div key={item.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                          {item.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {isPns ? 'NIP: ' : isPppk ? 'NI PPPK: ' : 'NIK: '}{item.nip}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">{item.unit_kerja}</div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isPns ? 'bg-blue-100 text-blue-800' : isPppk ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {statusKeg}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Usia Saat Ini</span>
                        <span className="font-bold text-slate-800 text-[11px]">{item.umur_saat_ini} Tahun</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">TMT BUP / Selesai Kontrak</span>
                        <span className="font-bold text-red-800 text-[11px]">{formatDateIndonesian(item.tanggal_pensiun)}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSuperAdmin ? (
                        <div className="bg-rose-50 text-rose-800 text-xs font-bold p-2 rounded-lg text-center border border-rose-200">
                          Proses BUP Dinkes ({item.sisa_bulan} Bulan Lagi)
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const peg = activePegawai.find((p) => p.nip === item.nip);
                            if (peg) handleOpenSendNotification(peg, 'Pensiun BUP / Masa Kontrak', `Jatuh tempo BUP/Kontrak pada ${formatDateIndonesian(item.tanggal_pensiun)}. Imbauan pengurusan berkas pensiun/kontrak.`);
                          }}
                          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pemberitahuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: IZIN & TUGAS BELAJAR */}
      {activeSubTab === 'izin_belajar' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Pemantauan Pegawai Izin Belajar & Tugas Belajar</span>
              </h3>
              <p className="text-xs text-[#64748B]">Sesuai SE MenPANRB No. 28 Tahun 2021 tentang Pengembangan Kompetensi Pegawai ASN.</p>
            </div>
            <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              {izinBelajarCount} Pegawai Aktif Belajar
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai</th>
                  <th className="p-3.5">Program Studi & Perguruan Tinggi</th>
                  <th className="p-3.5">Status SK Belajar</th>
                  <th className="p-3.5">Progres Semester</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const izinBelajarList = filteredPegawai.filter((p) => Boolean(p.status_izin_belajar));
                  if (izinBelajarList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          Tidak ada data pegawai yang sedang izin/tugas belajar saat ini.
                        </td>
                      </tr>
                    );
                  }
                  return izinBelajarList.map((pegawai) => (
                    <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                        <div className="text-[11px] text-slate-500">{pegawai.unit_kerja}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        <div className="font-bold text-indigo-900">
                          {pegawai.program_studi || 'S-2 Magister Kesehatan Masyarakat'}
                        </div>
                        <div className="text-[11px] text-slate-500">{pegawai.nama_universitas_pt || 'Universitas Mataram'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-indigo-100 text-indigo-900 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          SK IZIN BELAJAR AKTIF
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {pegawai.progres_semester || 'Semester 4'}
                      </td>
                      <td className="p-3.5 text-right">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleOpenActionModal(pegawai, 'izin_belajar')}
                            className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Progres</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSendNotification(pegawai, 'Izin / Tugas Belajar', 'Pemberitahuan pemutakhiran Laporan Progres Semester Pendidikan Bangkom.')}
                            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Pemberitahuan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {(() => {
              const izinBelajarList = filteredPegawai.filter((p) => Boolean(p.status_izin_belajar));
              if (izinBelajarList.length === 0) {
                return (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs">Tidak ada data pegawai yang sedang izin/tugas belajar saat ini.</p>
                  </div>
                );
              }
              return izinBelajarList.map((pegawai) => (
                <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {pegawai.nama_lengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{pegawai.unit_kerja}</div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      AKTIF
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                    <div className="font-bold text-indigo-900">
                      {pegawai.program_studi || 'S-2 Magister Kesehatan Masyarakat'}
                    </div>
                    <div className="text-[11px] text-slate-500">{pegawai.nama_universitas_pt || 'Universitas Mataram'}</div>
                    <div className="text-[11px] text-slate-700 font-semibold pt-0.5">
                      Progres: {pegawai.progres_semester || 'Semester 4'}
                    </div>
                  </div>

                  <div className="pt-1">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => handleOpenActionModal(pegawai, 'izin_belajar')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Progres</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSendNotification(pegawai, 'Izin / Tugas Belajar', 'Pemberitahuan pemutakhiran Laporan Progres Semester Pendidikan Bangkom.')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pemberitahuan</span>
                      </button>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* SUB-TAB 9: PENCANTUMAN GELAR */}
      {activeSubTab === 'pencantuman_gelar' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Pemantauan Usulan Pencantuman Gelar Akademik di BKN</span>
              </h3>
              <p className="text-xs text-[#64748B]">Verifikasi Validasi Ijazah & Akreditasi Perguruan Tinggi Terdaftar BKN.</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai</th>
                  <th className="p-3.5">Gelar Akademik Diusulkan</th>
                  <th className="p-3.5">Akreditasi Perguruan Tinggi</th>
                  <th className="p-3.5">Status Verval BKN</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const gelarList = filteredPegawai.filter(isPegawaiPencantumanGelar);
                  if (gelarList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          Tidak ada data usulan pencantuman gelar akademik saat ini.
                        </td>
                      </tr>
                    );
                  }
                  return gelarList.map((pegawai) => {
                    const statusGelar = pegawai.status_pencantuman_gelar || 'Terverifikasi BKN';
                    const gelarDisplay = [pegawai.gelar_depan, pegawai.gelar_belakang].filter(Boolean).join(' ') || 'Gelar Akademik';

                    return (
                      <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                          <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                        </td>
                        <td className="p-3.5 font-bold text-blue-900">
                          {gelarDisplay}
                        </td>
                        <td className="p-3.5 font-medium text-emerald-800">
                          <div className="font-bold text-emerald-900">
                            {pegawai.akreditasi_pt || 'BAN-PT Akreditasi A (Unggul)'}
                          </div>
                          <div className="text-[11px] text-slate-500">{pegawai.nama_universitas_pt || 'Universitas Mataram'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                            {statusGelar.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleOpenActionModal(pegawai, 'gelar')}
                              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Input Pertek Gelar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSendNotification(pegawai, 'Pencantuman Gelar', 'Pemberitahuan verifikasi Ijazah & Surat Keterangan Verval BKN.')}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {(() => {
              const gelarList = filteredPegawai.filter(isPegawaiPencantumanGelar);
              if (gelarList.length === 0) {
                return (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs">Tidak ada data usulan pencantuman gelar akademik saat ini.</p>
                  </div>
                );
              }
              return gelarList.map((pegawai) => {
                const statusGelar = pegawai.status_pencantuman_gelar || 'Terverifikasi BKN';
                const gelarDisplay = [pegawai.gelar_depan, pegawai.gelar_belakang].filter(Boolean).join(' ') || 'Gelar Akademik';

                return (
                  <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                          {pegawai.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        {statusGelar.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Gelar Diusulkan</span>
                        <span className="font-bold text-blue-900">{gelarDisplay}</span>
                      </div>
                      <div className="text-[11px] text-emerald-900 font-semibold">
                        {pegawai.akreditasi_pt || 'BAN-PT Akreditasi A (Unggul)'} - {pegawai.nama_universitas_pt || 'Universitas Mataram'}
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSuperAdmin ? (
                        <button
                          onClick={() => handleOpenActionModal(pegawai, 'gelar')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Input Pertek Gelar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSendNotification(pegawai, 'Pencantuman Gelar', 'Pemberitahuan verifikasi Ijazah & Surat Keterangan Verval BKN.')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pemberitahuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* SUB-TAB 10: MUTASI KEPEGAWAIAN */}
      {activeSubTab === 'mutasi' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#2563EB] shrink-0" />
                <span>Pemantauan Usulan Mutasi & Rotasi Unit Kerja</span>
              </h3>
              <p className="text-xs text-[#64748B]">Mutasi Internal Puskesmas/RSUD, Rotasi Jabatan, dan Penyesuaian ABK Dikes.</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Pegawai</th>
                  <th className="p-3.5">Unit Kerja Saat Ini</th>
                  <th className="p-3.5">Jenis Mutasi / Rotasi</th>
                  <th className="p-3.5">Status SK Mutasi</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const mutasiList = filteredPegawai.filter(isPegawaiMutasi);
                  if (mutasiList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          Tidak ada data usulan mutasi atau rotasi unit kerja saat ini.
                        </td>
                      </tr>
                    );
                  }
                  return mutasiList.map((pegawai) => (
                    <tr key={pegawai.nip} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#1E293B]">{pegawai.nama_lengkap}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">NIP: {pegawai.nip}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {pegawai.unit_kerja}
                      </td>
                      <td className="p-3.5 font-semibold text-indigo-900">
                        {pegawai.jenis_mutasi || 'Mutasi Internal / Rotasi Jabatan'}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          SELESAI / AKTIF
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isSuperAdmin ? (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(pegawai, 'mutasi')}
                                className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Update Unit</span>
                              </button>
                              <button
                                onClick={() => onOpenUploadSkModal(pegawai.nip, 'Mutasi')}
                                className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                              >
                                <FileUp className="w-3.5 h-3.5" />
                                <span>SK Mutasi</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenSendNotification(pegawai, 'Mutasi / Rotasi Unit', `Laporan usulan mutasi/rotasi unit kerja saat ini (${pegawai.unit_kerja}).`)}
                              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Pemberitahuan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {(() => {
              const mutasiList = filteredPegawai.filter(isPegawaiMutasi);
              if (mutasiList.length === 0) {
                return (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs">Tidak ada data usulan mutasi atau rotasi unit kerja saat ini.</p>
                  </div>
                );
              }
              return mutasiList.map((pegawai) => (
                <div key={pegawai.nip} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        {pegawai.nama_lengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP: {pegawai.nip}</div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      SELESAI / AKTIF
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Unit Penempatan</span>
                      <span className="font-bold text-slate-800">{pegawai.unit_kerja}</span>
                    </div>
                    <div className="text-[11px] text-indigo-900 font-semibold">
                      {pegawai.jenis_mutasi || 'Mutasi Internal / Rotasi Jabatan'}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-1.5">
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => handleOpenActionModal(pegawai, 'mutasi')}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update Unit</span>
                        </button>
                        <button
                          onClick={() => onOpenUploadSkModal(pegawai.nip, 'Mutasi')}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>SK Mutasi</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenSendNotification(pegawai, 'Mutasi / Rotasi Unit', `Laporan usulan mutasi/rotasi unit kerja saat ini (${pegawai.unit_kerja}).`)}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pemberitahuan</span>
                      </button>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* SUB-TAB 11: KP4 ANAK */}
      {activeSubTab === 'kp4' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-[#1E293B] text-base flex items-center space-x-2">
                <Baby className="w-5 h-5 text-red-600 shrink-0" />
                <span>Peringatan Batas Usia Anak KP4 (Tunjangan Keluarga)</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pencegahan Temuan BPK: Batas 21 thn (wajib Surat Ket Kuliah) & Batas Maksimal 25 thn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddKp4ModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Data Keluarga KP4</span>
              </button>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                {filteredKp4Alerts.length} Perlu Cek Berkas
              </span>
            </div>
          </div>

          {filteredKp4Alerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-medium text-sm text-[#1E293B]">Tanggungan KP4 Anak Bersih</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredKp4Alerts.map((item) => (
                <div key={item.id} className="p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {item.kategori_alert}
                      </span>
                      <h4 className="font-bold text-[#1E293B] text-sm">{item.nama_anak}</h4>
                      <span className="text-xs text-[#64748B]">
                        ({item.umur_tahun} Thn {item.umur_bulan} Bln)
                      </span>
                    </div>

                    <p className="text-xs text-[#334155]">
                      <strong>Orang Tua (Pegawai):</strong> {item.nama_pegawai} (NIP: {item.nip_pegawai})
                    </p>
                    <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-lg leading-relaxed border border-amber-200">
                      💡 <strong>Rekomendasi BPK:</strong> {item.rekomendasi_aksi}
                    </p>
                  </div>

                  <div className="w-full md:w-auto shrink-0">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => onUpdateKp4Tanggungan(item.id, false)}
                        className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Keluarkan Dari Tanggungan</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const peg = activePegawai.find((p) => p.nip === item.nip_pegawai);
                          if (peg) handleOpenSendNotification(peg, 'KP4 Tunjangan Anak', `Anak a.n ${item.nama_anak} (${item.umur_tahun} Thn). ${item.rekomendasi_aksi}`);
                        }}
                        className="w-full md:w-auto inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pemberitahuan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* QUICK ACTION MODAL FOR MONITORING UPDATES */}
      {modalType && selectedPegawaiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    Update Pemantauan: {selectedPegawaiModal.nama_lengkap}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      selectedPegawaiModal.status_kepegawaian === 'PNS'
                        ? 'bg-blue-100 text-blue-900'
                        : selectedPegawaiModal.status_kepegawaian === 'PPPK Penuh Waktu'
                        ? 'bg-emerald-100 text-emerald-900'
                        : selectedPegawaiModal.status_kepegawaian === 'PPPK Paruh Waktu'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {selectedPegawaiModal.status_kepegawaian}
                  </span>
                  <p className="text-xs text-blue-200 font-mono">NIP: {selectedPegawaiModal.nip}</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              {/* STATUS KEPEGAWAIAN RULE BANNER */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aturan Pemantauan - {selectedPegawaiModal.status_kepegawaian}</span>
                </div>
                {selectedPegawaiModal.status_kepegawaian === 'Non-ASN' && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Pegawai Non-ASN dipantau khusus untuk Kontrak Kerja & Cuti. Fitur PAK/Jafung, UKKJ, Ujian Dinas, dan Pertek Gelar BKN tidak berlaku.
                  </p>
                )}
                {selectedPegawaiModal.status_kepegawaian === 'PPPK Paruh Waktu' && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    PPPK Paruh Waktu dipantau melalui Predikat SKP & AK Konversi Tahunan. Tidak disyaratkan PAK Kumulatif Kenaikan Jenjang maupun Ujian Dinas.
                  </p>
                )}
                {selectedPegawaiModal.status_kepegawaian === 'PPPK Penuh Waktu' && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    PPPK Penuh Waktu memiliki Angka Kredit (AK) Konversi SKP, Hak Cuti 12 Hari, KGB 2 Tahunan, dan UKKJ untuk Kenaikan Jenjang.
                  </p>
                )}
                {selectedPegawaiModal.status_kepegawaian === 'PNS' && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    PNS memiliki skema pemantauan penuh: Kenaikan Pangkat (6 Periode BKN), KGB, PAK Integrasi, UKKJ, Ujian Dinas STLUD, Cuti, & Pertek Gelar.
                  </p>
                )}
              </div>

              {/* PAK / SKP JAFUNG */}
              {modalType === 'pak_jafung' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Predikat Kinerja SKP (PermenPANRB 1/2023)</label>
                    <select
                      value={modalFormData.predikat_skp}
                      onChange={(e) => setModalFormData({ ...modalFormData, predikat_skp: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Sangat Baik">Sangat Baik (150% Koefisien AK)</option>
                      <option value="Baik">Baik (100% Koefisien AK)</option>
                      <option value="Cukup">Cukup / Butuh Perbaikan (75% Koefisien AK)</option>
                      <option value="Kurang">Kurang (50% Koefisien AK)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">AK Konversi SKP Tahunan</label>
                    <input
                      type="number"
                      step="0.1"
                      value={modalFormData.angka_kredit_konversi}
                      onChange={(e) => setModalFormData({ ...modalFormData, angka_kredit_konversi: parseFloat(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {(selectedPegawaiModal.status_kepegawaian === 'PNS' || selectedPegawaiModal.status_kepegawaian === 'PPPK Penuh Waktu') && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Total AK Kumulatif (PAK Integrasi)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={modalFormData.total_ak_kumulatif}
                          onChange={(e) => setModalFormData({ ...modalFormData, total_ak_kumulatif: parseFloat(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Jenjang Jabatan Fungsional</label>
                        <select
                          value={modalFormData.jenjang_jabatan}
                          onChange={(e) => setModalFormData({ ...modalFormData, jenjang_jabatan: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Ahli Pertama">Ahli Pertama</option>
                          <option value="Ahli Muda">Ahli Muda</option>
                          <option value="Ahli Madya">Ahli Madya</option>
                          <option value="Ahli Utama">Ahli Utama</option>
                          <option value="Kategori Keterampilan">Kategori Keterampilan</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* UKKJ */}
              {modalType === 'ukom' && (
                <div className="space-y-3">
                  {selectedPegawaiModal.status_kepegawaian === 'Non-ASN' || selectedPegawaiModal.status_kepegawaian === 'PPPK Paruh Waktu' ? (
                    <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium">
                      ⚠️ UKKJ (Uji Kompetensi Kenaikan Jenjang) tidak dipersyaratkan untuk status {selectedPegawaiModal.status_kepegawaian}.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Status Hasil UKKJ BKN / Kemenkes</label>
                      <select
                        value={modalFormData.status_ukom}
                        onChange={(e) => setModalFormData({ ...modalFormData, status_ukom: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Lulus UKKJ">Lulus UKKJ - Rekomendasi Terbit</option>
                        <option value="Dalam Proses UKKJ">Dalam Proses UKKJ / Gelombang Berjalan</option>
                        <option value="Belum UKKJ">Belum UKKJ / Persiapan</option>
                        <option value="Bukan Jafung">Bukan Jabatan Fungsional</option>
                        <option value="Tidak ada">Tidak ada</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* UJIAN DINAS */}
              {modalType === 'ujian_dinas' && (
                <div className="space-y-3">
                  {selectedPegawaiModal.status_kepegawaian !== 'PNS' ? (
                    <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium">
                      ⚠️ Ujian Dinas STLUD khusus berlaku untuk Pegawai Negeri Sipil (PNS) Jabatan Pelaksana. Status {selectedPegawaiModal.status_kepegawaian} dikecualikan.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Status STLUD Ujian Dinas Pelaksana</label>
                      <select
                        value={modalFormData.status_ujian_dinas}
                        onChange={(e) => setModalFormData({ ...modalFormData, status_ujian_dinas: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Lulus STLUD">Lulus STLUD BKN Terbit</option>
                        <option value="Belum Ujian Dinas">Belum Ujian Dinas / Terdaftar</option>
                        <option value="Penyesuaian Ijazah">Bebas Ujian Dinas (Syarat Penyesuaian Ijazah)</option>
                        <option value="Bukan Pelaksana">Bukan Jabatan Pelaksana</option>
                        <option value="Tidak ada">Tidak ada</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* CUTI */}
              {modalType === 'cuti' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Sisa Cuti Saat Ini</label>
                      <input
                        type="number"
                        value={modalFormData.sisa_cuti}
                        onChange={(e) => setModalFormData({ ...modalFormData, sisa_cuti: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Jumlah Hari Cuti Diambil</label>
                      <input
                        type="number"
                        value={modalFormData.jumlah_hari_cuti}
                        onChange={(e) => setModalFormData({ ...modalFormData, jumlah_hari_cuti: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 text-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jenis Cuti</label>
                    <select
                      value={modalFormData.jenis_cuti}
                      onChange={(e) => setModalFormData({ ...modalFormData, jenis_cuti: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cuti Tahunan">Cuti Tahunan</option>
                      <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                      <option value="Cuti Besar">Cuti Besar</option>
                      <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                      <option value="Cuti Sakit">Cuti Sakit</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-semibold flex items-center justify-between">
                    <span>Estimasi Sisa Cuti Baru:</span>
                    <strong className="text-sm font-extrabold text-emerald-800">
                      {Math.max(0, (modalFormData.sisa_cuti || 12) - (modalFormData.jumlah_hari_cuti || 0))} Hari
                    </strong>
                  </div>
                </div>
              )}

              {/* PENCANTUMAN GELAR */}
              {modalType === 'gelar' && (
                <div className="space-y-3">
                  {selectedPegawaiModal.status_kepegawaian === 'Non-ASN' || selectedPegawaiModal.status_kepegawaian === 'PPPK Paruh Waktu' ? (
                    <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium">
                      ⚠️ Pencantuman Gelar Pertek BKN berlaku untuk PNS & PPPK Penuh Waktu yang menyelesaikan Izin / Tugas Belajar.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Status Pencantuman Gelar BKN</label>
                        <select
                          value={modalFormData.status_pencantuman_gelar}
                          onChange={(e) => setModalFormData({ ...modalFormData, status_pencantuman_gelar: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Terverifikasi BKN">Terverifikasi BKN (Pertek Terbit)</option>
                          <option value="Proses Verval">Proses Verval / Pengajuan BKN</option>
                          <option value="Belum Pengajuan">Belum Pengajuan Pertek</option>
                          <option value="Bukan Tugas Belajar">Bukan Tugas Belajar</option>
                          <option value="Tidak ada">Tidak ada</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Gelar Depan (misal: dr.)</label>
                          <input
                            type="text"
                            placeholder="Contoh: dr."
                            value={modalFormData.gelar_depan}
                            onChange={(e) => setModalFormData({ ...modalFormData, gelar_depan: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Gelar Belakang (misal: M.Kes.)</label>
                          <input
                            type="text"
                            placeholder="Contoh: M.Kes., S.Tr.Kes."
                            value={modalFormData.gelar_belakang}
                            onChange={(e) => setModalFormData({ ...modalFormData, gelar_belakang: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Nama Perguruan Tinggi</label>
                        <input
                          type="text"
                          placeholder="Contoh: Universitas Mataram / Poltekkes Kemenkes"
                          value={modalFormData.instansi_pendidikan}
                          onChange={(e) => setModalFormData({ ...modalFormData, instansi_pendidikan: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Akreditasi Perguruan Tinggi (BAN-PT / LAM-PTKes)*</label>
                        <select
                          value={modalFormData.akreditasi_pt || 'Unggul (A)'}
                          onChange={(e) => setModalFormData({ ...modalFormData, akreditasi_pt: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="BAN-PT Akreditasi A (Unggul)">BAN-PT Akreditasi A (Unggul)</option>
                          <option value="BAN-PT Akreditasi B (Baik Sekali)">BAN-PT Akreditasi B (Baik Sekali)</option>
                          <option value="BAN-PT Akreditasi C (Baik)">BAN-PT Akreditasi C (Baik)</option>
                          <option value="Akreditasi Internasional">Akreditasi Internasional</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* KGB */}
              {modalType === 'kgb' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">TMT KGB Terakhir</label>
                    <input
                      type="date"
                      value={modalFormData.tmt_kgb_terakhir}
                      onChange={(e) => setModalFormData({ ...modalFormData, tmt_kgb_terakhir: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Masa Kerja (Tahun)</label>
                      <input
                        type="number"
                        value={modalFormData.masa_kerja_tahun}
                        onChange={(e) => setModalFormData({ ...modalFormData, masa_kerja_tahun: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Masa Kerja (Bulan)</label>
                      <input
                        type="number"
                        value={modalFormData.masa_kerja_bulan}
                        onChange={(e) => setModalFormData({ ...modalFormData, masa_kerja_bulan: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PANGKAT */}
              {modalType === 'pangkat' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">TMT Pangkat Terakhir:*</label>
                    <input
                      type="date"
                      value={modalFormData.tmt_pangkat_terakhir}
                      onChange={(e) => setModalFormData({ ...modalFormData, tmt_pangkat_terakhir: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Golongan / Ruang:*</label>
                      <select
                        value={modalFormData.golongan_pangkat}
                        onChange={(e) => {
                          const val = e.target.value;
                          const mapNama: Record<string, string> = {
                            'I/a': 'Juru Muda',
                            'I/b': 'Juru Muda Tk. I',
                            'I/c': 'Juru',
                            'I/d': 'Juru Tk. I',
                            'II/a': 'Pengatur Muda',
                            'II/b': 'Pengatur Muda Tk. I',
                            'II/c': 'Pengatur',
                            'II/d': 'Pengatur Tk. I',
                            'III/a': 'Penata Muda',
                            'III/b': 'Penata Muda Tk. I',
                            'III/c': 'Penata',
                            'III/d': 'Penata Tk. I',
                            'IV/a': 'Pembina',
                            'IV/b': 'Pembina Tk. I',
                            'IV/c': 'Pembina Utama Muda',
                            'IV/d': 'Pembina Utama Madya',
                            'IV/e': 'Pembina Utama',
                          };
                          setModalFormData({
                            ...modalFormData,
                            golongan_pangkat: val,
                            nama_pangkat: mapNama[val] || modalFormData.nama_pangkat,
                          });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="I/a">I/a (Juru Muda)</option>
                        <option value="I/b">I/b (Juru Muda Tk. I)</option>
                        <option value="I/c">I/c (Juru)</option>
                        <option value="I/d">I/d (Juru Tk. I)</option>
                        <option value="II/a">II/a (Pengatur Muda)</option>
                        <option value="II/b">II/b (Pengatur Muda Tk. I)</option>
                        <option value="II/c">II/c (Pengatur)</option>
                        <option value="II/d">II/d (Pengatur Tk. I)</option>
                        <option value="III/a">III/a (Penata Muda)</option>
                        <option value="III/b">III/b (Penata Muda Tk. I)</option>
                        <option value="III/c">III/c (Penata)</option>
                        <option value="III/d">III/d (Penata Tk. I)</option>
                        <option value="IV/a">IV/a (Pembina)</option>
                        <option value="IV/b">IV/b (Pembina Tk. I)</option>
                        <option value="IV/c">IV/c (Pembina Utama Muda)</option>
                        <option value="IV/d">IV/d (Pembina Utama Madya)</option>
                        <option value="IV/e">IV/e (Pembina Utama)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nama Pangkat:*</label>
                      <input
                        type="text"
                        value={modalFormData.nama_pangkat}
                        onChange={(e) => setModalFormData({ ...modalFormData, nama_pangkat: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor SK Kenaikan Pangkat (Opsional / Terbit):</label>
                    <input
                      type="text"
                      placeholder="Contoh: 823/045/BKPSDM/2026"
                      value={modalFormData.no_sk_pangkat || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, no_sk_pangkat: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* MUTASI */}
              {modalType === 'mutasi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Ketentuan Update Unit Kerja / Mutasi</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Menyimpan perubahan unit kerja ini akan otomatis memindahkan status data pegawai bersangkutan ke <strong>Daftar Pegawai Non-Aktif (Mutasi Out / Pindah Satker)</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jenis Mutasi / Rotasi</label>
                    <input
                      type="text"
                      value={modalFormData.jenis_mutasi || 'Mutasi Out / Pindah Unit Kerja'}
                      onChange={(e) => setModalFormData({ ...modalFormData, jenis_mutasi: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit Kerja / Satuan Kerja Baru</label>
                    <input
                      type="text"
                      value={modalFormData.unit_kerja}
                      onChange={(e) => setModalFormData({ ...modalFormData, unit_kerja: e.target.value })}
                      placeholder="Contoh: Dikes Mataram / RSUD Kota Mataram / Puskesmas Selaparang"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* IZIN BELAJAR */}
              {modalType === 'izin_belajar' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status SK Izin / Tugas Belajar</label>
                    <select
                      value={modalFormData.status_izin_belajar ? 'aktif' : 'tidak'}
                      onChange={(e) => setModalFormData({ ...modalFormData, status_izin_belajar: e.target.value === 'aktif' })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aktif">Aktif Menjalani Izin / Tugas Belajar</option>
                      <option value="tidak">Tidak / Sudah Selesai</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Perguruan Tinggi / Instansi Pendidikan*</label>
                    <input
                      type="text"
                      value={modalFormData.instansi_pendidikan}
                      onChange={(e) => setModalFormData({ ...modalFormData, instansi_pendidikan: e.target.value })}
                      placeholder="Contoh: Universitas Mataram / Poltekkes Kemenkes"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Program Studi*</label>
                    <input
                      type="text"
                      value={modalFormData.program_studi || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, program_studi: e.target.value })}
                      placeholder="Contoh: S-2 Magister Kesehatan Masyarakat / S-1 Keperawatan"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Progres Semester*</label>
                    <select
                      value={modalFormData.progres_semester || 'Semester 4'}
                      onChange={(e) => setModalFormData({ ...modalFormData, progres_semester: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4 (Penyusunan Tesis / Skripsi)">Semester 4 (Penyusunan Tesis / Skripsi)</option>
                      <option value="Semester 5+">Semester 5+</option>
                      <option value="Lulus / Pendidikan Selesai">Lulus / Pendidikan Selesai</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan & Sinkronkan SIMPEG</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH DATA KELUARGA KP4 */}
      {isAddKp4ModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Baby className="w-5 h-5" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Data Keluarga KP4 (Tunjangan)</h3>
              </div>
              <button
                onClick={() => setIsAddKp4ModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onAddKeluarga) {
                  onAddKeluarga({
                    nip_pegawai: kp4FormData.nip_pegawai,
                    nama_keluarga: kp4FormData.nama_keluarga,
                    status_hubungan: kp4FormData.status_hubungan,
                    tanggal_lahir: kp4FormData.tanggal_lahir,
                    status_tanggungan: kp4FormData.status_tanggungan,
                    nama_sekolah_pt: kp4FormData.nama_sekolah_pt,
                    no_surat_kuliah: kp4FormData.no_surat_kuliah,
                    tgl_surat_kuliah: kp4FormData.tgl_surat_kuliah,
                    semester_kuliah: kp4FormData.semester_kuliah,
                    surat_ket_kuliah_url: kp4FormData.surat_ket_kuliah_url,
                  });
                }
                setIsAddKp4ModalOpen(false);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pilih Pegawai ASN*</label>
                <select
                  value={kp4FormData.nip_pegawai}
                  onChange={(e) => setKp4FormData({ ...kp4FormData, nip_pegawai: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {pegawaiList.map((p) => (
                    <option key={p.nip} value={p.nip}>
                      {p.nama_lengkap} (NIP: {p.nip}) - {p.unit_kerja}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Anggota Keluarga*</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Sesuai KK / Akta"
                  value={kp4FormData.nama_keluarga}
                  onChange={(e) => setKp4FormData({ ...kp4FormData, nama_keluarga: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hubungan Keluarga*</label>
                  <select
                    value={kp4FormData.status_hubungan}
                    onChange={(e) => setKp4FormData({ ...kp4FormData, status_hubungan: e.target.value as 'Suami' | 'Istri' | 'Anak' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Anak">Anak</option>
                    <option value="Suami">Suami</option>
                    <option value="Istri">Istri</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Lahir*</label>
                  <input
                    type="date"
                    required
                    value={kp4FormData.tanggal_lahir}
                    onChange={(e) => setKp4FormData({ ...kp4FormData, tanggal_lahir: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {kp4FormData.status_hubungan === 'Anak' && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-red-900">Berkas Pendukung Anak (Kuliah 21-25 thn)</div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Nama Perguruan Tinggi / Sekolah</label>
                    <input
                      type="text"
                      placeholder="Contoh: Universitas Mataram"
                      value={kp4FormData.nama_sekolah_pt}
                      onChange={(e) => setKp4FormData({ ...kp4FormData, nama_sekolah_pt: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">No. Surat Ket Kuliah</label>
                      <input
                        type="text"
                        placeholder="No. Surat Keterangan"
                        value={kp4FormData.no_surat_kuliah}
                        onChange={(e) => setKp4FormData({ ...kp4FormData, no_surat_kuliah: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Semester Kuliah</label>
                      <input
                        type="text"
                        placeholder="Semester 4"
                        value={kp4FormData.semester_kuliah}
                        onChange={(e) => setKp4FormData({ ...kp4FormData, semester_kuliah: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddKp4ModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan Data KP4 & Sinkron</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KIRIM PEMBERITAHUAN PEMANTAUAN (UNTUK ADMIN UNIT KERJA & DINKES) */}
      {notificationModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Kirim Pemberitahuan Pemantauan</h3>
              </div>
              <button
                type="button"
                onClick={() => setNotificationModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotificationSubmit} className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Target Pegawai & Unit</div>
                <div className="text-xs font-bold text-slate-800">
                  {notificationModalData.pegawai.nama_lengkap} (NIP: {notificationModalData.pegawai.nip})
                </div>
                <div className="text-[11px] text-slate-600">
                  Unit Kerja: {notificationModalData.pegawai.unit_kerja} | Modul: <span className="font-bold text-emerald-700">{notificationModalData.jenisPemantauan}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tujuan Pemberitahuan</label>
                <input
                  type="text"
                  readOnly
                  value={notificationModalData.penerima}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subjek Pesan / Surat Pemberitahuan*</label>
                <input
                  type="text"
                  required
                  value={notificationModalData.subjek}
                  onChange={(e) =>
                    setNotificationModalData({
                      ...notificationModalData,
                      subjek: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Isi Pesan Pemberitahuan & Imbauan*</label>
                <textarea
                  required
                  rows={6}
                  value={notificationModalData.pesan}
                  onChange={(e) =>
                    setNotificationModalData({
                      ...notificationModalData,
                      pesan: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNotificationModalData(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pemberitahuan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
