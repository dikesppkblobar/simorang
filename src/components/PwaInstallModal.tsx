import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  HardDrive
} from 'lucide-react';
import { LogoLombokBarat } from './LogoLombokBarat';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [activePlatform, setActivePlatform] = useState<'desktop' | 'mobile'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    isChrome: false,
    isEdge: false,
    isSafari: false,
    isWindows: false,
    isMac: false,
    isMobile: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const isWindows = /Windows/i.test(userAgent);
    const isMac = /Macintosh|Mac OS X/i.test(userAgent);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const isEdge = /Edg\//i.test(userAgent);
    const isChrome = /Chrome\//i.test(userAgent) && !isEdge;
    const isSafari = /Safari\//i.test(userAgent) && !isChrome && !isEdge;

    setBrowserInfo({
      isChrome,
      isEdge,
      isSafari,
      isWindows,
      isMac,
      isMobile,
    });

    if (isMobile) {
      setActivePlatform('mobile');
    } else {
      setActivePlatform('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      setIsInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#003663] text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="bg-white/15 p-2 rounded-xl border border-white/20 shadow-inner flex items-center justify-center">
              <LogoLombokBarat size={40} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold tracking-wide uppercase mb-1 border border-emerald-400/30">
                <Sparkles className="w-3 h-3" /> Progressive Web App (PWA)
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Download & Pasang SIMORANG
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Dinas Kesehatan & PPKB Kab. Lombok Barat
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Install Action Banner if prompt is available */}
          {deferredPrompt ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#004B87]/30 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#004B87] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-2.5">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm sm:text-base font-heading font-bold text-slate-800">
                Siap Dipasang Langsung ke Perangkat Anda!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Klik tombol di bawah untuk memasang aplikasi SIMORANG ke Desktop PC/Laptop atau Smartphone Anda dalam 1 detik.
              </p>
              <button
                type="button"
                onClick={handleTriggerNativeInstall}
                disabled={isInstalling}
                className="mt-3.5 inline-flex items-center justify-center gap-2 bg-[#82BE00] hover:bg-[#6ea000] active:scale-98 text-white px-6 py-2.5 rounded-xl font-heading font-extrabold text-sm shadow-md transition-all cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                {isInstalling ? 'Memproses Pemasangan...' : 'Pasang / Install Aplikasi Sekarang'}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-950">Aplikasi Siap Diinstal Menjadi Desktop App</div>
                <div className="text-emerald-800 mt-0.5">
                  Anda dapat menginstal SIMORANG di Windows, macOS, atau Linux menggunakan browser Chrome, Microsoft Edge, atau browser modern lainnya.
                </div>
              </div>
            </div>
          )}

          {/* Platform Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActivePlatform('desktop')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                activePlatform === 'desktop'
                  ? 'bg-white text-[#004B87] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Komputer / Desktop (PC & Laptop)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('mobile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                activePlatform === 'mobile'
                  ? 'bg-white text-[#004B87] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Smartphone (HP Android / iOS)</span>
            </button>
          </div>

          {/* Step-by-Step Instructions based on platform */}
          {activePlatform === 'desktop' ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cara Pasang di Desktop (Windows / Mac / Linux):
              </div>

              {/* Chrome / Edge Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#004B87]">
                  <Globe className="w-4 h-4" />
                  <span>Metode 1: Lewat Bilah Alamat Browser (Chrome & Edge)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                  <li>
                    Lihat bagian kanan bilah alamat (URL bar) di atas browser Anda.
                  </li>
                  <li>
                    Cari ikon <strong className="text-slate-800">Komputer dengan panah bawah</strong> atau <strong className="text-slate-800">"Instal SIMORANG"</strong> (di samping bintang bookmark).
                  </li>
                  <li>
                    Klik ikon tersebut lalu pilih <strong className="text-[#004B87]">"Instal"</strong>.
                  </li>
                  <li>
                    Aplikasi SIMORANG akan langsung terpasang di Desktop, Start Menu, dan Taskbar Windows/Mac Anda!
                  </li>
                </ol>
              </div>

              {/* Menu Browser Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Laptop className="w-4 h-4" />
                  <span>Metode 2: Lewat Menu Browser (Titik Tiga)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                  <li>
                    Klik menu <strong className="text-slate-800">Titik Tiga (⋮)</strong> di pojok kanan atas browser.
                  </li>
                  <li>
                    Pilih menu <strong className="text-slate-800">"Simpan dan bagikan"</strong> atau <strong className="text-slate-800">"Aplikasi / Apps"</strong>.
                  </li>
                  <li>
                    Klik <strong className="text-[#004B87]">"Instal SIMORANG..."</strong> atau <strong className="text-[#004B87]">"Instal situs ini sebagai aplikasi"</strong>.
                  </li>
                </ol>
              </div>

              {/* Keunggulan Desktop App */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 text-center">
                  <Zap className="w-4 h-4 text-[#004B87] mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800">Cepat & Ringan</div>
                  <div className="text-[10px] text-slate-500">Membuka langsung tanpa tab browser</div>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 text-center">
                  <HardDrive className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800">Hemat Memori</div>
                  <div className="text-[10px] text-slate-500">Ukuran file sangat kecil (&lt; 2 MB)</div>
                </div>
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 text-center">
                  <ShieldCheck className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800">Aman & Terkini</div>
                  <div className="text-[10px] text-slate-500">Otomatis sinkron dengan server BKD</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cara Pasang di HP (Android & iPhone):
              </div>

              {/* Android Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Untuk Android (Chrome)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka menu titik tiga di browser Chrome, lalu pilih <strong className="text-slate-800">"Instal aplikasi"</strong> atau <strong className="text-slate-800">"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>

              {/* iOS Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Untuk iPhone / iPad (Safari)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tekan tombol <strong className="text-slate-800">Share / Bagikan (kotak panah ke atas)</strong> di bilah bawah Safari, gulir ke bawah lalu pilih <strong className="text-slate-800">"Add to Home Screen (Tambah ke Layar Utama)"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            SIMORANG PWA Standalone Engine v2.5
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
