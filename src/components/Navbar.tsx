import React, { useState, useEffect } from 'react';
import { LogOut, Smartphone, ShieldCheck, Building2, User } from 'lucide-react';
import { LogoLombokBarat } from './LogoLombokBarat';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount;
  usersList?: UserAccount[];
  onSwitchUser?: (user: UserAccount) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
}) => {
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
    if (!name) return 'U';
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

        {/* User Identity Display Badge */}
        <div className="flex items-center space-x-2.5 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs">
          <div className="relative">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-xs ${
                isSuperAdmin ? 'bg-[#00A3AD]' : 'bg-[#003663]'
              }`}
            >
              {getInitials(currentUser.nama_lengkap || currentUser.username)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#004B87] rounded-full"></span>
          </div>

          <div className="text-left leading-tight max-w-[130px] sm:max-w-[170px] md:max-w-[220px]">
            <div className="text-xs font-heading font-bold text-white flex items-center space-x-1 truncate">
              <span className="truncate">{currentUser.nama_lengkap || currentUser.username}</span>
              {isSuperAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" title="Super Admin DINKES" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-blue-200 shrink-0" title="Admin Unit Kerja" />
              )}
            </div>
            <div className="text-[10px] text-blue-100 font-medium truncate flex items-center gap-1 mt-0.5">
              <span className="truncate">{currentUser.unit_kerja || 'Dinas Kesehatan'}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="px-2.5 sm:px-3 py-1.5 hover:bg-rose-600/20 active:bg-rose-600/30 rounded-xl text-rose-200 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold border border-rose-400/30 hover:border-rose-400/60 shadow-xs cursor-pointer"
          title="Keluar dari Sistem"
        >
          <LogOut className="w-4 h-4 text-rose-300" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </nav>
  );
};


