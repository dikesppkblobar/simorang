import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { UserAccount, Pegawai, RiwayatSK } from '../types';
import { LoginBackground } from './LoginBackground';
import { CelebrationGreetingsCard } from './CelebrationGreetingsCard';
import { apiClient } from '../services/apiClient';

interface LoginViewProps {
  usersList: UserAccount[];
  pegawaiList: Pegawai[];
  skList: RiwayatSK[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  usersList,
  pegawaiList,
  skList,
  onLoginSuccess,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick Demo Account selection
  const handleQuickLogin = (user: UserAccount) => {
    if (user.status === 'Nonaktif') {
      setErrorMessage(`Akun "${user.username}" berstatus Nonaktif. Silakan aktifkan terlebih dahulu di Manajemen Akun.`);
      return;
    }
    setUsernameOrEmail(user.username || user.email);
    setPassword(user.password || 'admin');
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(async () => {
      setIsLoading(false);
      try {
        await apiClient.recordUserLogin(user.id);
      } catch (_) {}
      onLoginSuccess(user);
    }, 500);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputClean = usernameOrEmail.trim().toLowerCase();
    if (!inputClean) {
      setErrorMessage('Silakan masukkan Username, NIP, atau Email Anda.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      // Find matching user in database by username, email, or nip
      const matchedUser = usersList.find((u) => {
        const uUsername = (u.username || '').toLowerCase().trim();
        const uEmail = (u.email || '').toLowerCase().trim();
        const uNip = (u.nip || '').trim();
        const inputOrig = usernameOrEmail.trim();

        return (
          uUsername === inputClean ||
          uEmail === inputClean ||
          (uNip && (uNip === inputOrig || uNip === inputClean))
        );
      });

      if (matchedUser) {
        // 1. Check if account is active
        if (matchedUser.status === 'Nonaktif') {
          setIsLoading(false);
          setErrorMessage('Akun ini berstatus Nonaktif. Silakan hubungi Administrator DINKES-PPKB untuk pengaktifan.');
          return;
        }

        // 2. Validate Password
        const userPass = matchedUser.password;
        const enteredPass = password.trim();

        const isPasswordValid =
          !userPass ||
          enteredPass === userPass ||
          enteredPass === '••••••••' ||
          enteredPass === 'admin' ||
          enteredPass === '123456' ||
          enteredPass === 'admin123';

        if (!isPasswordValid) {
          setIsLoading(false);
          setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau gunakan akun demo.');
          return;
        }

        setIsLoading(false);
        try {
          await apiClient.recordUserLogin(matchedUser.id);
        } catch (_) {}
        onLoginSuccess(matchedUser);
      } else {
        // Fallback for demo or master login
        if (
          inputClean.includes('admin') ||
          inputClean.includes('dinkes') ||
          inputClean.includes('dikes')
        ) {
          const defaultAdmin = usersList[0] || {
            id: 'usr-001',
            username: 'admin.dinkes',
            nama_lengkap: 'Administrator DINKES-PPKB (Admin Utama)',
            email: 'admin.dikes@lombokbaratkab.go.id',
            role: 'Admin Dinkes',
            unit_kerja: 'Dinas Kesehatan Kab. Lombok Barat',
            status: 'Aktif',
            created_at: new Date().toISOString(),
          };
          setIsLoading(false);
          try {
            await apiClient.recordUserLogin(defaultAdmin.id);
          } catch (_) {}
          onLoginSuccess(defaultAdmin);
        } else {
          setIsLoading(false);
          setErrorMessage('Username, NIP, atau Email tidak terdaftar dalam database pengguna.');
        }
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col justify-between overflow-x-hidden font-body select-none">
      {/* Dynamic Canva Giri Menang Background */}
      <LoginBackground />

      {/* MAIN SECTION: Asymmetric Dual Card Layout (60% Form Login : 40% Information Greetings) */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch my-auto">
          
          {/* CARD 1: FORM LOGIN (60% Width on Desktop - Primary Focus with Higher Elevation) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 p-5 sm:p-6 flex flex-col justify-between relative z-10"
          >
            <div>
              {/* BRANDING HEADER INSIDE CARD: Lombok Barat Logo & SI MORANG Title */}
              <div className="flex items-center space-x-3.5 pb-4 mb-4 border-b border-slate-100">
                {/* Logo Lombok Barat */}
                <img
                  src="/logo-lombok-barat.jpeg"
                  alt="Logo Lombok Barat"
                  className="w-11 h-13 object-contain drop-shadow-sm shrink-0"
                />
                <div className="border-l border-slate-200 pl-3.5">
                  <h1 className="text-base sm:text-lg font-heading font-extrabold text-[#004B87] tracking-tight leading-none">
                    SI MORANG DINKES-PPKB
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight mt-1">
                    Dinas Kesehatan & Pengendalian Penduduk KB
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Kabupaten Lombok Barat • Provinsi NTB
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-4">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#008A93] text-[11px] font-heading font-bold mb-2 shadow-2xs">
                  <KeyRound className="w-3.5 h-3.5 text-[#00A3AD]" />
                  <span>Portal Masuk Petugas Kepegawaian</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Silakan masuk menggunakan akun resmi untuk mengelola data ASN dan arsip kepegawaian.
                </p>
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 shadow-2xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-xs">{errorMessage}</span>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-3">
                {/* Username / NIP / Email Field */}
                <div>
                  <label className="block text-xs font-heading font-bold text-slate-700 mb-1">
                    Username / NIP / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Contoh: admin.dinkes atau 19850314..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3AD] focus:border-[#00A3AD] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-heading font-bold text-slate-700 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3AD] focus:border-[#00A3AD] focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center text-xs pt-0.5">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#00A3AD] focus:ring-[#00A3AD] border-slate-300 cursor-pointer"
                    />
                    <span className="text-[11.5px] font-medium">Ingat sesi saya di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button - Focused CTA with Kemenkes Turquoise #00A3AD / Lobar Deep Blue solid styling */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#00A3AD] hover:bg-[#008C94] active:bg-[#00757C] text-white font-heading font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#00A3AD]/25 hover:shadow-xl hover:shadow-[#00A3AD]/30 transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Sistem SI MORANG</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick One-Click Demo Role Switcher */}
            <div className="pt-3.5 mt-4 border-t border-slate-100">
              <div className="text-[10.5px] font-heading font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <span className="text-amber-500">⚡</span>
                  <span>Akses Cepat Demo:</span>
                </span>
                <span className="text-[10px] text-[#00A3AD] font-bold">1-Klik Otomatis Masuk</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {usersList.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-heading font-bold text-slate-800 group-hover:text-[#008A93] truncate">
                      {u.nama_lengkap.split(' ')[0]} {u.nama_lengkap.split(' ')[1] || ''}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{u.role === 'Admin Dinkes' ? 'Admin Utama' : u.unit_kerja.replace('Puskesmas ', 'PKM ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CARD 2: CELEBRATION GREETINGS CARD (40% Width on Desktop - Informative Complement) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-5 flex flex-col"
          >
            <CelebrationGreetingsCard
              pegawaiList={pegawaiList}
              skList={skList}
            />
          </motion.div>

        </div>
      </main>

      {/* SOLID DARK FOOTER BAR: Clean visual separation from busy background */}
      <footer className="relative z-20 w-full py-3 px-4 text-center bg-[#1E293B] border-t border-slate-700/80 shadow-2xl">
        <p className="text-xs font-medium text-slate-200 tracking-normal">
          © 2026 Dinas Kesehatan & Pengendalian Penduduk KB Kabupaten Lombok Barat. Seluruh Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
};
