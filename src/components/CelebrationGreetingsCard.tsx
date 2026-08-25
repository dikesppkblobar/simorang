import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cake,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gift,
  Building2,
  Calendar,
  Star,
  CheckCircle2,
  Heart,
  TrendingUp,
  Users,
  Search,
  Check,
  MousePointerClick,
} from 'lucide-react';
import { Pegawai, RiwayatSK } from '../types';

interface CelebrationGreetingsCardProps {
  pegawaiList: Pegawai[];
  skList: RiwayatSK[];
}

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CelebrationGreetingsCard: React.FC<CelebrationGreetingsCardProps> = ({
  pegawaiList,
  skList,
}) => {
  const [activeTab, setActiveTab] = useState<'birthday' | 'promotion'>('birthday');
  const [birthdayIndex, setBirthdayIndex] = useState(0);
  const [promotionIndex, setPromotionIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  // 1. Process Birthday Celebrants from Real Pegawai Database
  const realBirthdays = pegawaiList
    .filter((p) => !p.is_deleted && p.tanggal_lahir && p.tanggal_lahir.includes('-'))
    .map((p) => {
      const parts = p.tanggal_lahir.split('-');
      const birthYear = parseInt(parts[0] || '1990', 10);
      const birthMonth = parseInt(parts[1] || '0', 10);
      const birthDay = parseInt(parts[2] || '0', 10);
      const age = today.getFullYear() - birthYear;

      const isToday = birthMonth === currentMonth && birthDay === currentDay;
      const isThisMonth = birthMonth === currentMonth;

      const namaBulan = BULAN_INDONESIA[birthMonth - 1] || 'Bulan';
      const formattedBirthDate = `${birthDay} ${namaBulan} ${birthYear}`;

      return {
        ...p,
        birthMonth,
        birthDay,
        birthYear,
        age: isNaN(age) ? 35 : age,
        isToday,
        isThisMonth,
        formattedBirthDate,
      };
    })
    .sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.isThisMonth && !b.isThisMonth) return -1;
      if (!a.isThisMonth && b.isThisMonth) return 1;
      return a.birthDay - b.birthDay;
    });

  const birthdayCelebrants = realBirthdays;

  // 2. Process Promotions (Kenaikan Pangkat) from Real Pegawai & SK History Database
  const realPromotions = pegawaiList
    .filter(
      (p) =>
        !p.is_deleted &&
        (p.golongan_pangkat || p.status_kepegawaian === 'PNS' || p.tmt_pangkat_terakhir)
    )
    .map((p) => {
      // Find matching promotion SK in database
      const skPangkat = skList.find(
        (s) =>
          s.nip_pegawai === p.nip &&
          (s.jenis_sk?.toLowerCase().includes('pangkat') || s.jenis_sk === 'Pangkat')
      );

      const rawTmt = skPangkat?.tmt_berlaku || p.tmt_pangkat_terakhir || p.tmt_golongan || '';
      let formattedTmt = rawTmt;
      if (rawTmt && rawTmt.includes('-')) {
        const parts = rawTmt.split('-');
        const tmtYear = parts[0];
        const tmtMonth = parseInt(parts[1] || '1', 10);
        const tmtDay = parseInt(parts[2] || '1', 10);
        formattedTmt = `${tmtDay} ${BULAN_INDONESIA[tmtMonth - 1] || ''} ${tmtYear}`;
      }

      return {
        ...p,
        pangkat_baru: p.nama_pangkat || 'Penata',
        golongan_baru: p.golongan_pangkat || 'III/c',
        tmt_pangkat: formattedTmt || '-',
        no_sk: skPangkat?.nomor_sk || p.no_sk_pangkat || '-',
      };
    });

  const promotionCelebrants = realPromotions;

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      if (activeTab === 'birthday') {
        setBirthdayIndex((prev) => (prev + 1) % birthdayCelebrants.length);
      } else {
        setPromotionIndex((prev) => (prev + 1) % promotionCelebrants.length);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlay, activeTab, birthdayCelebrants.length, promotionCelebrants.length]);

  const currentBirthday = birthdayCelebrants[birthdayIndex] || birthdayCelebrants[0];
  const currentPromotion = promotionCelebrants[promotionIndex] || promotionCelebrants[0];

  const handleNext = () => {
    if (activeTab === 'birthday') {
      setBirthdayIndex((prev) => (prev + 1) % birthdayCelebrants.length);
    } else {
      setPromotionIndex((prev) => (prev + 1) % promotionCelebrants.length);
    }
  };

  const handlePrev = () => {
    if (activeTab === 'birthday') {
      setBirthdayIndex((prev) => (prev - 1 + birthdayCelebrants.length) % birthdayCelebrants.length);
    } else {
      setPromotionIndex((prev) => (prev - 1 + promotionCelebrants.length) % promotionCelebrants.length);
    }
  };

  const handleSelectBirthday = (index: number) => {
    setBirthdayIndex(index);
    setIsAutoPlay(false);
  };

  const handleSelectPromotion = (index: number) => {
    setPromotionIndex(index);
    setIsAutoPlay(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-950/25 ring-1 ring-slate-900/5 p-4 sm:p-6 md:p-7 overflow-hidden text-slate-800">
      {/* Decorative Gradient Background Aura */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
          activeTab === 'birthday' ? 'bg-amber-300' : 'bg-blue-400'
        }`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
          activeTab === 'birthday' ? 'bg-pink-300' : 'bg-teal-300'
        }`}
      />

      {/* Confetti floating simulation particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 2 === 0 ? '6px' : '8px',
              height: i % 2 === 0 ? '6px' : '4px',
              backgroundColor: ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6'][i % 5],
              top: `${(i * 22) % 90}%`,
              left: `${(i * 26) % 95}%`,
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * 5, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.65, 0.25],
            }}
            transition={{
              duration: 3.5 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* TOP SECTION: Tab Switcher & Navigation */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center space-x-1 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('birthday');
                setSearchQuery('');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'birthday'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake className="w-3 h-3" />
              <span>🎂 Ulang Tahun ASN</span>
              {birthdayCelebrants.length > 0 && (
                <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'birthday' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {birthdayCelebrants.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('promotion');
                setSearchQuery('');
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'promotion'
                  ? 'bg-gradient-to-r from-[#004B87] to-[#00A3AD] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>🎖️ Kenaikan Pangkat</span>
              {promotionCelebrants.length > 0 && (
                <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'promotion' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {promotionCelebrants.length}
                </span>
              )}
            </button>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrev}
              title="Sebelumnya"
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10.5px] font-heading font-semibold text-slate-500 min-w-[30px] text-center">
              {activeTab === 'birthday'
                ? `${birthdayIndex + 1}/${birthdayCelebrants.length}`
                : `${promotionIndex + 1}/${promotionCelebrants.length}`}
            </span>
            <button
              type="button"
              onClick={handleNext}
              title="Selanjutnya"
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Greeting Card with Motion Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'birthday' ? (
            birthdayCelebrants.length > 0 && currentBirthday ? (
              <motion.div
                key={`bday-card-${birthdayIndex}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-2"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-heading font-bold shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>
                      {(currentBirthday as any).isToday
                        ? '🎉 HARI INI BERULANG TAHUN!'
                        : '🎂 BULAN INI BERULANG TAHUN'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>Klik baris tabel di bawah</span>
                  </span>
                </div>

                {/* Celebrant Main Card */}
                <div className="bg-gradient-to-br from-amber-50/90 via-white to-rose-50/90 rounded-xl p-3 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-center sm:text-left">
                  {/* Avatar / Photo with Glowing Ribbon */}
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-200 p-0.5 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center font-heading font-extrabold text-base sm:text-lg text-amber-700 overflow-hidden">
                        {currentBirthday.nama_lengkap
                          .split(' ')
                          .filter((w) => !w.includes('.') && w.length > 2)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('') || 'ASN'}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs"
                    >
                      <Gift className="w-3 h-3" />
                    </motion.div>
                  </div>

                  {/* Information */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="text-sm font-heading font-extrabold text-slate-900 leading-tight truncate">
                      {currentBirthday.nama_lengkap}
                    </div>
                    <div className="text-[10.5px] font-medium text-slate-500">
                      NIP. {currentBirthday.nip}
                    </div>
                    <div className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.2 rounded-md inline-block">
                      {currentBirthday.jabatan_spesifik || 'Tenaga Kesehatan'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10.5px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#004B87] shrink-0" />
                        <span className="truncate max-w-[160px]">{currentBirthday.unit_kerja}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{(currentBirthday as any).formattedBirthDate} ({(currentBirthday as any).age} Th)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heartfelt Congratulations Message */}
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-300/60 text-[11px] text-amber-950 flex items-start space-x-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed font-medium">
                    "Selamat Ulang Tahun! Semoga senantiasa dianugerahi kesehatan, keberkahan usia, dan kelancaran dalam memberikan pengabdian terbaik."
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-amber-50/60 border border-amber-200/60 text-slate-600 space-y-2">
                <Cake className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="font-heading font-bold text-sm text-slate-800">Tidak Ada Ulang Tahun Bulan Ini</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Belum ada data pegawai yang tercatat berulang tahun pada bulan ini di database.
                </p>
              </div>
            )
          ) : (
            promotionCelebrants.length > 0 && currentPromotion ? (
              <motion.div
                key={`prom-card-${promotionIndex}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-2"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-100 text-[#004B87] border border-blue-300 text-[10px] font-heading font-bold shadow-2xs">
                    <Award className="w-3 h-3 text-[#004B87]" />
                    <span>APRESIASI KENAIKAN PANGKAT ASN</span>
                  </div>
                  <span className="text-[10px] text-[#004B87] font-semibold flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>Klik baris tabel di bawah</span>
                  </span>
                </div>

                {/* Celebrant Main Card */}
                <div className="bg-gradient-to-br from-blue-50/90 via-white to-teal-50/90 rounded-xl p-3 border border-blue-200/90 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-center sm:text-left">
                  {/* Avatar / Photo with Glowing Crown */}
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-[#004B87] via-[#00A3AD] to-blue-300 p-0.5 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center font-heading font-extrabold text-base sm:text-lg text-[#004B87] overflow-hidden">
                        {currentPromotion.nama_lengkap
                          .split(' ')
                          .filter((w) => !w.includes('.') && w.length > 2)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('') || 'ASN'}
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-[#00A3AD] rounded-full flex items-center justify-center text-white shadow-xs"
                    >
                      <Star className="w-3 h-3 fill-white" />
                    </motion.div>
                  </div>

                  {/* Information */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="text-sm font-heading font-extrabold text-slate-900 leading-tight truncate">
                      {currentPromotion.nama_lengkap}
                    </div>
                    <div className="text-[10.5px] font-medium text-slate-500">
                      NIP. {currentPromotion.nip}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <span className="text-[10px] font-bold text-white bg-[#004B87] px-1.5 py-0.2 rounded-md shadow-2xs">
                        {(currentPromotion as any).pangkat_baru} ({(currentPromotion as any).golongan_baru})
                      </span>
                      <span className="text-[9.5px] font-semibold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded-md">
                        TMT: {(currentPromotion as any).tmt_pangkat}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[10.5px] text-slate-600">
                      <Building2 className="w-3 h-3 text-[#004B87] shrink-0" />
                      <span className="truncate">{currentPromotion.unit_kerja}</span>
                    </div>
                  </div>
                </div>

                {/* Heartfelt Congratulations Message */}
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-300/60 text-[11px] text-blue-950 flex items-start space-x-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#004B87] shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed font-medium">
                    "Selamat dan sukses atas Kenaikan Pangkat Setingkat Lebih Tinggi! Semoga amanah dan senantiasa berprestasi bagi Lombok Barat."
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-blue-50/60 border border-blue-200/60 text-slate-600 space-y-2">
                <Award className="w-8 h-8 text-[#004B87] mx-auto" />
                <div className="font-heading font-bold text-sm text-slate-800">Tidak Ada Riwayat Kenaikan Pangkat</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Belum ada data riwayat SK kenaikan pangkat pada periode ini di database.
                </p>
              </div>
            )
          )}
        </AnimatePresence>

        {/* INTERACTIVE TABLE SECTION: List of Celebrants with Click-to-Show Greetings */}
        <div className="pt-1.5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1 text-[11px] font-heading font-bold text-slate-800">
              <Users className="w-3 h-3 text-[#004B87]" />
              <span>
                {activeTab === 'birthday'
                  ? 'Daftar ASN Berulang Tahun:'
                  : 'Daftar ASN Kenaikan Pangkat:'}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-500 font-medium">
              (Klik baris untuk ucapan)
            </span>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs bg-white">
            <div className="max-h-28 overflow-y-auto divide-y divide-slate-100 text-xs">
              {activeTab === 'birthday' ? (
                birthdayCelebrants.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-slate-400 italic">
                    Tidak ada ASN berulang tahun pada bulan ini
                  </div>
                ) : (
                  birthdayCelebrants.map((b, idx) => {
                    const isSelected = idx === birthdayIndex;
                    return (
                      <button
                        key={b.nip}
                        type="button"
                        onClick={() => handleSelectBirthday(idx)}
                        className={`w-full text-left p-1.5 sm:p-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100/90 text-amber-950 font-medium ring-1 ring-inset ring-amber-400'
                            : 'hover:bg-amber-50/60 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isSelected
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-bold text-slate-900 text-[11px] truncate flex items-center gap-1">
                              <span>{b.nama_lengkap}</span>
                              {(b as any).isToday && (
                                <span className="px-1 py-0.1 rounded-full bg-rose-500 text-white text-[8px] font-extrabold animate-pulse">
                                  HARI INI
                                </span>
                              )}
                            </div>
                            <div className="text-[9.5px] text-slate-500 truncate">
                              {b.unit_kerja.replace('Puskesmas ', 'PKM ')} • {b.nip}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-semibold text-rose-600">
                            {(b as any).formattedBirthDate}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {(b as any).age} Th
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )
              ) : (
                promotionCelebrants.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-slate-400 italic">
                    Tidak ada riwayat kenaikan pangkat pada periode ini
                  </div>
                ) : (
                  promotionCelebrants.map((p, idx) => {
                    const isSelected = idx === promotionIndex;
                    return (
                      <button
                        key={p.nip}
                        type="button"
                        onClick={() => handleSelectPromotion(idx)}
                        className={`w-full text-left p-1.5 sm:p-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-100/90 text-blue-950 font-medium ring-1 ring-inset ring-[#004B87]/40'
                            : 'hover:bg-blue-50/60 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isSelected
                              ? 'bg-[#004B87] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-bold text-slate-900 text-[11px] truncate">
                              {p.nama_lengkap}
                            </div>
                            <div className="text-[9.5px] text-slate-500 truncate">
                              {p.unit_kerja.replace('Puskesmas ', 'PKM ')} • {p.nip}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-bold text-[#004B87]">
                            {(p as any).pangkat_baru} ({(p as any).golongan_baru})
                          </div>
                          <div className="text-[9px] text-slate-500">
                            TMT: {(p as any).tmt_pangkat}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#004B87] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Live Data Indicator & Auto Play Switcher */}
      <div className="relative z-10 pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-emerald-700">Live SIMPEG</span>
        </span>
        <button
          type="button"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-all text-[9.5px]"
        >
          {isAutoPlay ? '⏸ Pause' : '▶ Putar'}
        </button>
      </div>
    </div>
  );
};
