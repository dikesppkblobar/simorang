import React from 'react';
import { BarChart3, Users, Calendar, FolderOpen, Menu, AppWindow, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMenuDrawer: () => void;
  isMobileDrawerOpen: boolean;
  alertsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMenuDrawer,
  isMobileDrawerOpen,
  alertsCount,
}) => {
  const isOtherTabActive = ['settings', 'aplikasi', 'users', 'export'].includes(activeTab);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: null,
      onClick: () => onTabChange('dashboard'),
      isActive: activeTab === 'dashboard',
    },
    {
      id: 'pegawai',
      label: 'Pegawai',
      icon: Users,
      badge: null,
      onClick: () => onTabChange('pegawai'),
      isActive: activeTab === 'pegawai',
    },
    {
      id: 'alerts',
      label: 'Pemantauan',
      icon: Calendar,
      badge: alertsCount > 0 ? alertsCount : null,
      onClick: () => onTabChange('alerts'),
      isActive: activeTab === 'alerts',
    },
    {
      id: 'arsip',
      label: 'Arsip SK',
      icon: FolderOpen,
      badge: null,
      onClick: () => onTabChange('arsip'),
      isActive: activeTab === 'arsip',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      badge: null,
      onClick: onOpenMenuDrawer,
      isActive: isMobileDrawerOpen || isOtherTabActive,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 select-none"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
                active
                  ? 'text-[#004B87] font-bold bg-blue-50/70'
                  : 'text-slate-500 hover:text-slate-800 active:scale-95 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge for Alerts / Notifications */}
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight leading-none mt-1 truncate max-w-full ${
                  active ? 'font-extrabold text-[#004B87]' : 'font-semibold'
                }`}
              >
                {item.label}
              </span>

              {/* Active Dot Indicator */}
              {active && (
                <span className="w-1 h-1 bg-[#004B87] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
