import React from 'react';
import { LogOut, ShieldCheck, Building2 } from 'lucide-react';
import { LogoLombokBarat } from './LogoLombokBarat';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount;
  usersList?: UserAccount[];
  onSwitchUser?: (user: UserAccount) => void;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
}) => {
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
    <nav className="bg-[#004B87] text-white px-3 sm:px-4 md:px-6 py-2.5 min-h-14 sm:min-h-16 flex items-center justify-between shrink-0 shadow-md border-b border-[#003663] z-30 font-body relative">
      {/* Left: Logo + App Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Lombok Barat Official Coat of Arms Logo */}
        <div className="bg-white/15 p-1 rounded-xl backdrop-blur-xs border border-white/25 shadow-xs flex items-center justify-center shrink-0">
          <LogoLombokBarat size={32} />
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-heading font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight text-white leading-tight truncate">
              SIMORANG DINKES-PPKB
            </span>
            <span className="hidden sm:inline-block bg-[#82BE00] text-[#003663] font-heading font-extrabold text-[9px] px-1.5 py-0.2 rounded font-bold">
              v2.5
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] md:text-xs text-blue-100 font-medium leading-tight truncate hidden sm:block max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl">
            Sistem Monitoring Ruang Kepegawaian Dinkes-PPKB Kab. Lombok Barat
          </span>
          <span className="text-[9px] text-blue-100/90 font-medium leading-tight truncate sm:hidden">
            Dinas Kesehatan Kab. Lombok Barat
          </span>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {/* User Identity Display Badge */}
        <div className="flex items-center space-x-2 bg-white/10 border border-white/20 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-xl shadow-xs">
          <div className="relative shrink-0">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-white shadow-xs ${
                isSuperAdmin ? 'bg-[#00A3AD]' : 'bg-[#003663]'
              }`}
            >
              {getInitials(currentUser.nama_lengkap || currentUser.username)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-[#004B87] rounded-full"></span>
          </div>

          <div className="text-left leading-tight hidden sm:block max-w-[110px] md:max-w-[170px] lg:max-w-[220px]">
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
          className="p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-rose-600/30 active:bg-rose-600/40 rounded-xl text-rose-200 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold border border-rose-400/30 hover:border-rose-400/60 shadow-xs cursor-pointer"
          title="Keluar dari Sistem"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-300" />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </nav>
  );
};


