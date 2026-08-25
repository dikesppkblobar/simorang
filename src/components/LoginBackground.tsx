import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Corporate Blue & Soft Cyan Gradient Layer */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #072545 0%, #0A3D6E 35%, #004B87 70%, #006B7D 100%)',
        }}
      />

      {/* 2. Canva Giri Menang Lombok Barat Embedded Background (if available) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
  <img
    src="/bg-login.webp"
    alt="Background Login SIMORANG"
    className="w-full h-full object-cover object-center"
    loading="eager" // Memuat gambar utama login lebih awal secara prioritas
  />
</div>

      {/* 3. Dark Overlay (35-40% opacity) + Subtle Blur to ensure high contrast and readable text */}
      <div className="absolute inset-0 w-full h-full bg-slate-950/45 backdrop-blur-[1.5px]" />

      {/* 4. Subtle Clean Geometric / Medical Grid Pattern */}
      <div
        className="absolute inset-0 w-full h-full opacity-10"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), radial-gradient(rgba(0, 210, 220, 0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* 5. Subtle Ambient Light Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
    </div>
  );
};

