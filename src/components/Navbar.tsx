import React, { useState, useEffect } from 'react';
import { LogOut, User, ShieldCheck, Building, ChevronDown, Check, Download, Smartphone } from 'lucide-react';
import { LogoLombokBarat } from './LogoLombokBarat';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount;
  usersList: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  usersList,
  onSwitchUser,
  onLogout,
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isSuperAdmin = currentUser.role === 'Admin Dinkes';

  return (
    <nav className="bg-[#004B87] text-white px-3 md:px-6 py-2 min-h-16 flex items-center justify-between shrink-0 shadow-md border-b border-[#003663] z-30 font-body">
      <div className="flex items-center space-x-3">
        {/* Lombok Barat Official Coat of Arms Logo */}
        <div className="bg-white/15 p-1 rounded-xl backdrop-blur-xs border border-white/25 shadow-xs flex items-center justify-center shrink-0">
          <LogoLombokBarat size={38} />
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-heading font-extrabold text-base md:text-lg lg:text-xl tracking-tight text-white leading-tight">
            SIMORANG DINKES-PPKB
          </span>
          <span className="text-[10px] sm:text-[11px] md:text-xs text-blue-100 font-medium leading-tight line-clamp-1 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl">
            Sistem Monitoring Ruang Kepegawaian Dinas Kesehatan, Pengendalian Penduduk dan Keluarga Berencana
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* PWA Install Button if prompt is available */}
        {deferredPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallPWA}
            className="flex items-center space-x-1.5 bg-[#82BE00] hover:bg-[#6ea000] text-white px-2.5 py-1.5 rounded-xl text-xs font-heading font-bold shadow-xs transition-all cursor-pointer animate-pulse"
            title="Install SIMORANG DINKES-PPKB ke HP / Laptop Anda (PWA)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App PWA</span>
          </button>
        )}

        {/* Account Switcher Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl transition-all"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-xs ${
                isSuperAdmin ? 'bg-[#00A3AD]' : 'bg-[#003663]'
              }`}
            >
              {getInitials(currentUser.nama_lengkap)}
            </div>

            <div className="text-left hidden md:block">
              <div className="text-xs font-heading font-bold text-white flex items-center space-x-1">
                <span className="max-w-[150px] truncate">{currentUser.nama_lengkap}</span>
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A3AD]" />
                ) : (
                  <Building className="w-3.5 h-3.5 text-blue-200" />
                )}
              </div>
              <div className="text-[10px] text-blue-100 font-medium max-w-[170px] truncate">
                {currentUser.unit_kerja}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
          </button>

          {/* Dropdown Popover */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Sesi Pengguna Saat Ini
                </div>
                <div className="font-extrabold text-xs text-slate-900 mt-0.5">{currentUser.nama_lengkap}</div>
                <div className="text-[11px] font-bold text-blue-600 flex items-center space-x-1 mt-0.5">
                  {isSuperAdmin ? (
                    <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      Admin Dinkes (Super Admin)
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      Admin Unit Kerja
                    </span>
                  )}
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600 truncate">{currentUser.unit_kerja}</span>
                </div>
              </div>

              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                Ganti Akun Demo / Login Role
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {usersList.map((user) => {
                  const isSelected = user.id === currentUser.id;
                  const isUserSuper = user.role === 'Admin Dinkes';

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onSwitchUser(user);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200 text-blue-950 font-extrabold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            isUserSuper ? 'bg-purple-600' : 'bg-blue-600'
                          }`}
                        >
                          {getInitials(user.nama_lengkap)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{user.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {user.role} &bull; {user.unit_kerja}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  Kelola akun & unit kerja lengkap di menu Sidebar &quot;Manajemen User&quot;
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold border border-slate-700/60"
          title="Keluar Sistem"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </nav>
  );
};


